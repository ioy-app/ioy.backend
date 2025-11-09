import { Router as ExpressRouter } from "express";
import multer from "multer";

import {
    getUser,
    getAvatar,
    Subscribe,
    Games,
    getSubscribers,
    getFavorites,
    Put
} from "@controllers/users";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware";

const upload = multer();
const Router = ExpressRouter();

Router.get("/:login", Middleware, getUser);
Router.get("/:login/avatar", getAvatar);
Router.get("/:login/favorites", getFavorites);
Router.get("/:login/subscribers", getSubscribers);

Router.put("/:login", upload.single("avatar"), MiddlewareRequired, Put);

Router.get("/:login/games", Games);


Router.post("/:login/subscribe", MiddlewareRequired, Subscribe);

export default Router;