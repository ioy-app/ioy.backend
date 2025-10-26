import express from "express";

const Router = new express.Router();

import All from "./all.js";
import Delete from "./delete.js";
import { MiddlewareRequired } from "../middleware.js";

Router.get("/", MiddlewareRequired, All);
Router.delete("/:id", MiddlewareRequired, Delete);

export default Router;