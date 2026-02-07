import { Router as ExpressRouter } from "express";
import multer from "multer";
import {
    GetAll,
    postSubscribe,
    getGameFile,
    getGameIcon,
    getGamePlay,
    getGameById,
    postGameLike,
    createGame,
    getGamesByUser,
    editGame,
    deleteGame
} from "@controllers/games";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware.js";

const upload = multer();
const Router = ExpressRouter();

Router.get("/", GetAll);
Router.get("/:id", Middleware, getGameById);
Router.put("/:id", upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'game', maxCount: 1 }
]), MiddlewareRequired, editGame);
Router.delete("/:id", MiddlewareRequired, deleteGame);
Router.post("/create", upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'game', maxCount: 1 }
]), MiddlewareRequired, createGame);
Router.post("/my", MiddlewareRequired, getGamesByUser);


Router.post("/:id/subscribe", MiddlewareRequired, postSubscribe);
Router.post("/:id/like", MiddlewareRequired, postGameLike);

Router.get("/:id/game", getGamePlay);
Router.get("/:id/icon", getGameIcon);
Router.get("/:id/:file", getGameFile);


export default Router;