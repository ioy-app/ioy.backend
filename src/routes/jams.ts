import { getJams } from "@/controllers/jams";
import { Middleware } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.get("/", Middleware, getJams);

export default Router;