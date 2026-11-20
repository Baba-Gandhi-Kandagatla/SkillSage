import { Router } from "express";
import studentRouter from "./student-routes.js";
import adminRouter from "./admin-routes.js";
import interviewRouter from "./interview-routes.js";
import godRouter from "./god-routes.js";
import {loginValidator, validate } from "../utils/validators.js";
import { login, logout, verifyUser } from "../controllers/suprize.js";
import { verifyToken } from "../utils/token-manager.js";

const router = Router();

router.use("/student",studentRouter);
router.use("/admin",adminRouter);
router.use("/interview",interviewRouter);
router.use("/god",godRouter);
router.post("/login",validate(loginValidator),login);
router.get("/logout",logout);
router.get("/auth_status",verifyToken,verifyUser);


export default router;