import { exams } from "./exams";
import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, index } from "drizzle-orm/sqlite-core";

// code_groups
export const codeGroups = sqliteTable("code_groups", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  groupName: text("group_name").notNull(),
  selectedExam: text("selected_exam").notNull(),
  totalParticipants: integer("total_participants").notNull().default(0),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// codes
export const codes = sqliteTable(
  "codes",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    code: text("code").notNull(),
    value: text("value").notNull(),
    additionalValue: text("additional_value"),
    examId: text("exam_id")
      .notNull()
      .references(() => exams.id),
    codeGroupId: text("code_group_id")
      .notNull()
      .references(() => codeGroups.id, { onDelete: "cascade" }),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
    updatedAt: text("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [index("code_group_id_idx").on(table.codeGroupId)],
);
