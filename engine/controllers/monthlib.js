import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { prayerTime: kedah01 } = require("../data/times/kdh01.json");
const { prayerTime: kedah02 } = require("../data/times/kdh02.json");
const { prayerTime: kedah03 } = require("../data/times/kdh03.json");
const { prayerTime: kedah04 } = require("../data/times/kdh04.json");
const { prayerTime: kedah05 } = require("../data/times/kdh05.json");
const { prayerTime: kedah06 } = require("../data/times/kdh06.json");
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

const Zones = {
  kdh01: { db: kedah01, name: "KOTA SETAR, POKOK SENA DAN KUBANG PASU" },
  kdh02: { db: kedah02, name: "KUALA MUDA, PENDANG DAN YAN" },
  kdh03: { db: kedah03, name: "PADANG TERAP DAN SIK" },
  kdh04: { db: kedah04, name: "BALING" },
  kdh05: "KULIM DAN BANDAR BAHARU",
  kdh06: "LANGKAWI",
  kdh07: "GUNUNG JERAI",
  mlk01: "SELURUH NEGERI MELAKA",
  ngs01: "JEMPOL DAN TAMPIN",
  ngs02: "PORT DICKSON, SEREMBAN, KUALA PILAH, JELEBU DAN REMBAU",
  phg01: "PULAU TIOMAN",
  phg02: "ROMPIN, PEKAN, MUADZAM SHAH DAN KUANTAN",
  phg03: "MARAN, CHENOR, TEMERLOH, BERA, JENGKA DAN JERANTUT",
  phg04: "BENTONG, RAUB DAN LIPIS",
  phg05: "BUKIT TINGGI, GENTING SEMPAH, DAN JANDA BAIK",
  phg06: "CAMERON HIGHLANDS, BUKIT FRASER DAN GENTING HIGHLANDS",
  prk01: "TAPAH, SLIM RIVER DAN TANJUNG MALIM",
  prk02: "IPOH, BATU GAJAH, KAMPAR, SG. SIPUT DAN KUALA KANGSAR",
  prk03: "PENGKALAN HULU, GERIK DAN LENGGONG",
  prk04: "TEMENGOR DAN BELUM",
  prk05:
    "TELUK INTAN, BAGAN DATUK, KG. GAJAH, SERI ISKANDAR, BERUAS, PARIT, LUMUT, SITIAWAN DAN PULAU PANGKOR",
  prk06: "SELAMA, TAIPING, BAGAN SERAI DAN PARIT BUNTAR",
  prk07: "BUKIT LARUT",
  pls01: "SELURUH NEGERI PERLIS",
  png01: "SELURUH NEGERI PULAU PINANG",
  sgr01: "HULU SELANGOR, GOMBAK, PETALING/SHAH ALAM, HULU LANGAT DAN SEPANG",
  sgr02: "SABAK BERNAM DAN KUALA SELANGOR",
  sgr03: "KLANG DAN KUALA LANGAT",
  trg01: "KUALA TERENGGANU, MARANG DAN KUALA NERUS",
  trg02: "BESUT DAN SETIU",
  trg03: "HULU TERENGGANU",
  trg04: "DUNGUN DAN KEMAMAN",
  jhr01: "PULAU AUR DAN PULAU PEMANGGIL",
  jhr02: "KOTA TINGGI, MERSING DAN JOHOR BAHRU",
  jhr03: "KLUANG DAN PONTIAN",
  jhr04: "BATU PAHAT, MUAR, SEGAMAT DAN GEMAS JOHOR",
  ktn01:
    "JAJAHAN KOTA BHARU, BACHOK, PASIR PUTEH, TUMPAT , PASIR MAS, TANAH MERAH, MACHANG KUALA KRAI DAN GUA MUSANG (DAERAH CHIKU)",
  ktn03:
    "JAJAHAN JELI, GUA MUSANG (DAERAH GALAS DAN BERTAM) DAN JAJAHAN KECIL LOJING",
  sbh01:
    "BAHAGIAN SANDAKAN (TIMUR) BANDAR SANDAKAN, BUKIT GARAM, SEMAWANG, TEMANGGONG DAN TAMBISAN",
  sbh02:
    "BAHAGIAN SANDAKAN (BARAT) PINANGAH, TERUSAN, BELURAN, KUAMUT DAN TELUPID",
  sbh03:
    "BAHAGIAN TAWAU (TIMUR) LAHAD DATU, KUNAK, SILABUKAN, TUNGKU, SAHABAT, DAN SEMPORNA",
  sbh04: "BAHAGIAN TAWAU (BARAT), BANDAR TAWAU, BALONG, MEROTAI DAN KALABAKAN",
  sbh05: "BAHAGIAN KUDAT KUDAT, KOTA MARUDU, PITAS DAN PULAU BANGGI",
  sbh06: "GUNUNG KINABALU",
  sbh07:
    "BAHAGIAN PANTAI BARAT KOTA KINABALU, PENAMPANG, TUARAN, PAPAR, KOTA BELUD, PUTATAN DAN RANAU",
  sbh08: "BAHAGIAN PEDALAMAN (ATAS) PENSIANGAN, KENINGAU, TAMBUNAN DAN NABAWAN",
  sbh09:
    "BAHAGIAN PEDALAMAN (BAWAH) SIPITANG, MEMBAKUT, BEAUFORT, KUALA PENYU, WESTON, TENOM DAN LONG PA SIA",
  swk01: "LIMBANG, SUNDAR, TRUSAN DAN LAWAS",
  swk02: "NIAH, SIBUTI, MIRI, BEKENU DAN MARUDI",
  swk03: "TATAU, SUAI, BELAGA, PANDAN, SEBAUH, BINTULU",
  swk04: "IGAN, KANOWIT, SIBU, DALAT, OYA, BALINGIAN, MUKAH, KAPIT DAN SONG",
  swk05: "BELAWAI, MATU, DARO, SARIKEI, JULAU, BINTANGOR DAN RAJANG",
  swk06:
    "KABONG, LINGGA, SRI AMAN, ENGKELILI, BETONG, SPAOH, PUSA, SARATOK, ROBAN, DEBAK DAN LUBOK ANTU",
  swk07: "SAMARAHAN, SIMUNJAN, SERIAN, SEBUYAU DAN MELUDAM",
  swk08: "KUCHING, BAU, LUNDU DAN SEMATAN",
  swk09: "KAMPUNG PATARIKAN",
  wly01: "KUALA LUMPUR DAN PUTRAJAYA",
  wly02: "LABUAN",
};

const Months = {
  _January: 31,
  get January() {
    return this._January;
  },
  set January(value) {
    this._January = value;
  },
  _February: 59,
  get February() {
    return this._February;
  },
  set February(value) {
    this._February = value;
  },
  _March: 90,
  get March() {
    return this._March;
  },
  set March(value) {
    this._March = value;
  },
  _April: 120,
  get April() {
    return this._April;
  },
  set April(value) {
    this._April = value;
  },
  _May: 151,
  get May() {
    return this._May;
  },
  set May(value) {
    this._May = value;
  },
  _June: 181,
  get June() {
    return this._June;
  },
  set June(value) {
    this._June = value;
  },
  _July: 212,
  get July() {
    return this._July;
  },
  set July(value) {
    this._July = value;
  },
  _August: 243,
  get August() {
    return this._August;
  },
  set August(value) {
    this._August = value;
  },
  _September: 273,
  get September() {
    return this._September;
  },
  set September(value) {
    this._September = value;
  },
  _October: 304,
  get October() {
    return this._October;
  },
  set October(value) {
    this._October = value;
  },
  _November: 334,
  get November() {
    return this._November;
  },
  set November(value) {
    this._November = value;
  },
  _December: 365,
  get December() {
    return this._December;
  },
  set December(value) {
    this._December = value;
  },
};

export { Zones, Months };
