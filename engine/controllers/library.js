import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { holyQuran: quranmy } = require("../data/quran/quran_id.json");
const { holyQuran: quranen } = require("../data/quran/quran_en.json");
const { prayerTime: kedah01 } = require("../data/times/kdh01.json");
const { prayerTime: kedah02 } = require("../data/times/kdh02.json");
const { prayerTime: kedah03 } = require("../data/times/kdh03.json");
const { prayerTime: kedah04 } = require("../data/times/kdh04.json");
const { prayerTime: kedah05 } = require("../data/times/kdh05.json");
const { prayerTime: kedah06 } = require("../data/times/kdh06.json");
const { prayerTime: kedah07 } = require("../data/times/kdh07.json");
const { prayerTime: melaka01 } = require("../data/times/mlk01.json");
const { prayerTime: negeriSembilan01 } = require("../data/times/ngs01.json");
const { prayerTime: negeriSembilan02 } = require("../data/times/ngs02.json");
const { prayerTime: pahang01 } = require("../data/times/phg01.json");
const { prayerTime: pahang02 } = require("../data/times/phg02.json");
const { prayerTime: pahang03 } = require("../data/times/phg03.json");
const { prayerTime: pahang04 } = require("../data/times/phg04.json");
const { prayerTime: pahang05 } = require("../data/times/phg05.json");
const { prayerTime: pahang06 } = require("../data/times/phg06.json");
const { prayerTime: perak01 } = require("../data/times/prk01.json");
const { prayerTime: perak02 } = require("../data/times/prk02.json");
const { prayerTime: perak03 } = require("../data/times/prk03.json");
const { prayerTime: perak04 } = require("../data/times/prk04.json");
const { prayerTime: perak05 } = require("../data/times/prk05.json");
const { prayerTime: perak06 } = require("../data/times/prk06.json");
const { prayerTime: perak07 } = require("../data/times/prk07.json");
const { prayerTime: perlis01 } = require("../data/times/pls01.json");
const { prayerTime: penang01 } = require("../data/times/png01.json");
const { prayerTime: selangor01 } = require("../data/times/sgr01.json");
const { prayerTime: selangor02 } = require("../data/times/sgr02.json");
const { prayerTime: selangor03 } = require("../data/times/sgr03.json");
const { prayerTime: terengganu01 } = require("../data/times/trg01.json");
const { prayerTime: terengganu02 } = require("../data/times/trg02.json");
const { prayerTime: terengganu03 } = require("../data/times/trg03.json");
const { prayerTime: terengganu04 } = require("../data/times/trg04.json");
const { prayerTime: johor01 } = require("../data/times/jhr01.json");
const { prayerTime: johor02 } = require("../data/times/jhr02.json");
const { prayerTime: johor03 } = require("../data/times/jhr03.json");
const { prayerTime: johor04 } = require("../data/times/jhr04.json");
const { prayerTime: kelantan01 } = require("../data/times/ktn01.json");
const { prayerTime: kelantan02 } = require("../data/times/ktn03.json");
const { prayerTime: sabah01 } = require("../data/times/sbh01.json");
const { prayerTime: sabah02 } = require("../data/times/sbh02.json");
const { prayerTime: sabah03 } = require("../data/times/sbh03.json");
const { prayerTime: sabah04 } = require("../data/times/sbh04.json");
const { prayerTime: sabah05 } = require("../data/times/sbh05.json");
const { prayerTime: sabah06 } = require("../data/times/sbh06.json");
const { prayerTime: sabah07 } = require("../data/times/sbh07.json");
const { prayerTime: sabah08 } = require("../data/times/sbh08.json");
const { prayerTime: sabah09 } = require("../data/times/sbh09.json");
const { prayerTime: sarawak01 } = require("../data/times/swk01.json");
const { prayerTime: sarawak02 } = require("../data/times/swk02.json");
const { prayerTime: sarawak03 } = require("../data/times/swk03.json");
const { prayerTime: sarawak04 } = require("../data/times/swk04.json");
const { prayerTime: sarawak05 } = require("../data/times/swk05.json");
const { prayerTime: sarawak06 } = require("../data/times/swk06.json");
const { prayerTime: sarawak07 } = require("../data/times/swk07.json");
const { prayerTime: sarawak08 } = require("../data/times/swk08.json");
const { prayerTime: sarawak09 } = require("../data/times/swk09.json");
const { prayerTime: wilayah01 } = require("../data/times/wly01.json");
const { prayerTime: wilayah02 } = require("../data/times/wly02.json");

const Quranen = quranen;
const Quranmy = quranmy;

const Zones = {
  kdh01: { db: kedah01, name: "KOTA SETAR, POKOK SENA DAN KUBANG PASU" },
  kdh02: { db: kedah02, name: "KUALA MUDA, PENDANG DAN YAN" },
  kdh03: { db: kedah03, name: "PADANG TERAP DAN SIK" },
  kdh04: { db: kedah04, name: "BALING" },
  kdh05: { db: kedah05, name: "KULIM DAN BANDAR BAHARU" },
  kdh06: { db: kedah06, name: "LANGKAWI" },
  kdh07: { db: kedah07, name: "GUNUNG JERAI" },
  mlk01: { db: melaka01, name: "SELURUH NEGERI MELAKA" },
  ngs01: { db: negeriSembilan01, name: "JEMPOL DAN TAMPIN" },
  ngs02: {
    db: negeriSembilan02,
    name: "PORT DICKSON, SEREMBAN, KUALA PILAH, JELEBU DAN REMBAU",
  },
  phg01: { db: pahang01, name: "PULAU TIOMAN" },
  phg02: { db: pahang02, name: "ROMPIN, PEKAN, MUADZAM SHAH DAN KUANTAN" },
  phg03: {
    db: pahang03,
    name: "MARAN, CHENOR, TEMERLOH, BERA, JENGKA DAN JERANTUT",
  },
  phg04: { db: pahang04, name: "BENTONG, RAUB DAN LIPIS" },
  phg05: { db: pahang05, name: "BUKIT TINGGI, GENTING SEMPAH, DAN JANDA BAIK" },
  phg06: {
    db: pahang06,
    name: "CAMERON HIGHLANDS, BUKIT FRASER DAN GENTING HIGHLANDS",
  },
  prk01: { db: perak01, name: "TAPAH, SLIM RIVER DAN TANJUNG MALIM" },
  prk02: {
    db: perak02,
    name: "IPOH, BATU GAJAH, KAMPAR, SG. SIPUT DAN KUALA KANGSAR",
  },
  prk03: { db: perak03, name: "PENGKALAN HULU, GERIK DAN LENGGONG" },
  prk04: { db: perak04, name: "TEMENGOR DAN BELUM" },
  prk05: {
    db: perak05,
    name: "TELUK INTAN, BAGAN DATUK, KG. GAJAH, SERI ISKANDAR, BERUAS, PARIT, LUMUT, SITIAWAN DAN PULAU PANGKOR",
  },
  prk06: { db: perak06, name: "SELAMA, TAIPING, BAGAN SERAI DAN PARIT BUNTAR" },
  prk07: { db: perak07, name: "BUKIT LARUT" },
  pls01: { db: perlis01, name: "SELURUH NEGERI PERLIS" },
  png01: { db: penang01, name: "SELURUH NEGERI PULAU PINANG" },
  sgr01: {
    db: selangor01,
    name: "HULU SELANGOR, GOMBAK, PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG",
  },
  sgr02: { db: selangor02, name: "SABAK BERNAM DAN KUALA SELANGOR" },
  sgr03: { db: selangor03, name: "KLANG DAN KUALA LANGAT" },
  trg01: { db: terengganu01, name: "KUALA TERENGGANU, MARANG DAN KUALA NERUS" },
  trg02: { db: terengganu02, name: "BESUT DAN SETIU" },
  trg03: { db: terengganu03, name: "HULU TERENGGANU" },
  trg04: { db: terengganu04, name: "DUNGUN DAN KEMAMAN" },
  jhr01: { db: johor01, name: "PULAU AUR DAN PULAU PEMANGGIL" },
  jhr02: { db: johor02, name: "KOTA TINGGI, MERSING DAN JOHOR BAHRU" },
  jhr03: { db: johor03, name: "KLUANG DAN PONTIAN" },
  jhr04: { db: johor04, name: "BATU PAHAT, MUAR, SEGAMAT DAN GEMAS JOHOR" },
  ktn01: {
    db: kelantan01,
    name: "JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT , PASIR MAS, TANAH MERAH, MACHANG KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)",
  },
  ktn03: {
    db: kelantan02,
    name: "JAJAHAN JELI, GUA MUSANG (DAERAH GALAS DAN BERTAM) DAN JAJAHAN KECIL LOJING",
  },
  sbh01: {
    db: sabah01,
    name: "BAHAGIAN SANDAKAN (TIMUR) BANDAR SANDAKAN, BUKIT GARAM, SEMAWANG, TEMANGGONG DAN TAMBISAN",
  },
  sbh02: {
    db: sabah02,
    name: "BAHAGIAN SANDAKAN (BARAT) PINANGAH, TERUSAN, BELURAN, KUAMUT DAN TELUPID",
  },
  sbh03: {
    db: sabah03,
    name: "BAHAGIAN TAWAU (TIMUR) LAHAD DATU, KUNAK, SILABUKAN, TUNGKU, SAHABAT, DAN SEMPORNA",
  },
  sbh04: {
    db: sabah04,
    name: "BAHAGIAN TAWAU (BARAT), BANDAR TAWAU, BALONG, MEROTAI DAN KALABAKAN",
  },
  sbh05: {
    db: sabah05,
    name: "BAHAGIAN KUDAT KUDAT, KOTA MARUDU, PITAS DAN PULAU BANGGI",
  },
  sbh06: { db: sabah06, name: "GUNUNG KINABALU" },
  sbh07: {
    db: sabah07,
    name: "BAHAGIAN PANTAI BARAT KOTA KINABALU, PENAMPANG, TUARAN, PAPAR, KOTA BELUD, PUTATAN DAN RANAU",
  },
  sbh08: {
    db: sabah08,
    name: "BAHAGIAN PEDALAMAN (ATAS) PENSIANGAN, KENINGAU, TAMBUNAN DAN NABAWAN",
  },
  sbh09: {
    db: sabah09,
    name: "BAHAGIAN PEDALAMAN (BAWAH) SIPITANG, MEMBAKUT, BEAUFORT, KUALA PENYU, WESTON, TENOM DAN LONG PA SIA",
  },
  swk01: { db: sarawak01, name: "LIMBANG, SUNDAR, TRUSAN DAN LAWAS" },
  swk02: { db: sarawak02, name: "NIAH, SIBUTI, MIRI, BEKENU DAN MARUDI" },
  swk03: {
    db: sarawak03,
    name: "TATAU, SUAI, BELAGA, PANDAN, SEBAUH, BINTULU",
  },
  swk04: {
    db: sarawak04,
    name: "IGAN, KANOWIT, SIBU, DALAT, OYA, BALINGIAN, MUKAH, KAPIT DAN SONG",
  },
  swk05: {
    db: sarawak05,
    name: "BELAWAI, MATU, DARO, SARIKEI, JULAU, BINTANGOR DAN RAJANG",
  },
  swk06: {
    db: sarawak06,
    name: "KABONG, LINGGA, SRI AMAN, ENGKELILI, BETONG, SPAOH, PUSA, SARATOK, ROBAN, DEBAK DAN LUBOK ANTU",
  },
  swk07: {
    db: sarawak07,
    name: "SAMARAHAN, SIMUNJAN, SERIAN, SEBUYAU DAN MELUDAM",
  },
  swk08: { db: sarawak08, name: "KUCHING, BAU, LUNDU DAN SEMATAN" },
  swk09: { db: sarawak09, name: "KAMPUNG PATARIKAN" },
  wly01: { db: wilayah01, name: "KUALA LUMPUR DAN PUTRAJAYA" },
  wly02: { db: wilayah02, name: "LABUAN" },
};

const Months = [
  { id: 1, name: "January", count: 31 },
  { id: 2, name: "February", count: 28 },
  { id: 3, name: "March", count: 31 },
  { id: 4, name: "April", count: 30 },
  { id: 5, name: "May", count: 31 },
  { id: 6, name: "June", count: 30 },
  { id: 7, name: "July", count: 31 },
  { id: 8, name: "August", count: 31 },
  { id: 9, name: "September", count: 30 },
  { id: 10, name: "October", count: 31 },
  { id: 11, name: "November", count: 30 },
  { id: 12, name: "December", count: 31 },
];

export { Zones, Months, Quranen, Quranmy };
