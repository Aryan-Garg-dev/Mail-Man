import express, { NextFunction, Request, Response } from "express"
import bodyParser from "body-parser"
import cors from "cors"
import morgan from "morgan"
import cookieParser from "cookie-parser"
//! import { fork } from "child_process"
import "./services/Queue-Workers/mail-worker.queue"
import "./services/Queue-Workers/csv-worker.queue"

import errorHandler from "./middlewares/error-handler"
import appRouter from "./routes"
import { connectDB } from "./db/connect.db"
import errors from "./utils/errors"
import envs from "./constant"

const port = envs.PORT || 8080;

const app = express();

connectDB()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}))

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(morgan(
  envs.NODE_ENV === "development" ? 'dev' : 'combined' 
))

app.get('/', (req: Request, res: Response) => {
  res.status(200).send("Welcome to Mail-Man");
});

app.use("/api", appRouter);

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  return next(errors.NotFound("Route does not exist."))
})

app.use(errorHandler);

app.listen(port, ()=>{
  console.log(`App is listening on PORT ${port}`);
})


