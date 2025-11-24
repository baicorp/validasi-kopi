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

const productCategories = [
  "2 in 1 RnG",
  "3 in 1 RnG",
  "3 in 1 Instant",
  "Kopi Pure Reguler",
  "Kopi Pure Premium",
  "RTG",
];

const basicExam = [
  "2 out of 5 pure",
  "2 out of 5 creamer",
  "treshold single",
  "treshold mix",
];

const productExam = ["identifikasi", "triangle", "skoring"];

export { listTresholdSingleValue, productCategories, basicExam, productExam };
