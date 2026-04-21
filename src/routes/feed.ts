
import { getFeedGlobal } from "@/controllers/feeed";
import { Middleware } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.get("/global", Middleware, getFeedGlobal);

export default Router;