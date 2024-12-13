import { NextFunction, Request, Response } from "express";
import errors from "../utils/errors";
import { compress } from "../utils/file";
import { CSVQueue } from "../services/Queues";
import { redisActions } from "../services/Storage/redis-store.service";
import { compressorPath, runWorker } from "../workers";

const addToCSVProcessingQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) return next(errors.FileNotFoundError("File not found"));
    
    //TODO: if file.size >> then compressFile(file)

    const { originalname: fileName, path: filePath  } = file;

    if (!req.user?._id) return next(errors.Unauthorized("User ID is missing"));
    console.log(req.user._id.toString())
    await CSVQueue.add({ fileName, filePath, userId: req.user._id.toString() });

    res.status(200).json({message: "File added for processing", success: true});
  } catch(error){
    console.error(`Error while add to csvQueue: ${(error as Error).message}`);
    return next(errors.InternalServerError("Error while processing csv file"));
  }
}

const addToTemplateStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { template: htmlTemplate }= req.body;
    if (!htmlTemplate) return next(errors.ValidationError("Template is missing"));

    //* Optimizing the template by compressing it
    const compressedTemplate = await runWorker(compressorPath, { data: htmlTemplate })

    if (!req.user?.id) return next(errors.Unauthorized("User ID is missing"));
    redisActions.set(`template:${req.user._id}`, compressedTemplate.toString('base64'));

    res.status(200).json({message: "Template added for processing", success: true});
  } catch(error){
    console.error(`Error while add to templateStore: ${(error as Error).message}`);
    return next(errors.InternalServerError("Error while processing template file"));
  }
}

const UploadController = {
  addToCSVProcessingQueue,
  addToTemplateStore
}

export default UploadController;