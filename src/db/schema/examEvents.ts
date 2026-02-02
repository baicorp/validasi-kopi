import { user } from "./auth";
import { exams } from "./exams";
import { sql } from "drizzle-orm";
import { codeGroups } from "./codes";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const examEvents = sqliteTable("exam_events", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  examEventName: text("exam_event_name").notNull(),
  examStart: text("exam_start").notNull(),
  examEnd: text("exam_end").notNull(),
  codeGroupRegulerId: text("code_group_reguler_id")
    .notNull()
    .references(() => codeGroups.id),
  codeGroupRetakeId: text("code_group_retake_id")
    .notNull()
    .references(() => codeGroups.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const sampleExamAnswer = sqliteTable("sample_exam_answer", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  value: text("value").notNull(),
  examEventId: text("exam_event_id")
    .notNull()
    .references(() => examEvents.id, { onDelete: "cascade" }),
  examName: text("exam_name").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const examRegistrations = sqliteTable("exam_registrations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  examEventId: text("exam_event_id")
    .notNull()
    .references(() => examEvents.id, { onDelete: "cascade" }),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const submissionAttempts = sqliteTable("submission_attempts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  numberAttempt: integer("number_attempt").notNull(),
  grade: integer("grade").notNull(),
  additionalGrade: integer("additional_grade"),
  retakeExam: text("retake_exam"),
  examId: text("exam_id")
    .notNull()
    .references(() => exams.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  examEventId: text("exam_event_id")
    .notNull()
    .references(() => examEvents.id, { onDelete: "cascade" }),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const examSubmissions = sqliteTable("exam_submissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  code: text("code").notNull(),
  value: text("value").notNull(),
  additionalValue: text("additional_value"),
  result: text("result").notNull(), // correct | partial | wrong
  submissionAttemptId: text("submission_attempt_id")
    .notNull()
    .references(() => submissionAttempts.id, { onDelete: "cascade" }),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const examSubmissionNotes = sqliteTable("exam_submission_notes", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  note: text("note").notNull(),
  submissionAttemptId: text("submission_attempt_id")
    .notNull()
    .references(() => submissionAttempts.id, { onDelete: "cascade" }),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
