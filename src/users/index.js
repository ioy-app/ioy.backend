import express from "express";

const Router = new express.Router();
import Info from "./info.js";
import Subscribe from "./subscribe.js";
import Games from "./games.js";
import { MiddlewareRequired } from "../middleware.js";

Router.get("/:login", Info);
Router.get("/:login/games", Games);
Router.post("/:login/subscribe", MiddlewareRequired, Subscribe);

export default Router;