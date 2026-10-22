# waktusolat.me

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)

In the name of Allah, the gracious, the merciful.
This is waktusolat.me frontend and backend. Only serves prayer time for Malaysian districts. Currently not thinking of supporting other places.

## 🚀 Quick Start

### Prerequisites
- [Bun](https://bun.sh) installed
- [Docker](https://www.docker.com/) (optional, for containerization)

### Local Development
```bash
# Install server + client dependencies
bun run install-all

# Fetch this year's prayer times from JAKIM into data/times/ (optional —
# the server also fills missing zones in the background ~5s after start)
bun run get-times

# Start client (Vite) + server (watch mode)
bun dev

# Run the test suite
bun run test
```

### Configuration

Set in `.env` (Bun loads it automatically) or the container environment. See `.env.example`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `5000` | HTTP port |
| `DB_PATH` | `./db/visitors.sqlite` | sqlite visitor DB |
| `ADMIN_API_KEY` | _(empty)_ | Secret for admin routes, sent as `x-api-key`. Empty = admin routes always `401`. Generate with `openssl rand -hex 32`. |
| `TZ` | — | Must be `Asia/Kuala_Lumpur`: "today" is resolved in local time (the Docker image sets it). |
| `NODE_ENV` | `production` | `production` disables the GraphQL playground |

### Docker

```bash
cp .env.example .env   # set ADMIN_API_KEY
docker compose up -d --build
```

Then open http://localhost:5000. The compose file publishes the port on `127.0.0.1` only and persists two directories:

| Host | Container | Contents |
| --- | --- | --- |
| `./storage` | `/app/storage` | sqlite visitor DB (`DB_PATH=/app/storage/visitors.sqlite`) |
| `./data/times` | `/app/data/times` | prayer times fetched from JAKIM |

Do **not** bind-mount `./db` or `./data` as a whole: they contain code (`db/db.js`, `data/getter.js`) and tracked Quran/hadith JSON.

> **Upgrading from ≤ 2.1.0 compose:** the visitor DB moved from `./db/visitors.sqlite` to `./storage/visitors.sqlite`. Move it before starting the new container: `mkdir -p storage && mv db/visitors.sqlite storage/`.

### Production behind Traefik

Production runs the published image (`calypso666/waktusolat.me`) behind Traefik, from a compose file on the server. That service needs the same environment and volumes as `docker-compose.yml`. The router and network labels below are placeholders — keep your existing ones:

```yaml
  waktusolat.me:
    image: calypso666/waktusolat.me:latest
    restart: unless-stopped
    environment:
      - TZ=Asia/Kuala_Lumpur
      - DB_PATH=/app/storage/visitors.sqlite
      - ADMIN_API_KEY=${WAKTUSOLAT_ADMIN_API_KEY}   # from the server's .env
    volumes:
      - ./waktusolat/storage:/app/storage
      - ./waktusolat/data/times:/app/data/times
    # No `ports:` — Traefik reaches the container over the docker network.
    labels:
      - traefik.enable=true
      - traefik.http.routers.waktusolat.rule=Host(`waktusolat.me`)
      - traefik.http.services.waktusolat.loadbalancer.server.port=5000
```

Notes:
- **Client IPs.** The app takes the client IP from the **last** `X-Forwarded-For` hop (the one Traefik appends), and only when the connection comes from a private/loopback address (Traefik on the docker network). A connection from a public address uses its own socket address and can't spoof the header. So don't publish the container port to the internet.
- **Secrets.** Keep `ADMIN_API_KEY` in the server's environment, not in the image. CI writes `.env` into the build context (staging workflow), and anything in that file ends up in the published image.
- **Prayer data.** Zone files are fetched from JAKIM at runtime, never at build time. The server checks every 6 hours and refetches any zone whose data no longer covers today. JAKIM publishes one year at a time, so for a day or two around 1 January the last known day is served until the new year is published.

## 📺 Paparan TV (mosque TV display)

A full-screen prayer-time display for a mosque or surau TV, free to use: open `https://waktusolat.me/tv/<zone>` in the TV's browser (zone codes below, e.g. `wly01`).

```
/tv/wly01?nama=Masjid%20Al-Ikhlas&iqamah=10,10,10,5,10&jumaat=30&solat=10
```

| Parameter | Meaning | Default |
| --- | --- | --- |
| `nama` | Mosque name, shown in the header | none |
| `iqamah` | Minutes from azan to iqamah, five numbers in the order Subuh, Zohor, Asar, Maghrib, Isyak | `10,10,10,10,10` |
| `jumaat` | Minutes from the Zohor azan to iqamah on Fridays | `30` |
| `solat` | Minutes the "solat in progress" screen stays up after iqamah | `10` |

What it does: a large countdown to the next azan, then to iqamah, a dim screen during solat, all seven times with the next one lit, and a day track with the sun. Verses and hadith rotate along the bottom. It runs on the server-corrected time (a wrong TV clock or timezone does not matter), keeps the screen awake where the browser allows, shifts a few pixels over time against burn-in, and reloads itself once a day at 03:00 (only when the server answers). After one online load it also boots with the network off: prayer times are cached in the browser and a small service worker (`/tv-sw.js`, scope `/tv/` only) keeps the app files. Landscape only; a phone held upright gets a link to the normal page instead.

Screenshots of every state: `node scripts/tv-shots.mjs` (needs `bun dev` running and `playwright-core`).

# 🔗 API Endpoints

Base URL: `/api/v1`. GraphQL is at `/graphql` (playground enabled outside production).

## 📖 Quran Endpoints

GET /quran : lists all surah in Al Quran\
GET /quran/en/(surah number) : displays surah in english language\
GET /quran/my/(surah number) : displays surah in malay language\
GET /quran/en/(surah number)/(ayat number) : displays ayat in surah in english language\
GET /quran/my/(surah number)/(ayat number) : displays ayat in surah in malay language\
GET /quran/random : displays random ayat in english and malay language (not cached). Optional `?max=180`: only ayat whose Malay translation fits in that many characters

## 📚 Hadith Endpoints

GET /hadis : lists available hadith books\
GET /hadis/(book) : displays a random hadith from the book, with its reference (`kitab`, `id`) (not cached). Optional `?max=180`: only hadith that fit in that many characters

## ⏰ Prayer Times Endpoints

GET /waktusolat/today/(zone) : displays prayer time for today (and tomorrow) for the zone\
GET /waktusolat/week/(zone) : displays prayer time for the next 7 days for the zone\
GET /waktusolat/month/(zone) : displays prayer time for the month for the zone\
GET /waktusolat/year/(zone) : displays prayer time for the year for the zone

Unknown zone or period → `400`. A zone with no data yet (e.g. right after a fresh deploy, before the background fetch finishes) → `404`.

## 🕌 Mosque Endpoints

A mosque's TV settings, saved under a random id (no accounts; see `SPEC-mosque-registry.md`).

POST /mosques : register a mosque. Body `{ "name", "zone", "iqamah"?, "jumaat"?, "solat"? }` (iqamah: all five prayers, 0-60 min each; jumaat 0-90; solat 1-60). Returns the settings, the TV path `/m/(id)`, and an edit token **shown only once**. Limited to 5 per IP per hour and 500 per day in total\
GET /mosques/(id) : public settings (never the token). Sends an `ETag`; `If-None-Match` gets a `304`\
PATCH /mosques/(id) : change any of the fields above. Needs `Authorization: Bearer (token)`\
POST /mosques/(id)/token : replace a leaked token; the old one stops working. Needs the current token\
DELETE /mosques/(id) : remove a mosque, with its token or `x-api-key: (ADMIN_API_KEY)`

Invalid input → `400 { message, field }`. Wrong or missing token → `401`. Unknown id → `404`. Only the token's sha256 is stored, and nothing about who registered.

**Programmes** (kuliah, classes; see `SPEC-programmes.md`). Writes need the mosque's token:

GET /mosques/(id)/programmes : all of the mosque's programmes\
GET /mosques/(id)/programmes/upcoming : occurrences in the next 7 days (Malaysia dates), for the TV. `ETag` changes with any edit and when the day turns\
POST /mosques/(id)/programmes : add one: `{ "title", "speaker"?, "note"?, "repeat": "once", "date": "YYYY-MM-DD", "at" }` or `{ …, "repeat": "weekly", "weekday": 0-6, "from"?, "until"?, "skip"?: [dates], "at" }`, where `at` is `{ "time": "21:00" }` or `{ "after": "maghrib" }`. At most 50 per mosque\
PATCH /mosques/(id)/programmes/(pid) : change any of those fields\
DELETE /mosques/(id)/programmes/(pid) : remove it\
PUT /mosques/(id)/programmes/(pid)/photo : the speaker's photo, as JPEG bytes (`content-type: image/jpeg`), at most 200 KB and 64-1200 px a side. EXIF (including GPS location) and other metadata are stripped. 30 uploads per IP per hour\
DELETE /mosques/(id)/programmes/(pid)/photo : remove the photo\
GET /mosques/(id)/programmes/(pid)/photo : the photo (its URL is in the programme's `photo` field)

## 🛠️ Other Endpoints

GET /visitors/stats : anonymized visit counts (refreshed at most once a minute)\
GET /cache : response-cache statistics\
GET /healthcheck : liveness probe (`{"ok":true}`)\
GET /time : server time as `{"now": <epoch ms>, "tz": "Asia/Kuala_Lumpur"}` (not cached; the TV display uses it to correct a wrong device clock)

## 🔐 Admin Endpoints

Require the header `x-api-key: <ADMIN_API_KEY>`; otherwise `401`.

GET /visitors?limit=500&offset=0 : raw visitor log, newest first (`limit` max 5000)\
POST /cache/invalidate : clear the response cache

```bash
curl -H "x-api-key: $ADMIN_API_KEY" "https://waktusolat.me/api/v1/visitors?limit=50"
curl -X POST -H "x-api-key: $ADMIN_API_KEY" https://waktusolat.me/api/v1/cache/invalidate
```

## 🚦 Limits

- **Rate limit:** 100 requests per minute per client IP → `429`.
- **Request body:** 1 MiB max → `413`.
- **Chat (socket.io):**
  - messages up to 1000 characters;
  - per connection, a burst of 5 messages, then 1 per second;
  - typing notices at most once per second;
  - names up to 30 characters.

# 📍 Zone Codes

1. Kedah\
   KDH01 = KOTA SETAR, POKOK SENA DAN KUBANG PASU\
   KDH02 = KUALA MUDA, PENDANG DAN YAN\
   KDH03 = PADANG TERAP DAN SIK\
   KDH04 = BALING\
   KDH05 = KULIM DAN BANDAR BAHARU\
   KDH06 = LANGKAWI\
   KDH07 = GUNUNG JERAI

2. Melaka\
   MLK01 = SELURUH NEGERI MELAKA

3. Negeri Sembilan\
   NGS01 = JEMPOL DAN TAMPIN\
   NGS02 = PORT DICKSON, SEREMBAN, KUALA PILAH, JELEBU DAN REMBAU

4. Pahang\
   PHG01 = PULAU TIOMAN\
   PHG02 = ROMPIN, PEKAN, MUADZAM SHAH DAN KUANTAN\
   PHG03 = MARAN, CHENOR, TEMERLOH, BERA, JENGKA DAN JERANTUT\
   PHG04 = BENTONG, RAUB DAN LIPIS\
   PHG05 = BUKIT TINGGI, GENTING SEMPAH, DAN JANDA BAIK\
   PHG06 = CAMERON HIGHLANDS, BUKIT FRASER DAN GENTING HIGHLANDS

5. Perak\
   PRK01 = TAPAH, SLIM RIVER DAN TANJUNG MALIM\
   PRK02 = IPOH, BATU GAJAH, KAMPAR, SG. SIPUT DAN KUALA KANGSAR\
   PRK03 = PENGKALAN HULU, GERIK DAN LENGGONG\
   PRK04 = TEMENGOR DAN BELUM\
   PRK05 = TELUK INTAN, BAGAN DATUK, KG. GAJAH, SERI ISKANDAR, BERUAS, PARIT, LUMUT, SITIAWAN DAN PULAU PANGKOR.\
   PRK06 = SELAMA, TAIPING, BAGAN SERAI DAN PARIT BUNTAR\
   PRK07 = BUKIT LARUT

6. Perlis\
   PLS01 = SELURUH NEGERI PERLIS

7. Pulau Pinang\
   PNG01 = SELURUH NEGERI PULAU PINANG

8. Selangor\
   SGR01 = HULU SELANGOR, GOMBAK, PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG\
   SGR02 = SABAK BERNAM DAN KUALA SELANGOR\
   SGR03 = KLANG DAN KUALA LANGAT

9. Terengganu\
   TRG01 = KUALA TERENGGANU, MARANG DAN KUALA NERUS\
   TRG02 = BESUT DAN SETIU\
   TRG03 = HULU TERENGGANU\
   TRG04 = DUNGUN DAN KEMAMAN

10. Johor\
    JHR01 = PULAU AUR DAN PULAU PEMANGGIL\
    JHR02 = KOTA TINGGI, MERSING DAN JOHOR BAHRU\
    JHR03 = KLUANG DAN PONTIAN\
    JHR04 = BATU PAHAT, MUAR, SEGAMAT DAN GEMAS JOHOR

11. Kelantan\
    KTN01 = JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT , PASIR MAS, TANAH MERAH, MACHANG KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)\
    KTN03 = JAJAHAN JELI, GUA MUSANG (DAERAH GALAS DAN BERTAM) DAN JAJAHAN KECIL LOJING — **currently not served**: JAKIM e-Solat returns no record for KTN03

12. Sabah\
    SBH01 = BAHAGIAN SANDAKAN (TIMUR) BANDAR SANDAKAN, BUKIT GARAM, SEMAWANG, TEMANGGONG DAN TAMBISAN\
    SBH02 = BAHAGIAN SANDAKAN (BARAT) PINANGAH, TERUSAN, BELURAN, KUAMUT DAN TELUPID\
    SBH03 = BAHAGIAN TAWAU (TIMUR) LAHAD DATU, KUNAK, SILABUKAN, TUNGKU, SAHABAT, DAN SEMPORNA\
    SBH04 = BAHAGIAN TAWAU (BARAT), BANDAR TAWAU, BALONG, MEROTAI DAN KALABAKAN\
    SBH05 = BAHAGIAN KUDAT KUDAT, KOTA MARUDU, PITAS DAN PULAU BANGGI\
    SBH06 = GUNUNG KINABALU\
    SBH07 = BAHAGIAN PANTAI BARAT KOTA KINABALU, PENAMPANG, TUARAN, PAPAR, KOTA BELUD, PUTATAN DAN RANAU\
    SBH08 = BAHAGIAN PEDALAMAN (ATAS) PENSIANGAN, KENINGAU, TAMBUNAN DAN NABAWAN\
    SBH09 = BAHAGIAN PEDALAMAN (BAWAH) SIPITANG, MEMBAKUT, BEAUFORT, KUALA PENYU, WESTON, TENOM DAN LONG PA SIA

13. Sarawak\
    SWK01 = LIMBANG, SUNDAR, TRUSAN DAN LAWAS\
    SWK02 = NIAH, SIBUTI, MIRI, BEKENU DAN MARUDI\
    SWK03 = TATAU, SUAI, BELAGA, PANDAN, SEBAUH, BINTULU\
    SWK04 = IGAN, KANOWIT, SIBU, DALAT, OYA, BALINGIAN, MUKAH, KAPIT DAN SONG\
    SWK05 = BELAWAI, MATU, DARO, SARIKEI, JULAU, BINTANGOR DAN RAJANG\
    SWK06 = KABONG, LINGGA, SRI AMAN, ENGKELILI, BETONG, SPAOH, PUSA, SARATOK, ROBAN, DEBAK DAN LUBOK ANTU\
    SWK07 = SAMARAHAN, SIMUNJAN, SERIAN, SEBUYAU DAN MELUDAM\
    SWK08 = KUCHING, BAU, LUNDU DAN SEMATAN\
    SWK09 = KAMPUNG PATARIKAN

14. Wilayah Persekutuan\
    WLY01 = KUALA LUMPUR DAN PUTRAJAYA\
    WLY02 = LABUAN

# 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

# 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.