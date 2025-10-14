import express from "express";

const Router = new express.Router();

import Get from "./get.js";
import Post from "./post.js";
import Delete from "./delete.js";
import Put from "./put.js";

Router.get("/:gameid", Get);
Router.post("/:gameid", Post);
Router.delete("/:commentid", Delete);
Router.put("/:commentid", Put);


export default Router;