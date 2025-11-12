import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import "@/lib/elasticsearch"

export const app = express();
export const secret = "Hello world";

const port = process.env.PORT || 3000;

import CodesRouter from "@controllers/codes/index.js";

import CommentsRouter from "@/controllers/comments/index.js";


import AuthRouter from "@routes/auth";
import UsersRouter from "@routes/users";
import GamesRouter from "@routes/games";
import RolesRouter from "@routes/roles";
import Sessions from "@routes/sessions";
import errorHandler from "@middleware/errorHandler";
import jobGamesSearch from "@/services/games/jobGamesSearch";

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

const RouterV1 = express.Router();

//import "./tests/inits/games";

RouterV1.use("/auth", AuthRouter);
RouterV1.use("/codes", CodesRouter);
RouterV1.use("/users", UsersRouter);
RouterV1.use("/games", GamesRouter);
RouterV1.use("/comments", CommentsRouter);
RouterV1.use("/sessions", Sessions);
RouterV1.use("/roles", RolesRouter);

app.use("/v1", RouterV1);
app.use(errorHandler);

jobGamesSearch();

app.listen(port, () => console.log("[server]", `is running :${port}`)); 