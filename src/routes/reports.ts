import express from "express";
const Router = express.Router();

import { MiddlewareRequired } from "@/middleware/middleware";
import { createReport, getReports } from "@/controllers/reports";

Router.post("/", MiddlewareRequired, createReport);
Router.get("/", MiddlewareRequired, getReports);

export default Router;