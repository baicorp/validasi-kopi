import { formatRawExamsData } from "./utils";
import { InferInsertModel } from "drizzle-orm";
import { codeGroups, codes } from "@/db/schema";

export type InsertCodes = InferInsertModel<typeof codes>;

export type InsertCodeGroups = InferInsertModel<typeof codeGroups>;

export type RawExamsData = {
  id?: number;
  examCategoryName?: string;
  groupName: string;
  selectedExam: string;
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
  additionalValue?: string;
};

export type AnswerWithResult = Answer & {
  result: "correct" | "partial" | "wrong";
};
