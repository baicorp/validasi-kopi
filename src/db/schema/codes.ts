import { exams } from "./exams";
import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// code_groups
export const codeGroups = sqliteTable("code_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupName: text("group_name").notNull(),
  // ⚠️ If you keep exam reference here, better use exam_id not exams_label
  examsLabel: text("exams_label"),
  totalParticipants: integer("total_participants").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// codes
export const codes = sqliteTable("codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull(),
  value: text("value"),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id),
  codeGroupId: integer("code_group_id").references(() => codeGroups.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});
