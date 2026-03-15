import express from "express";
const Router = express.Router();

import { MiddlewareRequired } from "@/middleware/middleware";
import { answerReport, createReport, getReports } from "@/controllers/reports";

Router.post("/", MiddlewareRequired, createReport);
Router.get("/", MiddlewareRequired, getReports);
Router.put("/:id", MiddlewareRequired, answerReport);

export default Router;