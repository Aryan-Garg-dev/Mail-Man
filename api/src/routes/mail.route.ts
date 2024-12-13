import { Router } from "express";
import { authenticated } from "../middlewares/authenticate-route";
import MailController from "../controllers/mail.controller";

const mailRouter = Router();

mailRouter.route("/send").post(
  authenticated,
  MailController.addMailsToMailingQueue
)



export default mailRouter;