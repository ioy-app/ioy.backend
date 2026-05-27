import {
    Login,
    Logout,
    Me,
    Reg,
    Verify
} from "@/controllers/auth";
import { getInstances } from "@/controllers/dashboard";
import { MiddlewareRequired } from "@/middleware/middleware";
import express from "express";

const Router = express.Router();

Router.post("/login", Login);
Router.post("/reg", Reg);
Router.get("/verify", Verify);
Router.get("/logout", MiddlewareRequired, Logout);
Router.get("/me", MiddlewareRequired, Me);
Router.get("/dashboard/instances", MiddlewareRequired, getInstances);

export default Router;