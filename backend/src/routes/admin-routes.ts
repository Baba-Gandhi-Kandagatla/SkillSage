import { Router } from "express";
import { verifyTokenAdmin } from "../utils/token-manager.js";
import { getProfile } from "../controllers/suprize.js";
import { addStudent, updateStudent, createInterview, getAllInterviewsA, updateInterviewStatus, 
    deleteInterview,get_student_profile, getAllStudents, deleteStudent, startInterviewStatus, pauseInterviewStatus, 
    addDepartment, addStudents, changePassword, getAttendance, deleteDepartment,
    getAllDepartments, getDefaultPassword, setDefaultPassword,getDepartment,getStudentAttendance,getStudentMarksByInterview, deleteAllStudents,view_student,getInterwievResult, resetStudentPassword ,setPreferences , getPreferences} from "../controllers/admin-controller.js";


const adminRouter = Router();

adminRouter.post("/add_students", verifyTokenAdmin, addStudents);
adminRouter.get("/getDefaultPassword",verifyTokenAdmin,getDefaultPassword);
adminRouter.post("/setDefaultPassword",verifyTokenAdmin,setDefaultPassword);
adminRouter.post("/add_student",verifyTokenAdmin,addStudent);
adminRouter.delete("/students/:rollnumber", verifyTokenAdmin, deleteStudent);
adminRouter.put("/update_student/:rollnumber",verifyTokenAdmin,updateStudent);
adminRouter.get("/get_department/:id",verifyTokenAdmin,getDepartment);
adminRouter.get("/get_students",verifyTokenAdmin,getAllStudents);
adminRouter.post("/add_department",verifyTokenAdmin,addDepartment);
adminRouter.delete("/delete_department/:department_name",verifyTokenAdmin,deleteDepartment);
adminRouter.get("/get_department/:id",verifyTokenAdmin,getDepartment);
adminRouter.get("/get_all_departments",verifyTokenAdmin,getAllDepartments);
adminRouter.post("/create_interview",verifyTokenAdmin,createInterview);
adminRouter.get("/get_interviews",verifyTokenAdmin,getAllInterviewsA);
adminRouter.put("/update_interview_status/:id",verifyTokenAdmin,updateInterviewStatus);
adminRouter.put("/start_interview/:id", verifyTokenAdmin,startInterviewStatus);
adminRouter.put("/pause_interview/:id",verifyTokenAdmin, pauseInterviewStatus);
adminRouter.delete("/delete_interview/:id",verifyTokenAdmin,deleteInterview);
adminRouter.get("/get_attendence/:id",verifyTokenAdmin,getAttendance);
adminRouter.post("/change_password", verifyTokenAdmin, changePassword);
adminRouter.get("/profile",verifyTokenAdmin, getProfile);
adminRouter.get("/get_student_view_student/:rollnumber",verifyTokenAdmin,view_student);
adminRouter.get("/get_student_profile/:rollnumber",verifyTokenAdmin, get_student_profile);
adminRouter.delete("/delete_all_students/", verifyTokenAdmin, deleteAllStudents);
adminRouter.post("/reset_student_password/:rollnumber", verifyTokenAdmin, resetStudentPassword);
adminRouter.put("/setpreference",verifyTokenAdmin, setPreferences );
adminRouter.get("/getpreference",verifyTokenAdmin, getPreferences );
adminRouter.get("/getInterviewResult/:id/:rollNumber", verifyTokenAdmin, getInterwievResult);
adminRouter.get("/getStudentMarksByInterview/:rollNumber", verifyTokenAdmin, getStudentMarksByInterview);
adminRouter.get("/getStudentAttendance/:rollNumber", verifyTokenAdmin, getStudentAttendance);
export default adminRouter;