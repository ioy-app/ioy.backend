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

const upload = multer({
  preservePath: true
});
const Router = ExpressRouter();

Router.get("/", GetAll);
Router.get("/:id", Middleware, getGameById);
Router.put("/:id", upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'game' }
]), MiddlewareRequired, editGame);
Router.delete("/:id", MiddlewareRequired, deleteGame);
Router.post("/create", upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'game' }
]), MiddlewareRequired, createGame);
Router.post("/my", MiddlewareRequired, getGamesByUser);


Router.post("/:id/subscribe", MiddlewareRequired, postSubscribe);
Router.post("/:id/like", MiddlewareRequired, postGameLike);

Router.get("/:id/game", getGamePlay);
Router.get("/:id/icon", getGameIcon);
Router.get(/^\/(\d+)\/(.+)$/, (req, res, next) => {
    // req.params[0] = первый захват (id), req.params[1] = второй (путь к файлу)
    if (req.params[0] && req.params[1]) {
        req.params.id = req.params[0];      // "1039"
        req.params.file = req.params[1];    // "42eng/eng.js"
    }
    next();
}, getGameFile);


export default Router;