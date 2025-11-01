import express from "express";
import Get, { GetAvatar, GetFiles, GetGame } from "./get.js";
import GetAll from "./getAll.js";
import Subscribe from "./subscribe.js";
import { MiddlewareRequired } from "../middleware.js";

const Router = new express.Router();

Router.get("/", GetAll);
Router.get("/:id", Get);
Router.get("/:id/icon", GetAvatar);
Router.get("/:id/game", GetGame);
Router.post("/:id/subscribe", MiddlewareRequired, Subscribe);
Router.get("/:id/:file", GetFiles);



export default Router;