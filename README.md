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
# Install dependencies
bun install

# Start the server
bun dev
```

### Docker Deployment

```bash
# Build the image
docker build -t waktusolat .

# Run the container
docker run -p 3000:3000 -d waktusolat
```

Then point your browser to localhost:3000

# 🔗 API Endpoints

Base URL: /api/v1

## 📖 Quran Endpoints

GET /quran : lists all surah in Al Quran\
GET /quran/en/(surah number) : displays surah in english language\
GET /quran/my/(surah number) : displays surah in malay language\
GET /quran/en/(surah number)/(ayat number) : displays ayat in surah in english language\
GET /quran/my/(surah number)/(ayat number) : displays ayat in surah in malay language\
GET /quran/random : displays random ayat in english and malay language

## ⏰ Prayer Times Endpoints

GET /waktusolat/today/(zone) : displays prayer time for the week for the zone\
GET /waktusolat/week/(zone) : displays prayer time for the week for the zone\
GET /waktusolat/month/(zone) : displays prayer time for the month for the zone\
GET /waktusolat/year/(zone) : displays prayer time for the year for the zone

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
    KTN03 <- (THIS IS NOT A TYPO) = JAJAHAN JELI, GUA MUSANG (DAERAH GALAS DAN BERTAM) DAN JAJAHAN KECIL LOJING

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