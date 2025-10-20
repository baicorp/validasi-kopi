import { formatRawExamsData } from "./utils";
import { InferInsertModel } from "drizzle-orm";
import { codeGroups, codes } from "@/db/schema";

export type InsertCodes = InferInsertModel<typeof codes>;

export type InsertCodeGroups = InferInsertModel<typeof codeGroups>;

export type RawExamsData = {
  id?: number;
  examCategoryName?: string;
  groupName: string;
  examsLabel: string;
  totalParticipants: number;
  code: string;
  value: string;
  examName: string;
};

export type ExamDataDetails = InsertCodeGroups & {
  examsData: RawExamsData[];
  formatedExamsData: ReturnType<typeof formatRawExamsData>;
};

export type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
