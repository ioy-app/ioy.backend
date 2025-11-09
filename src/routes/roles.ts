import express from "express";
const Router = express.Router();

import {
    getRole,
    getRoles,
    deleteRole,
    putRole
} from "@controllers/roles";
import { MiddlewareRequired } from "@/middleware/middleware";

Router.get("/", MiddlewareRequired, getRoles);
Router.get("/:id", MiddlewareRequired, getRole);
Router.delete("/:id", MiddlewareRequired, deleteRole);
Router.put("/:id", MiddlewareRequired, putRole);

export default Router;