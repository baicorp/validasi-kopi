type Rasa = "asam" | "asin" | "manis" | "pahit" | "tidak berasa";

export interface RasaIntensitas {
  rasa: Rasa;
  intensitas?: number; // undefined untuk "tidak berasa"
}

const listNilaiTresholdSingle = [
  { rasa: "asam", intensitas: 1 },
  { rasa: "asam", intensitas: 2 },
  { rasa: "asam", intensitas: 3 },
  { rasa: "asin", intensitas: 1 },
  { rasa: "asin", intensitas: 2 },
  { rasa: "asin", intensitas: 3 },
  { rasa: "manis", intensitas: 1 },
  { rasa: "manis", intensitas: 2 },
  { rasa: "manis", intensitas: 3 },
  { rasa: "pahit", intensitas: 1 },
  { rasa: "pahit", intensitas: 2 },
  { rasa: "pahit", intensitas: 3 },
  { rasa: "hambar" },
];

const listNilaiTresholdMix = [
  "Asam + Asin",
  "Asam + Manis",
  "Asam + Pahit",
  "Asin + Manis",
  "Asin + Pahit",
  "Manis + Pahit",
];

const kategoriProduk = [
  "2 in 1 RnG",
  "3 in 1 RnG",
  "3 in 1 Instant",
  "Kopi Pure Reguler",
  "Kopi Pure Premium",
  "RTG",
];

export { listNilaiTresholdSingle, listNilaiTresholdMix, kategoriProduk };
