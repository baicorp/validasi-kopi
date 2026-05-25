import { exams } from "./exams";
import {
  mysqlTable,
  int,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/mysql-core";

export const codeGroups = mysqlTable("code_groups", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  groupName: varchar("group_name", { length: 255 }).notNull(),
  selectedExam: varchar("selected_exam", { length: 255 }).notNull(),
  totalParticipants: int("total_participants").default(0).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const codes = mysqlTable(
  "codes",
  {
    id: varchar("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    code: varchar("code", { length: 255 }).notNull(),
    value: varchar("value", { length: 255 }).notNull(),
    additionalValue: varchar("additional_value", { length: 255 }),
    examId: varchar("exam_id", { length: 36 })
      .notNull()
      .references(() => exams.id),
    codeGroupId: varchar("code_group_id", { length: 36 })
      .notNull()
      .references(() => codeGroups.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { fsp: 3 })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("code_group_id_idx").on(table.codeGroupId)],
);
