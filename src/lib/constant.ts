type Rasa = "asam" | "asin" | "manis" | "pahit" | "tidak berasa";

export interface RasaIntensitas {
  rasa: Rasa;
  intensitas?: number; // undefined untuk "tidak berasa"
}

const basicExam = [
  "2 out of 5 pure",
  "2 out of 5 creamer",
  "treshold single",
  "treshold mix",
];

export interface TasteWithIntensity {
  tasteIntent: string;
}

const listTresholdSingleValue: TasteWithIntensity[] = [
  { tasteIntent: "asam+1" },
  { tasteIntent: "asam+2" },
  { tasteIntent: "asam+3" },
  { tasteIntent: "asin+1" },
  { tasteIntent: "asin+2" },
  { tasteIntent: "asin+3" },
  { tasteIntent: "manis+1" },
  { tasteIntent: "manis+2" },
  { tasteIntent: "manis+3" },
  { tasteIntent: "pahit+1" },
  { tasteIntent: "pahit+2" },
  { tasteIntent: "pahit+3" },
  { tasteIntent: "tidak berasa" },
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

const productExam = ["identifikasi", "triangle", "skoring"];

export {
  listTresholdSingleValue,
  listNilaiTresholdMix,
  kategoriProduk,
  productExam,
  basicExam,
};
