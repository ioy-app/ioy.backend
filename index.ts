import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import { rateLimit } from "express-rate-limit";

dotenv.config();

export const app = express();
export const secret = process.env.SECRET;
const port = process.env.PORT || 3000;

import AuthRouter from "@routes/auth";
import UsersRouter from "@routes/users";
import GamesRouter from "@routes/games";
import RolesRouter from "@routes/roles";
import Sessions from "@routes/sessions";
import CodesRouter from "@routes/codes";
import JamsRouter from "@routes/jams";
import CommentsRouter from "@/routes/comments";
import errorHandler from "@middleware/errorHandler";
import jobGamesSearch from "@/services/games/jobGamesSearch";
import jobClearCodes from "@/services/codes/jobClearCodes";
import { initES } from "@/lib/elasticsearch";
import Search from "@/controllers/search";

// const limiter = rateLimit({
//   windowMs: 1000 * 60 * 10,
//   limit: 100,
//   legacyHeaders: false,
//   message: "errors.limit"
// });

// app.use(limiter);
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(cors({
  origin: "*", //"http://localhost:8080",
  credentials: true
}));

const RouterV1 = express.Router();

RouterV1.use("/auth", AuthRouter);
RouterV1.use("/codes", CodesRouter);
RouterV1.use("/users", UsersRouter);
RouterV1.use("/games", GamesRouter);
RouterV1.use("/comments", CommentsRouter);
RouterV1.use("/sessions", Sessions);
RouterV1.use("/roles", RolesRouter);
RouterV1.get("/search", Search);
RouterV1.use("/jams", JamsRouter);

app.use("/v1", RouterV1);
app.use(errorHandler);

(async () => {
  await initES();
  await jobGamesSearch();
  await jobClearCodes();

  app.listen(port, () => {
    console.log("[server]", `is running :${port}`);
  }); 
})();