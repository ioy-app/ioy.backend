import express from "express";
import { expressjwt } from "express-jwt";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import pg from "pg";
import cors from "cors";

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
import CommentsRouter from "./src/comments/index.js";
import Search from "./src/search.js";
import Refresh from "./src/refresh.js";
import Me from "./src/me.js";
import Sessions from "./src/sessions/index.js";
import Logout from "./src/logout.js";

import { MiddlewareRequired } from "./src/middleware.js";

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

const RouterV1 = new express.Router();

RouterV1.use("/oauth", oAuthRouter);
RouterV1.use("/codes", CodesRouter);
RouterV1.use("/users", UsersRouter);
RouterV1.use("/games", GamesRouter);
RouterV1.use("/comments", CommentsRouter);
RouterV1.use("/sessions", Sessions);

RouterV1.get("/search", Search);
RouterV1.post("/refresh", Refresh);
RouterV1.get("/me", MiddlewareRequired, Me);
RouterV1.get("/logout", MiddlewareRequired, Logout);

app.use("/v1", RouterV1);

DB.connect().then(() => {
    DB.connected = DB._connected;
    console.log('[backend] db is connected');
});

app.listen(port, () => {
    console.log(`backend is running :${port}`);
})