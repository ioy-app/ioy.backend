import express from "express";

const Router = new express.Router();
import Login from "./login.js";
import Reg from "./reg.js";

Router.post("/login", Login);
Router.post("/reg", Reg);

export default Router;