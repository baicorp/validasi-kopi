import { user } from "./auth";
import { exams } from "./exams";
import { sql } from "drizzle-orm";
import { codeGroups } from "./codes";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const examEvents = sqliteTable("exam_events", {
  id: integer("id").primaryKey(),
  examEventName: text("exam_event_name").notNull(),
  examStart: text("exam_start").notNull(),
  examEnd: text("exam_end").notNull(),
  codeGroupRegulerId: integer("code_group_reguler_id")
    .notNull()
    .references(() => codeGroups.id),
  codeGroupRetakeId: integer("code_group_retake_id")
    .notNull()
    .references(() => codeGroups.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const examRegistrations = sqliteTable("exam_registrations", {
  id: integer("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  examEventId: integer("exam_event_id")
    .notNull()
    .references(() => examEvents.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const examSubmissions = sqliteTable("exam_submissions", {
  id: integer("id").primaryKey(),
  code: text("code").notNull(),
  value: text("value").notNull(),
  additionalValue: text("additional_value"),
  result: text("result").notNull(), // correct | partial | wrong
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id),
  //FIXME : I think this is unnecessary because we have submission_attemp table that have examEventId
  examEventId: integer("exam_event_id")
    .notNull()
    .references(() => examEvents.id),
  codeGroupId: integer("code_group_id")
    .notNull()
    .references(() => codeGroups.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const submissionAttemps = sqliteTable("submission_attemps", {
  id: integer("id").primaryKey(),
  numberAttemp: integer("number_attemp").notNull(),
  grade: integer("grade").notNull(),
  retakeExam: text("retake_exam"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  examEventId: integer("exam_event_id")
    .notNull()
    .references(() => examEvents.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const examSubmissionNotes = sqliteTable("exam_submission_notes", {
  id: integer("id").primaryKey(),
  note: text("note").notNull(),
  examSubmissionId: integer("exam_submission_id")
    .notNull()
    .references(() => examSubmissions.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
