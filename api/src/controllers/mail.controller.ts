import { NextFunction, Request, Response } from "express";
import errors from "../utils/errors";
import { redisActions, trackEmailsSent } from "../services/Storage/redis-store.service";
import MailingQueue from "../services/Queues/mail.queue";

const addMailsToMailingQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user?._id) return next(errors.Unauthorized("User ID is missing"));

    // const canSendMail = await trackEmailsSent(req.user.id);
    // if (!canSendMail) return next(errors.BadRequest("Email limit exceeded"));

    const { subject, from } = req.body;
    if (!subject) return next(errors.ValidationError("Subject is required"));

    const compressedTemplate = await redisActions.get(`template:${req.user._id}`);
    if (!compressedTemplate) return next(errors.ValidationError("Template is missing"));

    const mailData = { from: from || req.user.email, subject };
    await MailingQueue.add({ mailData, user: req.user });

    res.status(200).json({ message: "Mail is being sent.", success: true });
  } catch(err){
    return next(errors.InternalServerError("Error while adding mail to queue"));
  }
}

const MailController = {
  addMailsToMailingQueue
} 

export default MailController;