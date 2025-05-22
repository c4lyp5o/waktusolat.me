import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { holyQuran: quranmy } = require('../data/quran/quran_id.json');
const { holyQuran: quranen } = require('../data/quran/quran_en.json');
const bukhari = require('../data/hadith/sahih-bukhari.json');
const muslim = require('../data/hadith/sahih-muslim.json');
const abu_daud = require('../data/hadith/sunan-abu-daud.json');
const nasai = require('../data/hadith/sunan-al-nasai.json');
const tirmizi = require('../data/hadith/sunan-al-tirmizi.json');
const ibnu_majah = require('../data/hadith/sunan-ibnu-majah.json');
const { prayerTime: kedah01 } = require('../data/times/kdh01.json');
const { prayerTime: kedah02 } = require('../data/times/kdh02.json');
const { prayerTime: kedah03 } = require('../data/times/kdh03.json');
const { prayerTime: kedah04 } = require('../data/times/kdh04.json');
const { prayerTime: kedah05 } = require('../data/times/kdh05.json');
const { prayerTime: kedah06 } = require('../data/times/kdh06.json');
const { prayerTime: kedah07 } = require('../data/times/kdh07.json');
const { prayerTime: melaka01 } = require('../data/times/mlk01.json');
const { prayerTime: negeriSembilan01 } = require('../data/times/ngs01.json');
const { prayerTime: negeriSembilan02 } = require('../data/times/ngs02.json');
const { prayerTime: pahang01 } = require('../data/times/phg01.json');
const { prayerTime: pahang02 } = require('../data/times/phg02.json');
const { prayerTime: pahang03 } = require('../data/times/phg03.json');
const { prayerTime: pahang04 } = require('../data/times/phg04.json');
const { prayerTime: pahang05 } = require('../data/times/phg05.json');
const { prayerTime: pahang06 } = require('../data/times/phg06.json');
const { prayerTime: perak01 } = require('../data/times/prk01.json');
const { prayerTime: perak02 } = require('../data/times/prk02.json');
const { prayerTime: perak03 } = require('../data/times/prk03.json');
const { prayerTime: perak04 } = require('../data/times/prk04.json');
const { prayerTime: perak05 } = require('../data/times/prk05.json');
const { prayerTime: perak06 } = require('../data/times/prk06.json');
const { prayerTime: perak07 } = require('../data/times/prk07.json');
const { prayerTime: perlis01 } = require('../data/times/pls01.json');
const { prayerTime: penang01 } = require('../data/times/png01.json');
const { prayerTime: selangor01 } = require('../data/times/sgr01.json');
const { prayerTime: selangor02 } = require('../data/times/sgr02.json');
const { prayerTime: selangor03 } = require('../data/times/sgr03.json');
const { prayerTime: terengganu01 } = require('../data/times/trg01.json');
const { prayerTime: terengganu02 } = require('../data/times/trg02.json');
const { prayerTime: terengganu03 } = require('../data/times/trg03.json');
const { prayerTime: terengganu04 } = require('../data/times/trg04.json');
const { prayerTime: johor01 } = require('../data/times/jhr01.json');
const { prayerTime: johor02 } = require('../data/times/jhr02.json');
const { prayerTime: johor03 } = require('../data/times/jhr03.json');
const { prayerTime: johor04 } = require('../data/times/jhr04.json');
const { prayerTime: kelantan01 } = require('../data/times/ktn01.json');
const { prayerTime: kelantan02 } = require('../data/times/ktn03.json');
const { prayerTime: sabah01 } = require('../data/times/sbh01.json');
const { prayerTime: sabah02 } = require('../data/times/sbh02.json');
const { prayerTime: sabah03 } = require('../data/times/sbh03.json');
const { prayerTime: sabah04 } = require('../data/times/sbh04.json');
const { prayerTime: sabah05 } = require('../data/times/sbh05.json');
const { prayerTime: sabah06 } = require('../data/times/sbh06.json');
const { prayerTime: sabah07 } = require('../data/times/sbh07.json');
const { prayerTime: sabah08 } = require('../data/times/sbh08.json');
const { prayerTime: sabah09 } = require('../data/times/sbh09.json');
const { prayerTime: sarawak01 } = require('../data/times/swk01.json');
const { prayerTime: sarawak02 } = require('../data/times/swk02.json');
const { prayerTime: sarawak03 } = require('../data/times/swk03.json');
const { prayerTime: sarawak04 } = require('../data/times/swk04.json');
const { prayerTime: sarawak05 } = require('../data/times/swk05.json');
const { prayerTime: sarawak06 } = require('../data/times/swk06.json');
const { prayerTime: sarawak07 } = require('../data/times/swk07.json');
const { prayerTime: sarawak08 } = require('../data/times/swk08.json');
const { prayerTime: sarawak09 } = require('../data/times/swk09.json');
const { prayerTime: wilayah01 } = require('../data/times/wly01.json');
const { prayerTime: wilayah02 } = require('../data/times/wly02.json');

const Quranen = quranen;
const Quranmy = quranmy;
const BukhariBook = bukhari;
const MuslimBook = muslim;
const AbudaudBook = abu_daud;
const NasaiBook = nasai;
const TirmiziBook = tirmizi;
const IbnumajahBook = ibnu_majah;

const Zones = {
  kdh01: {
    db: kedah01,
    negeri: 'Kedah',
    name: 'KOTA SETAR, POKOK SENA DAN KUBANG PASU',
    lat: '6.022430189212623',
  },
  kdh02: {
    db: kedah02,
    negeri: 'Kedah',
    name: 'KUALA MUDA, PENDANG DAN YAN',
    lat: '5.587184553044593',
  },
  kdh03: {
    db: kedah03,
    negeri: 'Kedah',
    name: 'PADANG TERAP DAN SIK',
    lat: '5.815681432800716',
  },
  kdh04: {
    db: kedah04,
    negeri: 'Kedah',
    name: 'BALING',
    lat: '5.677091628053184',
  },
  kdh05: {
    db: kedah05,
    negeri: 'Kedah',
    name: 'KULIM DAN BANDAR BAHARU',
    lat: '5.130853977035976',
  },
  kdh06: {
    db: kedah06,
    negeri: 'Kedah',
    name: 'LANGKAWI',
    lat: '6.365554078326729',
  },
  kdh07: {
    db: kedah07,
    negeri: 'Kedah',
    name: 'GUNUNG JERAI',
    lat: '5.788599003711032',
  },
  mlk01: { db: melaka01, negeri: 'Melaka', name: 'SELURUH NEGERI MELAKA' },
  ngs01: {
    db: negeriSembilan01,
    negeri: 'Negeri Sembilan',
    name: 'JEMPOL DAN TAMPIN',
  },
  ngs02: {
    db: negeriSembilan02,
    negeri: 'Negeri Sembilan',
    name: 'PORT DICKSON, SEREMBAN, KUALA PILAH, JELEBU DAN REMBAU',
  },
  phg01: { db: pahang01, negeri: 'Pahang', name: 'PULAU TIOMAN' },
  phg02: {
    db: pahang02,
    negeri: 'Pahang',
    name: 'ROMPIN, PEKAN, MUADZAM SHAH DAN KUANTAN',
  },
  phg03: {
    db: pahang03,
    negeri: 'Pahang',
    name: 'MARAN, CHENOR, TEMERLOH, BERA, JENGKA DAN JERANTUT',
  },
  phg04: { db: pahang04, negeri: 'Pahang', name: 'BENTONG, RAUB DAN LIPIS' },
  phg05: {
    db: pahang05,
    negeri: 'Pahang',
    name: 'BUKIT TINGGI, GENTING SEMPAH, DAN JANDA BAIK',
  },
  phg06: {
    db: pahang06,
    negeri: 'Pahang',
    name: 'CAMERON HIGHLANDS, BUKIT FRASER DAN GENTING HIGHLANDS',
  },
  prk01: {
    db: perak01,
    negeri: 'Perak',
    name: 'TAPAH, SLIM RIVER DAN TANJUNG MALIM',
  },
  prk02: {
    db: perak02,
    negeri: 'Perak',
    name: 'IPOH, BATU GAJAH, KAMPAR, SG. SIPUT DAN KUALA KANGSAR',
  },
  prk03: {
    db: perak03,
    negeri: 'Perak',
    name: 'PENGKALAN HULU, GERIK DAN LENGGONG',
  },
  prk04: { db: perak04, negeri: 'Perak', name: 'TEMENGOR DAN BELUM' },
  prk05: {
    db: perak05,
    negeri: 'Perak',
    name: 'TELUK INTAN, BAGAN DATUK, KG. GAJAH, SERI ISKANDAR, BERUAS, PARIT, LUMUT, SITIAWAN DAN PULAU PANGKOR',
  },
  prk06: {
    db: perak06,
    negeri: 'Perak',
    name: 'SELAMA, TAIPING, BAGAN SERAI DAN PARIT BUNTAR',
  },
  prk07: { db: perak07, negeri: 'Perak', name: 'BUKIT LARUT' },
  pls01: { db: perlis01, negeri: 'Perlis', name: 'SELURUH NEGERI PERLIS' },
  png01: {
    db: penang01,
    negeri: 'Pulau Pinang',
    name: 'SELURUH NEGERI PULAU PINANG',
  },
  sgr01: {
    db: selangor01,
    negeri: 'Selangor',
    name: 'HULU SELANGOR, GOMBAK, PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG',
  },
  sgr02: {
    db: selangor02,
    negeri: 'Selangor',
    name: 'SABAK BERNAM DAN KUALA SELANGOR',
  },
  sgr03: { db: selangor03, negeri: 'Selangor', name: 'KLANG DAN KUALA LANGAT' },
  trg01: {
    db: terengganu01,
    negeri: 'Terengganu',
    name: 'KUALA TERENGGANU, MARANG DAN KUALA NERUS',
  },
  trg02: { db: terengganu02, negeri: 'Terengganu', name: 'BESUT DAN SETIU' },
  trg03: { db: terengganu03, negeri: 'Terengganu', name: 'HULU TERENGGANU' },
  trg04: { db: terengganu04, negeri: 'Terengganu', name: 'DUNGUN DAN KEMAMAN' },
  jhr01: {
    db: johor01,
    negeri: 'Johor',
    name: 'PULAU AUR DAN PULAU PEMANGGIL',
  },
  jhr02: {
    db: johor02,
    negeri: 'Johor',
    name: 'KOTA TINGGI, MERSING DAN JOHOR BAHRU',
  },
  jhr03: { db: johor03, negeri: 'Johor', name: 'KLUANG DAN PONTIAN' },
  jhr04: {
    db: johor04,
    negeri: 'Johor',
    name: 'BATU PAHAT, MUAR, SEGAMAT DAN GEMAS JOHOR',
  },
  ktn01: {
    db: kelantan01,
    negeri: 'Kelantan',
    name: 'JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT , PASIR MAS, TANAH MERAH, MACHANG KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)',
  },
  ktn03: {
    db: kelantan02,
    negeri: 'Kelantan',
    name: 'JAJAHAN JELI, GUA MUSANG (DAERAH GALAS DAN BERTAM) DAN JAJAHAN KECIL LOJING',
  },
  sbh01: {
    db: sabah01,
    negeri: 'Sabah',
    name: 'BAHAGIAN SANDAKAN (TIMUR) BANDAR SANDAKAN, BUKIT GARAM, SEMAWANG, TEMANGGONG DAN TAMBISAN',
  },
  sbh02: {
    db: sabah02,
    negeri: 'Sabah',
    name: 'BAHAGIAN SANDAKAN (BARAT) PINANGAH, TERUSAN, BELURAN, KUAMUT DAN TELUPID',
  },
  sbh03: {
    db: sabah03,
    negeri: 'Sabah',
    name: 'BAHAGIAN TAWAU (TIMUR) LAHAD DATU, KUNAK, SILABUKAN, TUNGKU, SAHABAT, DAN SEMPORNA',
  },
  sbh04: {
    db: sabah04,
    negeri: 'Sabah',
    name: 'BAHAGIAN TAWAU (BARAT), BANDAR TAWAU, BALONG, MEROTAI DAN KALABAKAN',
  },
  sbh05: {
    db: sabah05,
    negeri: 'Sabah',
    name: 'BAHAGIAN KUDAT KUDAT, KOTA MARUDU, PITAS DAN PULAU BANGGI',
  },
  sbh06: { db: sabah06, negeri: 'Sabah', name: 'GUNUNG KINABALU' },
  sbh07: {
    db: sabah07,
    negeri: 'Sabah',
    name: 'BAHAGIAN PANTAI BARAT KOTA KINABALU, PENAMPANG, TUARAN, PAPAR, KOTA BELUD, PUTATAN DAN RANAU',
  },
  sbh08: {
    db: sabah08,
    negeri: 'Sabah',
    name: 'BAHAGIAN PEDALAMAN (ATAS) PENSIANGAN, KENINGAU, TAMBUNAN DAN NABAWAN',
  },
  sbh09: {
    db: sabah09,
    negeri: 'Sabah',
    name: 'BAHAGIAN PEDALAMAN (BAWAH) SIPITANG, MEMBAKUT, BEAUFORT, KUALA PENYU, WESTON, TENOM DAN LONG PA SIA',
  },
  swk01: {
    db: sarawak01,
    negeri: 'Sarawak',
    name: 'LIMBANG, SUNDAR, TRUSAN DAN LAWAS',
  },
  swk02: {
    db: sarawak02,
    negeri: 'Sarawak',
    name: 'NIAH, SIBUTI, MIRI, BEKENU DAN MARUDI',
  },
  swk03: {
    db: sarawak03,
    negeri: 'Sarawak',
    name: 'TATAU, SUAI, BELAGA, PANDAN, SEBAUH, BINTULU',
  },
  swk04: {
    db: sarawak04,
    negeri: 'Sarawak',
    name: 'IGAN, KANOWIT, SIBU, DALAT, OYA, BALINGIAN, MUKAH, KAPIT DAN SONG',
  },
  swk05: {
    db: sarawak05,
    negeri: 'Sarawak',
    name: 'BELAWAI, MATU, DARO, SARIKEI, JULAU, BINTANGOR DAN RAJANG',
  },
  swk06: {
    db: sarawak06,
    negeri: 'Sarawak',
    name: 'KABONG, LINGGA, SRI AMAN, ENGKELILI, BETONG, SPAOH, PUSA, SARATOK, ROBAN, DEBAK DAN LUBOK ANTU',
  },
  swk07: {
    db: sarawak07,
    negeri: 'Sarawak',
    name: 'SAMARAHAN, SIMUNJAN, SERIAN, SEBUYAU DAN MELUDAM',
  },
  swk08: {
    db: sarawak08,
    negeri: 'Sarawak',
    name: 'KUCHING, BAU, LUNDU DAN SEMATAN',
  },
  swk09: { db: sarawak09, negeri: 'Sarawak', name: 'KAMPUNG PATARIKAN' },
  wly01: {
    db: wilayah01,
    negeri: 'Wilayah Persekutuan Kuala Lumpur',
    name: 'KUALA LUMPUR DAN PUTRAJAYA',
  },
  wly02: {
    db: wilayah02,
    negeri: 'Wilayah Persekutuan Labuan',
    name: 'LABUAN',
  },
};

const Months = [
  { id: 1, name: 'January', count: 31 },
  { id: 2, name: 'February', count: 28, leapYear: '29' },
  { id: 3, name: 'March', count: 31 },
  { id: 4, name: 'April', count: 30 },
  { id: 5, name: 'May', count: 31 },
  { id: 6, name: 'June', count: 30 },
  { id: 7, name: 'July', count: 31 },
  { id: 8, name: 'August', count: 31 },
  { id: 9, name: 'September', count: 30 },
  { id: 10, name: 'October', count: 31 },
  { id: 11, name: 'November', count: 30 },
  { id: 12, name: 'December', count: 31 },
];

export {
  Zones,
  Months,
  Quranen,
  Quranmy,
  BukhariBook,
  MuslimBook,
  AbudaudBook,
  NasaiBook,
  TirmiziBook,
  IbnumajahBook,
};
