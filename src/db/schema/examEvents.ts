import { user } from "./auth";
import { exams } from "./exams";
import { codeGroups } from "./codes";
import {
  mysqlTable,
  int,
  timestamp,
  varchar,
  float,
} from "drizzle-orm/mysql-core";

export const examEvents = mysqlTable("exam_events", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  examEventName: varchar("exam_event_name", { length: 255 }).notNull(),
  examStart: timestamp("exam_start").notNull(),
  examEnd: timestamp("exam_end").notNull(),
  codeGroupRegulerId: varchar("code_group_reguler_id", { length: 36 })
    .notNull()
    .references(() => codeGroups.id),
  codeGroupRetakeId: varchar("code_group_retake_id", { length: 36 })
    .notNull()
    .references(() => codeGroups.id),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sampleExamAnswer = mysqlTable("sample_exam_answer", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  examEventId: varchar("exam_event_id", { length: 36 })
    .notNull()
    .references(() => examEvents.id, { onDelete: "cascade" }),
  examName: varchar("exam_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const examRegistrations = mysqlTable("exam_registrations", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id),
  examEventId: varchar("exam_event_id", { length: 36 })
    .notNull()
    .references(() => examEvents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const submissionAttempts = mysqlTable("submission_attempts", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  numberAttempt: int("number_attempt").notNull(),
  grade: float("grade").notNull(),
  additionalGrade: float("additional_grade"),
  retakeExam: varchar("retake_exam", { length: 255 }),
  examId: varchar("exam_id", { length: 36 })
    .notNull()
    .references(() => exams.id),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => user.id),
  examEventId: varchar("exam_event_id", { length: 36 })
    .notNull()
    .references(() => examEvents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const examSubmissions = mysqlTable("exam_submissions", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  additionalValue: varchar("additional_value", { length: 255 }),
  result: varchar("result", { length: 255 }).notNull(), // correct | partial | wrong
  additionalResult: varchar("additional_result", { length: 255 }), // correct | wrong
  subAttemptId: varchar("sub_attempt_id", { length: 36 })
    .notNull()
    .references(() => submissionAttempts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const examSubmissionNotes = mysqlTable("exam_submission_notes", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  note: varchar("note", { length: 255 }).notNull(),
  subAttemptId: varchar("sub_attempt_id", { length: 36 })
    .notNull()
    .references(() => submissionAttempts.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
