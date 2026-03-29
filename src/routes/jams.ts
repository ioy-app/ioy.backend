import {
  createJam,
  deleteJam,
  getJam,
  getJamIcon,
  getJams,
  getJamsByUser,
  joinJam,
  leaveJam
} from "@/controllers/jams";
import { Middleware, MiddlewareRequired } from "@/middleware/middleware";
import express from "express";
import multer from "multer";
const upload = multer({
  preservePath: true
});

const Router = express.Router();

Router.get("/", Middleware, getJams);
Router.get("/:id", Middleware, getJam);
Router.get("/:id/icon", getJamIcon);
Router.post("/", upload.fields([
  { name: 'icon', maxCount: 1 }
]), MiddlewareRequired, createJam);
Router.post("/my", MiddlewareRequired, getJamsByUser);
Router.delete("/:id", MiddlewareRequired, deleteJam);
Router.post("/:id/join", MiddlewareRequired, joinJam);
Router.post("/:id/leave", MiddlewareRequired, leaveJam);

export default Router;