import {
    Login,
    Logout,
    Me,
    Reg,
    Verify
} from "@/controllers/auth";
import { MiddlewareRequired } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.post("/login", Login);
Router.post("/reg", Reg);
Router.get("/verify", Verify);
Router.get("/logout", MiddlewareRequired, Logout);
Router.get("/me", MiddlewareRequired, Me);

export default Router;