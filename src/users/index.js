import express from "express";

const Router = new express.Router();
import Info from "./info.js";
import Subscribe from "./subscribe.js";

Router.get("/:login", Info);
Router.post("/:login/subscribe", Subscribe);

export default Router;