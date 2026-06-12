import { exams } from "./constant";
import { formatRawExamsData } from "./utils";
import { InferInsertModel } from "drizzle-orm";
import { codeGroups, codes } from "@/db/schema";

export type InsertCodes = InferInsertModel<typeof codes>;

export type InsertCodeGroups = InferInsertModel<typeof codeGroups>;

export type RawExamsData = {
  id?: string;
  examCategoryName?: string;
  groupName: string;
  selectedExam: ExamName[];
  totalParticipants: number;
  code: string;
  value: string;
  additionalValue?: string | null;
  examName: string;
};

export type Participants = {
  id: string;
  username: string;
  name: string;
  department: string | null;
};

export type ExamDataDetails = InsertCodeGroups & {
  rowExamsData: RawExamsData[];
  formatedExamsData: ReturnType<typeof formatRawExamsData>;
};

export type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export type Answer = {
  examName: string;
  code: string;
  value: string;
  attemptNumber: number;
};
export type AnswerWithNote = Answer & { note: string };
export type AnswerWithAdditionalValue = Answer & { additionalValue: string };
export type AllTypeOfAnswer = Answer & {
  note?: string;
  additionalValue?: string;
};
export type AnswerKeys = Omit<Answer, "attemptNumber"> & {
  additionalValue?: string;
};

type EvaluationStatus = "correct" | "partial" | "wrong";

export type AnswerWithResult = AllTypeOfAnswer & {
  result: EvaluationStatus;
  additionalResult?: EvaluationStatus;
};

export type examEventPeriode = "akan datang" | "berlangsung" | "selesai";

export type ExamName = (typeof exams)[number];
