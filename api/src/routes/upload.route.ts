import { Router } from "express";
import { authenticated } from "../middlewares/authenticate-route";
import { upload } from "../services/Storage/multer-upload.service";
import UploadController from "../controllers/upload.controller";

const uploadRouter = Router();

uploadRouter.route("/template").post(
  authenticated,
  UploadController.addToTemplateStore
)

uploadRouter.route("/csv").post(
  authenticated,
  upload.single('file'),
  UploadController.addToCSVProcessingQueue
)


export default uploadRouter;