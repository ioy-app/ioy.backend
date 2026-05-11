import {
  createPicture,
  deletePicture,
  editPicture,
  getPicture,
  getPictureImage,
  getPictures,
  postPictureLike
} from "@/controllers/pictures";
import {
  Middleware,
  MiddlewareRequired
} from "@/middleware/middleware";
import express from "express";
import multer from "multer";

const upload = multer({
  preservePath: true
});
const Router = express.Router();

Router.post("/", upload.fields([
  { name: 'image', maxCount: 1 }
]), MiddlewareRequired, createPicture);
Router.get("/", getPictures);
Router.get("/:id/image", getPictureImage);
Router.get("/:id", Middleware, getPicture);
Router.put("/:id", upload.fields([
  { name: 'image', maxCount: 1 }
]), MiddlewareRequired, editPicture);
Router.delete("/:id", MiddlewareRequired, deletePicture);
Router.post("/:id/like", MiddlewareRequired, postPictureLike);

export default Router;