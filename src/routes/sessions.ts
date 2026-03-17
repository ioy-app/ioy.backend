import express from "express";

const Router = express.Router();

import {
    getSessions,
    updateSession,
    deleteSession,
    deleteSessions
} from "@controllers/sessions";
import { MiddlewareRequired } from "@middleware/middleware";

Router.get("/", MiddlewareRequired, getSessions);
Router.delete("/:id", MiddlewareRequired, deleteSession);
Router.delete("/", MiddlewareRequired, deleteSessions);
Router.get("/update", updateSession);

export default Router;