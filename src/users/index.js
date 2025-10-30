import express from "express";
import multer from "multer";

const upload = multer();

const Router = new express.Router();
import Info, { GetAvatar } from "./info.js";
import Subscribe from "./subscribe.js";
import Games from "./games.js";
import Put from "./put.js";
import { MiddlewareRequired } from "../middleware.js";

Router.get("/:login", Info);
Router.put("/:login", upload.single('avatar'), MiddlewareRequired, Put);
Router.get("/:login/avatar", GetAvatar);
Router.get("/:login/games", Games);
Router.post("/:login/subscribe", MiddlewareRequired, Subscribe);

export default Router;