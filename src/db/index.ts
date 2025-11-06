import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql"; // for turso sqlite
import { createClient } from "@libsql/client"; // for turso sqlite

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const db = drizzle({ client });

// import mysql from "mysql2/promise"; // for mysql
// import { drizzle } from "drizzle-orm/mysql2"; // for mysql

// const connection = await mysql.createConnection({
//   host: process.env.MYSQL_DATABASE_HOST!,
//   user: process.env.MYSQL_DATABASE_USER!,
//   password: process.env.MYSQL_DATABASE_PASSWORD!,
//   database: process.env.MYSQL_DATABASE_NAME!,
// });

// const db = drizzle({ client: connection });

export { db };
