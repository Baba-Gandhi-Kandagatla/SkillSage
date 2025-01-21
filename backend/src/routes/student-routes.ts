import { Router } from "express";
import { verifyTokenStudent } from "../utils/token-manager.js";
import { changePassword, get_profile, get_resume,getStudentAttendance, getStudentMarksByInterview , getAllInterviews, getSpecificInterviews, uploadResume ,getInterwievResult, submitFeedback, getFeedback } from "../controllers/student-controller.js";
import Student from "../models/student.js";

const studentRouter = Router();

studentRouter.post("/upload_resume",verifyTokenStudent,uploadResume);
studentRouter.post("/changepassword",verifyTokenStudent,changePassword);
studentRouter.get("/getCompletedInterviews",verifyTokenStudent,getSpecificInterviews);
studentRouter.get("/get_all_interviews",verifyTokenStudent,getAllInterviews);
studentRouter.get("/get_resume",verifyTokenStudent, get_resume);
studentRouter.get("/profile", verifyTokenStudent, get_profile);
studentRouter.get("/getInterwievResult/:id", verifyTokenStudent, getInterwievResult)
studentRouter.post("/submitFeedback", verifyTokenStudent, submitFeedback)
studentRouter.get("/getFeedback/:id", verifyTokenStudent, getFeedback)
studentRouter.get("/getStudentMarksByInterview", verifyTokenStudent, getStudentMarksByInterview)
studentRouter.get("/getStudentAttendance", verifyTokenStudent, getStudentAttendance)
export default studentRouter;