import { Router as ExpressRouter } from "express";

import {
    Get,
    GetAvatar,
    GetFiles,
    GetGame,
    GetAll,
    Subscribe
} from "@controllers/games";
import { MiddlewareRequired } from "@/middleware/middleware.js";

const Router = ExpressRouter();

Router.get("/", GetAll);
Router.get("/:id", Get);
Router.get("/:id/icon", GetAvatar);
Router.get("/:id/game", GetGame);
Router.post("/:id/subscribe", MiddlewareRequired, Subscribe);
Router.get("/:id/:file", GetFiles);

export default Router;