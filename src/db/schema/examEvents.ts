import { user } from "./auth";
import { exams } from "./exams";
import { sql } from "drizzle-orm";
import { codeGroups } from "./codes";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const examEvents = sqliteTable("exam_events", {
  id: integer("id").primaryKey(),
  examEventName: text("exam_event_name").notNull(),
  registrationStart: text("registration_start").notNull(),
  registrationEnd: text("registration_end").notNull(),
  examStart: text("exam_start").notNull(),
  examEnd: text("exam_end").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const examRegistrations = sqliteTable("exam_registrations", {
  id: integer("id").primaryKey(),
  selectedExam: text("selected_exam").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  examEventId: integer("exam_event_id")
    .notNull()
    .references(() => examEvents.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const examSubmissions = sqliteTable("exam_submissions", {
  id: integer("id").primaryKey(),
  code: text("code").notNull(),
  value: text("value").notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => user.id),
  examId: integer("exam_id")
    .notNull()
    .references(() => exams.id),
  examEventId: integer("exam_event_id")
    .notNull()
    .references(() => examEvents.id),
  codeGroupId: integer("code_group_id").references(() => codeGroups.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const examSubmissionNotes = sqliteTable("exam_submission_notes", {
  id: integer("id").primaryKey(),
  note: text("note").notNull(),
  examSubmissionId: integer("exam_submission_id")
    .notNull()
    .references(() => examSubmissions.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`),
});
