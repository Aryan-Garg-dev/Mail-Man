import { Router } from "express"
import AuthController from './../controllers/auth.controller';
import { authenticated } from "../middlewares/authenticate-route";

const authRouter = Router(); 

authRouter.route("/").get(
  authenticated,
  AuthController.checkAuth
);

authRouter.route("/google").get(
  AuthController.redirectToGoogleAuth
);

authRouter.route("/google/callback").get(
  AuthController.registerUser
);

authRouter.route("/logout").post(
  AuthController.logout
);

export default authRouter;