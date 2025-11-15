import { sql } from "drizzle-orm";
import { codeGroups } from "./codes";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// exam_categories
export const examCategories = sqliteTable("exam_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryName: text("category_name").notNull(),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// exams
export const exams = sqliteTable("exams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  examName: text("exam_name").notNull(),
  examCategoryId: integer("exam_category_id")
    .notNull()
    .references(() => examCategories.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// exam_sessions
export const examSessions = sqliteTable("exam_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionName: text("session_name").notNull(),
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  endTime: integer("end_time", { mode: "timestamp" }).notNull(),
  codeGroupId: integer("code_group_id")
    .notNull()
    .references(() => codeGroups.id),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});
