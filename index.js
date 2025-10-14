import express from "express";
import { expressjwt } from "express-jwt";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

export const app = express();
export const secret = "Hello world";
export const DB = new pg.Client({
    "host": process.env.PG_HOST,
    "port": process.env.PG_PORT,
    "database": process.env.PG_DB,
    "user": process.env.PG_USER,
    "password": process.env.PG_PASS
})
const port = process.env.PORT || 3000;
import oAuthRouter from "./src/oauth/index.js";
import CodesRouter from "./src/codes/index.js";
import UsersRouter from "./src/users/index.js";
import GamesRouter from "./src/games/index.js";
import Search from "./src/search.js";
app.use(express.json());

app.use("/oauth", oAuthRouter);
app.use("/codes", CodesRouter);
app.use("/users", UsersRouter);
app.use("/games", GamesRouter);

app.get("/search", Search);

DB.connect().then(() => {
    DB.connected = DB._connected;
    console.log('[backend] db is connected');
});

app.listen(port, () => {
    console.log(`backend is running :${port}`);
})