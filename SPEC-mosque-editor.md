# Spec: `mosque-editor`

Module 4 of the [capability map](CAPABILITY-MAP.md). Status: **draft, awaiting owner approval**.

## Objective

The phone page where a mosque's AJK sets up their TV: register the mosque, set its iqamah times, keep its programme list (with the ustaz's photo), and share the TV link. It's built on the `mosque-registry` and `programmes` APIs. No new backend work, except anything a review finds missing.

**Who uses it:** usually one or two AJK members, on a phone, often older, typing Malay. They do it once, then return weekly or monthly to change programmes. No accounts: **the edit link is the key** (see the registry spec).

**The page's one question:** *"What will the TV show this week, and how do I change it?"*

**User stories / acceptance**
1. **Register:** `/m/baru` asks for the mosque's name and zone (the same zone search as `/`). It creates the mosque and shows **"Simpan pautan edit ini"**: the edit link with Copy and WhatsApp share buttons, plus the TV link. The edit link is shown once by the server, and the page says so plainly.
2. **Open the editor:** `/m/:id/edit#k=<token>` opens the editor.
   - The page remembers the token **on this phone** (`localStorage`), then removes `#k=…` from the address bar, so a screenshot or a shared tab doesn't leak it.
   - A wrong or rotated token gives "Pautan edit ini tidak sah lagi", with what to do next.
3. **My mosques:** `/m/baru` also lists the mosques this phone already manages ("Masjid anda di telefon ini"), each opening its editor without the link. There's a "Lupakan di telefon ini" option to forget one.
4. **Settings:**
   - name and zone
   - iqamah minutes per prayer (five steppers, 0–60)
   - Jumaat minutes (0–90)
   - solat-screen minutes (1–60)
   Saved with one button, which shows "Disimpan" or the server's message beside the field it names.
5. **Programmes:**
   - **"Minggu ini" first:** the next 7 days as the TV will show them (the upcoming feed), with clock times and "selepas Maghrib (7:01 ptg)" resolved from the zone's real prayer times.
   - **All programmes below:** weekly ones by day, then one-offs by date.
   - **Add or edit** in a bottom sheet: title, speaker, note, once (date) or weekly (day, optional from/until), and the time as a clock time or "selepas {prayer}".
   - **"Cuti minggu ini"** on a weekly programme adds its next date to the skip list in one tap, and **"Batal cuti"** removes it.
   - **Delete** asks once ("Padam program ini?").
6. **Ustaz photo:**
   - "Tambah gambar" opens the phone's camera or gallery.
   - The page crops it to a centred square (the face is usually centred in a portrait shot) and shrinks it to 600×600 JPEG in the browser, so a 5 MB phone photo uploads as about 60 KB.
   - The photo is shown on the programme, with "Tukar" and "Buang".
   - One line: "Pastikan anda mendapat izin penceramah untuk memaparkan gambar beliau."
7. **TV link:**
   - the TV link (`waktusolat.me/m/:id`) in large type, easy to type on a TV remote, with Copy and "Buka" buttons
   - a short how-to: open it in the TV's browser, landscape, leave it on
8. **Security:**
   - "Tukar pautan edit" (rotate) shows the new link the same way as on registration, and warns that the old one stops working.
   - "Padam masjid ini" asks the AJK to type the mosque's name to confirm. It removes the mosque, its programmes and photos.
9. **Entry point:** `/about`'s TV section gets a "Daftar masjid anda" button to `/m/baru`. Nothing else in the site changes.

**Not in this module:** the TV page `/m/:id` (`tv-mosque-mode`; until it exists, "Buka" opens `/tv/:zone` with the mosque's settings in the URL); a QR code (see Open questions); accounts and recovery; multiple editors with separate links; posters; English.

## Design

- **The site's own style:** the revamp's tokens, light and dark, Inter, the bottom bar on phones, 17px body, 48px tap targets. It's an app screen, so the taste skill's app-screen rules apply (`inspect.mjs --app`). The draw isn't redone; it reuses the site's sheet.
- **Phone first:** one column. Settings, Programmes, TV link and Security are sections on one page, with a sticky in-page tab row (Program · Tetapan · TV · Keselamatan). It opens on Program, since that is the weekly job.
- **The week preview is the signature:** "Minggu ini" looks like a small version of the TV banner (title, speaker, photo, when), so the AJK sees what the hall will see.
- **Forms:** native inputs (`type=date`, `type=time`, `select`), labels above fields, errors in words beside the field, never only in colour. Steppers for minutes, not free text.
- **Saving:**
  - Settings save explicitly.
  - A programme saves when its sheet is closed with "Simpan".
  - Photos upload as soon as they're chosen, with progress shown.
  - Nothing is lost on a failed save: the sheet stays open with the message.

## Code layout

```
client/src/pages/MosqueNew.jsx         /m/baru: register, then the "save this link" screen; my mosques
client/src/pages/MosqueEditor.jsx      /m/:id/edit: the sections
client/src/mosque/ProgrammeSheet.jsx   add/edit sheet
client/src/mosque/WeekPreview.jsx      "Minggu ini", resolving "selepas …" with lib/waktu
client/src/mosque/LinkCard.jsx         a link with Copy / WhatsApp / Buka
client/src/lib/mosqueApi.js            fetch wrappers (Bearer token), error shape
client/src/lib/mosqueKeys.js           token memory per mosque, fragment read + strip (pure, tested)
client/src/lib/photo.js                crop + resize + JPEG encode (canvas)
client/src/lib/programmeText.js        "Setiap Isnin, selepas Maghrib", "Sabtu 31 Okt, 9:00 mlm" (pure, tested)
tests/mosque-editor-lib.test.js
```

Both pages are lazy-loaded routes. The main bundle grows by under 1 KB (the route entries only).

## Testing

- **Unit (`bun test`):** fragment parsing and stripping, token memory (and when storage is blocked), the programme wording in Malay for every kind, the "selepas …" resolution from a day's times, and next-occurrence for "Cuti minggu ini".
- **Browser (Playwright, scratch script; not in the repo's test run):**
  - the full journey on a 390×844 phone: register → save link → add a weekly programme → upload a photo made in the browser → "Cuti minggu ini" → rotate → delete
  - the same at 1440 wide
  - light and dark
- **Taste inspector `--app`:** no FAIL, or each one defended in one line.
- **Regressions:** existing pages are unchanged apart from the `/about` button (screenshot diff), and `bun test` plus Biome are green.

## Boundaries
- **Always:**
  - keep the token out of URLs after load, out of logs and out of `Referer` (`rel=noreferrer` on outgoing links)
  - every server error shown in words
  - test the pure pieces
- **Ask first:** new dependencies (QR code), any backend change, adding the editor to the main navigation.
- **Never:** send the token anywhere but the API's `Authorization` header, or upload an un-resized original photo.

## Success criteria
1. All nine user stories work in the browser journey on a phone, in both themes.
2. After load, the token appears in no address bar, link, `Referer` or server log (checked in the journey).
3. A 4000×3000 photo uploads as a JPEG of at most 600×600 and under 200 KB.
4. Unit tests and Biome are green; the main bundle grows by under 1 KB gzip; no new dependency (unless the QR question says yes).

## Open questions
1. **QR code:** the map mentions one. A TV can't scan a code, so it would only help to pass the **edit** link from one AJK's phone to another, and WhatsApp share already does that. I propose **no QR** for now (it would also be the first new dependency). OK?
2. **Where to register:** I propose `/m/baru`, reached from `/about` only (not the bottom bar), so the jemaah's site stays as it is. OK, or do you want it more visible?
3. **The photo crop:** an automatic centred square. Or do you want the AJK to drag the crop? That's more work and more to get wrong on a small screen. I lean automatic for now.
