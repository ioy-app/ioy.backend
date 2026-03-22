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
    postUserSubscribe,
    getUserLikes,
    putUserEmail,
    deleteUser,
    getUserSelf
} from "@controllers/users";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware";

const upload = multer();
const Router = ExpressRouter();

Router.put("/change-email", MiddlewareRequired, putUserEmail);
Router.get("/self", MiddlewareRequired, getUserSelf);
Router.post("/delete", MiddlewareRequired, deleteUser);
Router.get("/:login", Middleware, getUser);
Router.get("/:login/avatar", getUserAvatar);
Router.get("/:login/favorites", Middleware, getUserFavorites);
Router.get("/:login/subscribers", Middleware, getUserSubscribers);
Router.put("/:login", upload.single("avatar"), MiddlewareRequired, putUser);
Router.get("/:login/games", Middleware, getUserGames);
Router.get("/:login/likes", Middleware, getUserLikes);
Router.get("/:login/subscribe", MiddlewareRequired, getUserSubscribe);
Router.post("/:login/subscribe", MiddlewareRequired, postUserSubscribe);

export default Router;