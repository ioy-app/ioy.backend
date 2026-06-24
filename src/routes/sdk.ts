import { getRank, getSDK, getTops, getUserAvatar, getUserInfo, setScore } from "@/controllers/sdk";
import { Middleware } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.get("/profile", Middleware, getUserInfo);
Router.get("/profile/avatar", Middleware, getUserAvatar);
Router.get("/", getSDK);
Router.get("/highscores/rank", Middleware, getRank);
Router.get("/highscores/top", Middleware, getTops);
Router.post("/highscores", Middleware, setScore);

export default Router;