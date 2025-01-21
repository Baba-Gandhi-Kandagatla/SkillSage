import express from "express";
import { config } from "dotenv";
import morgan from "morgan";
import router from "./routes/index.js";
import cookieParser from "cookie-parser";
import cors from "cors";
config();
const app = express();

const COOKIE_SECRET = process.env.COOKIE_SECRET;
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Development frontend
      "http://frontend:80", // Nginx frontend container
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser(COOKIE_SECRET));

//dont forget to remove it:--------------------------------------------------------------
app.use(morgan("dev"));

app.get("/", (req, res) => {
  return res.end("nice haha");
});
app.use("/api/v1", router);

export default app;
