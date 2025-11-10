import { Router as ExpressRouter } from "express";

import {
    Get,
    GetAll,
    Subscribe,
    getGameFile,
    getGameIcon,
    getGamePlay,
    getGameById
} from "@controllers/games";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware.js";

const Router = ExpressRouter();

Router.get("/", GetAll);
Router.get("/:id", Middleware, getGameById);


Router.post("/:id/subscribe", MiddlewareRequired, Subscribe);

Router.get("/:id/game", getGamePlay);
Router.get("/:id/icon", getGameIcon);
Router.get("/:id/:file", getGameFile);


export default Router;