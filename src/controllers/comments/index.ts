import express from "express";

const Router = new express.Router();

import Get from "./get.js";
import Post from "./post.js";
import Delete from "./delete.js";
import Put from "./put.js";
import { MiddlewareRequired } from "@/middleware/middleware.js";

Router.get("/:gameid", Get);
Router.post("/:gameid", MiddlewareRequired, Post);
Router.delete("/:commentid", MiddlewareRequired, Delete);
Router.put("/:commentid", MiddlewareRequired, Put);

export default Router;