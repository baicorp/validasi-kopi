import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// exam_categories
export const examCategories = mysqlTable("exam_categories", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  categoryName: varchar("category_name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// exams
export const exams = mysqlTable("exams", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  examName: varchar("exam_name", { length: 255 }).notNull(),
  examCategoryId: varchar("exam_category_id", { length: 36 })
    .notNull()
    .references(() => examCategories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
