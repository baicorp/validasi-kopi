import "dotenv/config";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

const connection = await mysql.createConnection({
  host: process.env.MYSQL_DATABASE_HOST!,
  user: process.env.MYSQL_DATABASE_USER!,
  password: process.env.MYSQL_DATABASE_PASSWORD!,
  database: process.env.MYSQL_DATABASE_NAME!,
});

const db = drizzle({ client: connection });

export { db };
