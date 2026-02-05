import {
    getComments,
    postCommentLike,
    createComment,
    deleteComment
} from "@/controllers/comments";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.get("/:gameid", Middleware, getComments);
Router.post("/:commentid/like", MiddlewareRequired, postCommentLike);
Router.post("/:gameid", MiddlewareRequired, createComment);
Router.post("/:gameid/:commentid", MiddlewareRequired, createComment);
Router.get("/:gameid/:commentid", Middleware, getComments);
Router.delete("/:gameid/:commentid", MiddlewareRequired, deleteComment);

export default Router;