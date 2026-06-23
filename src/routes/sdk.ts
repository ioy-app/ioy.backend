import { getSDK, getUserAvatar, getUserInfo } from "@/controllers/sdk";
import { Middleware } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.get("/profile", Middleware, getUserInfo);
Router.get("/profile/avatar", Middleware, getUserAvatar);
Router.get("/", getSDK);

export default Router;