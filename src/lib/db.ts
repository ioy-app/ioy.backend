import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const db = new pg.Pool({
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PASS,
    max: 80,
    min: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    afterConnect: async (client) => (await client.query("SET statement_timeout = 3000"))
});

db.on("error", (err) => console.error("[db]", err.message));

export default db;