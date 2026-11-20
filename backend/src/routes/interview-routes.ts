import { Router } from "express";
import { verifyTokenStudent } from "../utils/token-manager.js";
import { getNext, reframeLastQuestion, startInterview, submitInterview ,increaseViolation} from "../controllers/interview-controller.js";

const interviewRouter = Router();

interviewRouter.get("/start_interview/:interview_id",verifyTokenStudent,startInterview);
interviewRouter.post("/next/:interview_id",verifyTokenStudent,getNext);
interviewRouter.get("/submit/:interview_id",verifyTokenStudent,submitInterview);
interviewRouter.get("/reframe/:interview_id",verifyTokenStudent,reframeLastQuestion);
interviewRouter.get("/violation/:interview_id",verifyTokenStudent,increaseViolation);

export default interviewRouter;