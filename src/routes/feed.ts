
import { getFeedGlobal } from "@/controllers/feeed";
import { MiddlewareRequired } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.get("/global", MiddlewareRequired, getFeedGlobal);

export default Router;