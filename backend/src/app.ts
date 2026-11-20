import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { auditLogMiddleware } from "./utils/logger.js";

config();
const app = express();

const COOKIE_SECRET = process.env.COOKIE_SECRET;
app.use(
  cors({
    origin:true,
    // origin: [
    //   "http://23.23.1.0:80",
    //   "http://23.23.1.0",
    //   "http://localhost:5173", // Development frontend
    //   // "http://192.168.194.213:5173"
    // ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

//dont forget to remove it:--------------------------------------------------------------
app.use(morgan("dev"));
app.set('trust proxy', true);
app.use(auditLogMiddleware);
app.get("/", (req, res) => {
  return res.end("nice haha");
});
app.use("/api/v1", router);

export default app;
