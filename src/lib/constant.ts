type Taste = "asam" | "asin" | "manis" | "pahit" | "hambar";

export interface TasteWithIntensity {
  taste: Taste;
  intensity?: number; // undefined for "hambar"
}

const listTresholdSingleValue: TasteWithIntensity[] = [
  { taste: "asam", intensity: 1 },
  { taste: "asam", intensity: 2 },
  { taste: "asam", intensity: 3 },
  { taste: "asin", intensity: 1 },
  { taste: "asin", intensity: 2 },
  { taste: "asin", intensity: 3 },
  { taste: "manis", intensity: 1 },
  { taste: "manis", intensity: 2 },
  { taste: "manis", intensity: 3 },
  { taste: "pahit", intensity: 1 },
  { taste: "pahit", intensity: 2 },
  { taste: "pahit", intensity: 3 },
  { taste: "hambar" },
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
  "2 out of 5 kopi pure",
  "2 out of 5 campuran kopi",
  "treshold single",
  "treshold mix",
];

const productExam = ["identifikasi", "triangle", "skoring"];

export { listTresholdSingleValue, productCategories, basicExam, productExam };
