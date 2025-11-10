import { Router as ExpressRouter } from "express";
import multer from "multer";

import {
    getUser,
    getUserAvatar,
    getUserSubscribe,
    getUserGames,
    getUserSubscribers,
    getUserFavorites,
    putUser,
    postUserSubscribe
} from "@controllers/users";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware";

const upload = multer();
const Router = ExpressRouter();

Router.get("/:login", Middleware, getUser);
Router.get("/:login/avatar", getUserAvatar);
Router.get("/:login/favorites", getUserFavorites);
Router.get("/:login/subscribers", getUserSubscribers);
Router.put("/:login", upload.single("avatar"), MiddlewareRequired, putUser);
Router.get("/:login/games", getUserGames);
Router.get("/:login/subscribe", MiddlewareRequired, getUserSubscribe);
Router.post("/:login/subscribe", MiddlewareRequired, postUserSubscribe);

export default Router;