import { SQL, sql } from "drizzle-orm";
import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
  AnySQLiteColumn,
} from "drizzle-orm/sqlite-core";

export function lower(email: AnySQLiteColumn): SQL {
  return sql`lower(${email})`;
}

// Tabel Kategori Produk
export const kategoriProduk = sqliteTable(
  "kategori_produk",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kategori: text("kategori").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("kategoriUniqueIndex").on(lower(table.kategori))],
);

// Tabel Produk
export const produk = sqliteTable(
  "produk",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    namaProduk: text("nama_produk").notNull(),
    kategoriId: integer("kategori_id")
      .notNull()
      .references(() => kategoriProduk.id, { onDelete: "cascade" }),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("produkUniquePerKategori").on(
      lower(table.namaProduk),
      table.kategoriId,
    ),
  ],
);

// Tabel: jenis_ujian
export const jenisUjian = sqliteTable(
  "jenis_ujian",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    jenisUjian: text("jenis_ujian").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("jenisUjianUniqueIndex").on(lower(table.jenisUjian))],
);

// Tabel: nama_ujian
export const namaUjian = sqliteTable(
  "nama_ujian",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    namaUjian: text("nama_ujian").notNull(),
    jenisUjianId: integer("jenis_ujian_id")
      .notNull()
      .references(() => jenisUjian.id, { onDelete: "cascade" }),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("namUjianUniqueIndex").on(lower(table.namaUjian))],
);

// Tabel: kode
export const kode = sqliteTable(
  "kode",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    kode: text("kode").notNull(),
    nilai: text("nilai").notNull(),
    sessionUuid: text("session_uuid").notNull(), // crypto.randomUUID()
    sessionName: text("session_name").notNull(), // Label sesi
    namaUjianId: integer("nama_ujian_id")
      .notNull()
      .references(() => namaUjian.id, { onDelete: "cascade" }),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("kodeUniquePerUjian").on(table.kode, table.sessionUuid),
  ],
);

// auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(current_timestamp)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  username: text("username").unique(),
  displayUsername: text("display_username"),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(current_timestamp)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(current_timestamp)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(current_timestamp)`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
