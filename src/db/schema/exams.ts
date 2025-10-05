import { sql } from "drizzle-orm";
import { codeGroups } from "./codes";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

// exam_categories
export const examCategories = sqliteTable("exam_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryName: text("category_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// exams
export const exams = sqliteTable("exams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  examName: text("exam_name").notNull(),
  examCategoryId: integer("exam_category_id")
    .notNull()
    .references(() => examCategories.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

// exam_sessions
export const examSessions = sqliteTable("exam_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionName: text("session_name").notNull(),
  startTime: integer("start_time", { mode: "timestamp" }),
  endTime: integer("end_time", { mode: "timestamp" }),
  codeGroupId: integer("code_group_id")
    .notNull()
    .references(() => codeGroups.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});
