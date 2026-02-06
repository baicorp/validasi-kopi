import { mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

// product_categories
export const productCategories = mysqlTable("product_categories", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  categoryName: varchar("category_name", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// products
export const products = mysqlTable("products", {
  id: varchar("id", { length: 36 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID())
    .notNull(),
  productName: varchar("product_name", { length: 255 }).unique().notNull(),
  productCategoryId: varchar("product_category_id", { length: 36 })
    .notNull()
    .references(() => productCategories.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
