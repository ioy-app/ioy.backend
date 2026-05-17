import { Router as ExpressRouter } from "express";
import multer from "multer";
import {
    getGames,
    getGameFile,
    getGameIcon,
    getGamePlay,
    getGameById,
    postGameLike,
    createGame,
    getGamesByUser,
    editGame,
    deleteGame,
    getGamesTags
} from "@controllers/games";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware.js";
import { getVotes, putVote } from "@/controllers/votes";

const upload = multer({
  preservePath: true
});
const Router = ExpressRouter();

Router.get("/", getGames);
Router.get("/tags", getGamesTags);
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
Router.post("/:id/like", MiddlewareRequired, postGameLike);

Router.get("/:id/game", getGamePlay);
Router.get("/:id/icon", getGameIcon);
Router.get("/:id/my-votes", MiddlewareRequired, getVotes);
Router.put("/:id/my-votes", MiddlewareRequired, putVote);
Router.get(/^\/(\d+)\/(.+)$/, (req, res, next) => {
    if (req.params[0] && req.params[1]) {
        req.params.id = req.params[0];
        req.params.file = req.params[1];
    }
    next();
}, getGameFile);



export default Router;