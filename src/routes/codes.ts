import {
    checkCode
} from "@/controllers/codes";
import { Middleware } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.post("/", Middleware, checkCode);

export default Router;