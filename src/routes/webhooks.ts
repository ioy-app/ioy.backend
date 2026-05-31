import KoFi from "@/webhooks/ko-fi";
import express from "express";

const Router = express.Router();
Router.post("/ko-fi", KoFi);

export default Router;