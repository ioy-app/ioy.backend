// import pg from "pg";
// import dotenv from "dotenv";

// import logger from "@/lib/logger";

// dotenv.config();

// const hosts = (
//     process.env.PG_HOSTS ||
//     process.env.PG_HOST ||
//     "localhost"
// )
//     .split(",")
//     .map(host => host.trim())
//     .filter(Boolean);

// if (!hosts.length) {
//     throw new Error(
//         "PG_HOSTS is empty"
//     );
// }

// const db = new pg.Pool({
//     host: hosts[0],

//     port: Number(
//         process.env.PG_PORT || 5432
//     ),

//     database:
//         process.env.PG_DB,

//     user:
//         process.env.PG_USER,

//     password:
//         process.env.PG_PASS,

//     max: Number(
//         process.env.PG_POOL_MAX || 80
//     ),

//     min: Number(
//         process.env.PG_POOL_MIN || 5
//     ),

//     idleTimeoutMillis: 30_000,

//     connectionTimeoutMillis: 5_000,

//     ssl:
//         process.env.PG_SSL === "true"
//             ? {
//                 rejectUnauthorized: false
//             }
//             : false
// });



// db.on("connect", async (client) => {
//     try {
//         await client.query(
//             "SET statement_timeout = 3000"
//         );

//         logger.info(
//             "Postgres client connected"
//         );
//     }
//     catch (err: any) {
//         logger.error(
//             "Postgres client setup failed",
//             {
//                 error: err?.message
//             }
//         );
//     }
// });



// db.on("error", (err) => {
//     logger.error(
//         "Postgres pool error",
//         {
//             error: err?.message
//         }
//     );
// });



// export const initDB =
// async (): Promise<boolean> => {
//     try {
//         const result = await db.query(
//             "SELECT NOW()"
//         );

//         logger.info(
//             "Postgres connected",
//             {
//                 timestamp:
//                     result.rows[0]?.now
//             }
//         );

//         return true;
//     }
//     catch (err: any) {
//         logger.error(
//             "Postgres connection failed",
//             {
//                 error: err?.message
//             }
//         );

//         return false;
//     }
// };



// export const closeDB =
// async (): Promise<void> => {
//     try {
//         await db.end();

//         logger.info(
//             "Postgres pool closed"
//         );
//     }
//     catch (err: any) {
//         logger.error(
//             "Postgres close failed",
//             {
//                 error: err?.message
//             }
//         );
//     }
// };



// Object.freeze(db);

// export default db;

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