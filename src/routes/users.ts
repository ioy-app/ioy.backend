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
import { getPicturesByUser } from "@/controllers/pictures";
import getUserBanner from "@/controllers/users/getUserBanner";
import getUserInstances from "@/controllers/users/getUserInstances";
import deleteAvatar from "@/controllers/users/deleteAvatar";
import deleteBanner from "@/controllers/users/deleteBanner";

const upload = multer();
const Router = ExpressRouter();

Router.put("/change-email", MiddlewareRequired, putUserEmail);
Router.get("/self", MiddlewareRequired, getUserSelf);
Router.post("/delete", MiddlewareRequired, deleteUser);
Router.get("/:login", Middleware, getUser);
Router.get("/:login/avatar", getUserAvatar);
Router.delete("/:login/avatar", MiddlewareRequired, deleteAvatar);
Router.get("/:login/banner", getUserBanner);
Router.delete("/:login/banner", MiddlewareRequired, deleteBanner);
Router.get("/:login/instances", getUserInstances);
Router.get("/:login/favorites", Middleware, getUserFavorites);
Router.get("/:login/subscribers", Middleware, getUserSubscribers);
Router.put("/:login", upload.any(), MiddlewareRequired, putUser);
Router.get("/:login/games", Middleware, getUserGames);
Router.get("/:login/pictures", Middleware, getPicturesByUser);
Router.get("/:login/likes", Middleware, getUserLikes);
Router.get("/:login/subscribe", MiddlewareRequired, getUserSubscribe);
Router.post("/:login/subscribe", MiddlewareRequired, postUserSubscribe);

export default Router;
