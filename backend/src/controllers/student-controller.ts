import { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import Interview from "../models/Interview.js";
import Student from "../models/student.js";
import multer  from "multer";
import mammoth from "mammoth";
import { promises as fsPromises } from 'fs';
import InterviewToDepartment from "../models/InterviewToDepartments.js";
import Resume from "../models/Resume.js";
import path from "path";
import EvalMetrics from "../models/Eval_metrics.js";
import Department from "../models/Department.js";
import College from "../models/College.js";
import { generateResumeSummary } from "../Api-helper/helper.js";
import InterviewInstance from "../models/Interview_ins.js";
import InterviewExchange from "../models/InterviewExchanges.js";
import Feedback from "../models/Feedback.js";

const { hash, compare } =bcrypt;
async function getStudentByRollNumber(rollNumber: string) {
  try {
    const student = await Student.findOne({ where: { roll_number: rollNumber }, raw: true });
    if (!student) {
      throw new Error("User not found.");
    }
    return student;
  } catch (error) {
    throw new Error(`Error fetching student: ${error.message}`);
  }
}

export const getAllInterviews = async (req: Request, res: Response) => {
  try{
    const rollNumber = res.locals.jwtData.rollnumber;
    const user = await getStudentByRollNumber(rollNumber);

    const interviews = await Interview.findAll({
        include: [{
          model: InterviewToDepartment,
          where: {
            department_id: user.department_id, 
          },
          required: true, 
        },
        {
          model: InterviewInstance,
          where: {
            student_roll: user.roll_number,
          },
          required: false,
        }
      ],
        where: {
          collage_id: user.college_id, 
        },
      });
    res.status(200).json({ interviews });
  }
  catch(error){
    res.status(500).json({ message: error.message });
  }
}

export const getSpecificInterviews = async (req: Request, res: Response) => {
  try{
      const rollNumber = res.locals.jwtData.rollnumber;
      const user = await getStudentByRollNumber(rollNumber);
      const interviews = await Interview.findAll({
        include: [{
          model: InterviewToDepartment,
          where: {
            department_id: user.department_id, 
          },
          required: true, 
        },
        {
          model: InterviewInstance,
          where: {
            student_roll: user.roll_number,
            status: "submitted",
          },
          required: true,
        }
      ],
        where: {
          collage_id: user.college_id, 
        },
      });
      res.status(200).json({ interviews });
    }
    catch(error){
      res.status(500).json({ message: error.message });
    }
  };

  export const get_profile = async (req: Request, res: Response) =>{
    const rollnumber = res.locals.jwtData.rollnumber;
  
    try {
      const student = await Student.findOne({ where: { roll_number:rollnumber },
        include:[
          {model:EvalMetrics},
          {model:Department,attributes:['name']},
          {model:College,attributes:["name"]},
        ] });
  
      if (!student) {
        return res.status(404).json({ message: "User not found." });
      }

      const resume = await Resume.findOne({ where: { roll_number: rollnumber } });
      const resumeData = resume ? resume.get().resume_context : "Please upload your resume";
  
      const { password, ...userWithoutPassword } = student.get();
  
      res.status(200).json({ user: userWithoutPassword , resume:resumeData });
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }

  export const get_resume = async (req: Request, res: Response) => {
    try {
      const { rollnumber } = res.locals.jwtData;
  
      const resume = (await Resume.findOne({ where: { roll_number: rollnumber } })).get();
      const resume_context = resume.resume_context;
      if (!resume || !resume.resume_loc) {
        return res.status(404).json({ message: "Resume not found" });
      }
  
      const __dirname = path.dirname(new URL(import.meta.url).pathname).slice(1, -1);
      const resumeFilePath = path.resolve(__dirname, '../..', resume.resume_loc);

      try {
        const data = await fsPromises.readFile(resumeFilePath);
        const resume64 = data.toString('base64');
        res.json({ resume: resume64, resume_context: resume_context });
      } catch (error) {
        res.status(500).json({ message: "Error reading resume file." });
      }
    } catch (error) {
      console.error("Error fetching resume:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

const upload = multer({ dest: 'uploads/' });
export const uploadResume = [
  upload.single("resume"),
  async (req: Request & { file: Express.Multer.File }, res: Response) => {
    const rollNumber = res.locals.jwtData.rollnumber;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    try {
      const newFilePath = req.file.path;

      const result = await mammoth.extractRawText({ path: newFilePath });
      const extractedText = result.value;
      const simple = await generateResumeSummary(extractedText);

      const existingResume = await Resume.findOne({ where: { roll_number: rollNumber } });

      if (existingResume) {
        const oldFilePath = existingResume.get().resume_loc;
        if (oldFilePath) {
          await fsPromises.unlink(oldFilePath).catch((err) => {
            res.status(500).json({ message: "Error deleting old resume file." });
          });
        }

        await existingResume.update({
          resume_loc: newFilePath,
          resume_context: simple,
        });
      } else {
        await Resume.create({
          resume_loc: newFilePath,
          resume_context: simple,
          roll_number: rollNumber,
        });
      }

      res.status(200).json({ message: "Resume uploaded and saved successfully." });
    } catch (error) {
      console.error("Upload resume error:", error);

      if (req.file && req.file.path) {
        await fsPromises.unlink(req.file.path).catch((err) => {
          console.error("Error deleting uploaded resume file due to failure:", err);
        });
      }

      res.status(500).json({ message: "Internal server error." });
    }
  },
];



export const changePassword = async (req: Request, res: Response) => {
  const rollNumber = res.locals.jwtData.rollnumber;
  const { oldPassword, newPassword } = req.body;
  try {
    const student = await Student.findOne({ where: { roll_number: rollNumber } });

    if (!student) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await compare(oldPassword, student.get().password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid old password." });
    }

    const hashedPassword = await hash(newPassword, 10);
    await student.update({ password: hashedPassword });

    res.status(200).json({ message: "Password changed successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getInterwievResult = async (req: Request, res: Response) => {
  
  const rollNumber = res.locals.jwtData.rollnumber;
  const { id } = req.params;
  try {
    const student = await Student.findOne({ where: { roll_number: rollNumber } });
    if (!student) {
      return res.status(404).json({ message: "User not found." });
    }
    const interviewinstance = await InterviewInstance.findOne({ where: { student_roll: student.get().roll_number, interview_ref: id } });
    if (!interviewinstance) {
      return res.status(404).json({ message: "Interview instance not found." });
    }
    const interviewExchanges = await InterviewExchange.findAll({ where: { interview_ins_ref: interviewinstance.get().id } });
    if (!interviewExchanges) {
      return res.status(404).json({ message: "Interview exchanges not found." });
    }
    res.status(200).json({ interviewData:interviewinstance.get(), InterviewExchange: interviewExchanges.map((exchange) => exchange.get()) });
  }
  catch(error){
    res.status(500).json({ message: error.message });
  }
};

export const submitFeedback = async (req: Request, res: Response) => {
  const rollNumber = res.locals.jwtData.rollnumber;
  const { interviewId, feedbackText } = req.body;
  try {
    const student = await Student.findOne({ where: { roll_number: rollNumber } });
    if (!student) {
      return res.status(404).json({ message: "User not found." });
    }
    const feedback = await Feedback.create({ roll_number: student.get().roll_number, interview_id: interviewId, feedback_text: feedbackText });
    res.status(200).json({ message: "Feedback submitted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getFeedback = async (req: Request, res: Response) => {
  const rollNumber = res.locals.jwtData.rollnumber;
  try {
    const student = await Student.findOne({ where: { roll_number: rollNumber } });
    if (!student) {
      return res.status(404).json({ message: "User not found." });
    }    
    const feedback = await Feedback.findAll({ where: { roll_number: student.get().roll_number } });
    res.status(200).json({ feedback });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};



export const getStudentAttendance = async (req: Request, res: Response) => {
  const rollNumber = res.locals.jwtData.rollnumber;
  try {
    const user = await Student.findOne({ where: { roll_number: rollNumber } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const interviews = await Interview.findAll({
      include: [{
        model: InterviewToDepartment,
        where: {
          department_id: user.department_id, 
        },
        required: true, 
      },
    ],
      where: {
        collage_id: user.college_id, 
      },
    });
    const interviewInstances = await InterviewInstance.findAll({ where: { student_roll: user.get().roll_number } });
    const attendance = interviewInstances.length / interviews.length;
    res.status(200).json({ attendance });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};



export const getStudentMarksByInterview = async (req: Request, res: Response) => {
  const rollNumber = res.locals.jwtData.rollnumber;
  try {
    const user = await Student.findOne({ where: { roll_number: rollNumber } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const interviewInstancesMarks = await InterviewInstance.findAll({ where: { student_roll: user.get().roll_number } , attributes: ['marks']});
    res.status(200).json(interviewInstancesMarks);
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
};
