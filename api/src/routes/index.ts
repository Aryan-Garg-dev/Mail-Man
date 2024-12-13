import { Router } from "express";

import authRouter from "./auth.route";
import mailRouter from "./mail.route";
import uploadRouter from "./upload.route";
import recordsRouter from "./records.route";

const appRouter = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/mail", mailRouter);
appRouter.use("/upload", uploadRouter);
appRouter.use("/records", recordsRouter);

export default appRouter;