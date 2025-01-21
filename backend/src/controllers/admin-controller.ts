import { Request, Response } from "express";
import { Sequelize, where } from "sequelize";
import bcrypt from 'bcryptjs';
import Interview from "../models/Interview.js";
import InterviewInstance from "../models/Interview_ins.js";
import XLSX from "xlsx";
import multer from "multer";
import Admin from "../models/Admin.js";
import Student from "../models/student.js";
import College from "../models/College.js";
import Department from "../models/Department.js";
import InterviewToDepartment from "../models/InterviewToDepartments.js";
import InterviewExchange from "../models/InterviewExchanges.js";
import EvalMetrics from "../models/Eval_metrics.js";
import Resume from "../models/Resume.js";
import { deprecate } from "util";
import { logEvent } from "../utils/logger.js";
import { Hashing } from "../utils/hash.js";
import { Hash } from 'crypto';

const { compare, hash } =bcrypt;


export const getDefaultPassword = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const admin = (
      await Admin.findOne({ where: { roll_number: rollnumber } })
    ).get();
    const college = (
      await College.findOne({ where: { id: admin.college_id } })
    ).get();
    console.log(college);
    // res.end(college.defaultPassword);
    console.log(college.defaultPassword);
    return res.status(200).json({ defaultPassword: college.defaultPassword });
  } catch (error) {
    console.error("Error fetching default password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const setDefaultPassword = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const newPassword = req.body.newPassword;
    console.log("New password", newPassword);
    const admin = (await Admin.findOne({ where: { roll_number: rollnumber } })).get();
    
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    const college = await College.findOne({ where: { id: admin.college_id } });
    if (!college) {
      return res.status(404).json({ message: "College not found." });
    }
    const newStudentPassword = await Hashing(newPassword);
    console.log("New college password", newPassword);
    await college.update({ defaultPassword: newPassword });
    console.log("updated password for college");
    const students = await Student.findAll({ where: { college_id: admin.college_id } });
    students.forEach(async (student) => {
      await student.update({ password: newStudentPassword });
    });
    console.log("updated password for students \n\n\n");
    return res.status(200).json({ success:true, message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addStudent = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const admin = (
      await Admin.findOne({ where: { roll_number: rollnumber } })
    ).get();

    const studentData = req.body;
    const existingStudent = await Student.findOne({
      where: { roll_number: studentData.rollnumber },
    });
    if (existingStudent) {
      return res.status(409).json({ message: "Student already exists." });
    }
    const departmentid = await Department.findOne({
      where: {
        college_id: admin.college_id,
        name: studentData.department_name,
      },
    });
    if (!departmentid) {
      return res.status(404).json({ message: "Department not found." });
    }
    const department = departmentid.get();

    const defaultPassword = await College.findOne({
      where: { id: admin.college_id },
    }).then((college) => college.get().defaultPassword);

    const newPassword = await Hashing(defaultPassword);
    await Student.create({
      roll_number: studentData.rollnumber,
      username: studentData.name,
      year: studentData.year,
      semester: 1,
      department_id: department.id,
      section: "default",
      password: newPassword,
      college_id: admin.college_id,
    });
    console.log("Student added successfully.",Student);
    res.status(201).json({ message: "Student added successfully." });
  } catch (error) {
    console.error("Error adding student:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
export const addDepartment = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const admin = (
      await Admin.findOne({
        where: { roll_number: res.locals.jwtData.rollnumber },
      })
    ).get();
    const existingDepartment = await Department.findOne({
      where: { college_id: admin.college_id, name },
    });
    if (existingDepartment) {
      return res.status(409).json({ message: "Department already exists." });
    }
    const newDepartment = await Department.create({
      name,
      college_id: admin.college_id,
    });
    res.status(201).json(newDepartment);
  } catch (error) {
    console.error("Error adding department:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { department_name } = req.params;
    const adminRollNumber = res.locals.jwtData.rollnumber;
    const admin = await Admin.findOne({ where: { roll_number: adminRollNumber } });

    if (!admin) {
      return res.status(401).json({ message: "Unauthorized: Admin not found." });
    }

    const department = await Department.findOne({
      where: {
        college_id: admin.get("college_id"),
        name: department_name,
      },
    });

    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }

    const studentInCollege = await Student.findOne({
      where: {
        college_id: admin.get("college_id"),
        department_id: department.get("id"),
      },
    });

    if (studentInCollege) {
      await Student.destroy({
        where: {
          college_id: admin.get("college_id"),
          department_id: department.get("id"),
        },
      });
    }

    await department.destroy();
    res.status(200).json({ message: "Department deleted successfully." });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const admin = (
      await Admin.findOne({
        where: { roll_number: res.locals.jwtData.rollnumber },
      })
    ).get();
    const department = (
      await Department.findOne({ where: { id, college_id: admin.college_id } })
    ).get();
    if (!department) {
      return res.status(404).json({ message: "Department not found." });
    }
    res.status(200).json(department.name);
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllDepartments = async (req: Request, res: Response) => {
  try {
    const admin = (
      await Admin.findOne({
        where: { roll_number: res.locals.jwtData.rollnumber },
      })
    ).get();
    const departments = await Department.findAll({
      where: { college_id: admin.college_id },
    });
    res.status(200).json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { rollnumber } = req.params;
    const updatedData = req.body;
    const admin = (
      await Admin.findOne({
        where: { roll_number: res.locals.jwtData.rollnumber },
      })
    ).get();
    const student = await Student.findOne({
      where: { roll_number: rollnumber, college_id: admin.college_id },
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    // if (updatedData.password) {
    //   updatedData.password = await bcrypt.hash(updatedData.password, 10);
    // }

    await student.update(updatedData);
    res.status(200).json({ message: "Student updated successfully." });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const createInterview = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const admin = await Admin.findOne({ where: { roll_number: rollnumber } });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const interviewData = req.body;

    if (
      !interviewData.name ||
      !interviewData.subject ||
      !interviewData.topic ||
      !interviewData.departments ||
      !Array.isArray(interviewData.departments) 
    ) {
      return res
        .status(400)
        .json({ message: "Invalid input: Missing or incorrect fields." });
    }

    const newInterview = await Interview.create({
      collage_id: admin.get("college_id"),
      name: interviewData.name,
      subject: interviewData.subject,
      topic: JSON.stringify(interviewData.topic),
      no_of_questions: interviewData.no_of_questions,
      no_of_coding_questions: interviewData.no_of_coding_questions,
    });

    const departments = await Department.findAll({
      where: {
        college_id: admin.get("college_id"),
        name: interviewData.departments,
      },
    });

    if (departments.length !== interviewData.departments.length) {
      return res
        .status(400)
        .json({ message: "One or more departments not found." });
    }

    const departmentPromises = departments.map((department) =>
      InterviewToDepartment.create({
        interview_id: newInterview.get("id"),
        department_id: department.get("id"),
      })
    );
    await Promise.all(departmentPromises);

    res.status(201).json({ message: "Interview created successfully." });
  } catch (error) {
    console.error("Error creating interview:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllInterviewsA = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const user = (await Admin.findOne({ where: { roll_number: rollnumber } })).get();
    
    const interviews = await Interview.findAll({
      where: { collage_id: user.college_id },
      include: [{
        model: Department,
        as: 'departments',
        through: { attributes: [] }, // Exclude the join table attributes
        attributes: ['id', 'name']   // Only include necessary department fields
      }]
    });

    res.status(200).json(interviews);
  } catch (error) {
    console.error("Error retrieving interviews:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateInterviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ where: { id } });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    const newStatus = interview.status === "active" ? "paused" : "active";

    await interview.update({ status: newStatus });

    res
      .status(200)
      .json({ message: "Interview status updated successfully.", newStatus });
  } catch (error) {
    console.error("Error updating interview status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const startInterviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ where: { id } });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }

    await interview.update({ status: "active" });

    res.status(200).json({ message: "Interview started successfully." });
  } catch (error) {
    console.error("Error starting interview:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const pauseInterviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({
      where: { id },
      attributes: ["status"],
      raw: true,
    });

    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }
    if (interview.status === "active" || interview.status === "scheduled") {
      await Interview.update({ status: "paused" }, { where: { id } });
      return res
        .status(200)
        .json({ message: "Interview paused successfully." });
    }

    res
      .status(400)
      .json({
        message:
          "Interview cannot be paused unless it is in 'started' or 'scheduled' status.",
      });
  } catch (error) {
    console.error("Error pausing interview:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ where: { id } });
    if (!interview) {
      return res.status(404).json({ message: "Interview not found." });
    }
    await interview.destroy();
    res.status(200).json({ message: "Interview deleted successfully." });
  } catch (error) {
    console.error("Error deleting interview:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAllStudents = async (req: Request, res: Response) => {
  const { year } = req.query;

  try {
    const whereCondition = year ? { year: parseInt(year as string) } : {};

    const students = await Student.findAll({
      where: whereCondition,
      attributes: ["roll_number", "username", "year", "department_id"],
    });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

const upload = multer({ storage: multer.memoryStorage() });

export const addStudents = [
  upload.single("studentsFile"),
  async (req: Request & { file: Express.Multer.File }, res: Response) => {
    const rollnumber = res.locals.jwtData.rollnumber;
    const year = req.body.year

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    try {
      const admin = (
        await Admin.findOne({ where: { roll_number: rollnumber } })
      ).get();
      if (!admin) return res.status(404).json({ message: "Admin not found." });

      const fileBuffer = req.file.buffer;

      try {
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        const studentsData = XLSX.utils.sheet_to_json(sheet);
        // const studentsData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        console.log("Parsed studentsData with header:", studentsData);

        console.log("File buffer length:", fileBuffer.length);
        console.log("Workbook:", workbook);

        // console.log('Parsed studentsData:', studentsData);
        console.log("Sheet:", sheet);

        for (const student of studentsData) {
          const studentData = student as any;

          if (!studentData.rollnumber) {
            console.warn(
              `Skipping student with missing data: ${JSON.stringify(
                studentData
              )}`
            );
            continue;
          }

          const department =  (
            await Department.findOne({
              where: {
                college_id: admin.college_id,
                name: studentData.department,
              },
            })
          ).get();
          console.log("Department:", department.id);
          if (!department) {
            console.warn(
              `Skipping student with non-existent department: ${studentData.department}`
            );
            continue;
          }

          const existingStudent = await Student.findOne({
            where: { roll_number: studentData.rollnumber },
          });
          if (existingStudent) {
            console.warn(
              `Skipping duplicate roll number: ${studentData.rollnumber}`
            );
            continue;
          }

          try {
            const defaultPassword = await College.findOne({
              where: { id: admin.college_id },
            }).then((college) => college.get().defaultPassword);
            console.dir(studentData);
            console.log(`Adding student: ${JSON.stringify(studentData)}`);
            const newPassword = await Hashing(defaultPassword);
            const newStudent = await Student.create({
              roll_number: studentData.rollnumber,
              username: studentData.name,
              year: year,
              semester: 1,
              department_id: department.id,
              section: "default",
              password: newPassword ,
              college_id: admin.college_id,
            });
            console.log(`Student added: ${JSON.stringify(newStudent)}`);
          } catch (creationError) {
            console.error(
              `Failed to add student ${studentData.rollnumber}:`,
              creationError
            );
          }
        }

        res.status(201).json({ message: "Students added successfully." });
      } catch (fileError) {
        console.error("Error reading or parsing file:", fileError);
        res.status(400).json({ message: "Invalid file format." });
      }
    } catch (error) {
      console.error("Error adding students:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
];

export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { rollnumber } = req.params;
    const student = await Student.findOne({
      where: { roll_number: rollnumber },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    await student.destroy();
    res.status(200).json({ message: "Student deleted successfully." });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const changePassword = async (req: Request, res: Response) => {
    const rollnumber = res.locals.jwtData.rollnumber;
    const { oldPassword, newPassword } = req.body;
    console.log("Change password request:", req.body);

    try {
        const user = await Admin.findOne({ where: { roll_number: rollnumber } });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const userPassword = user.get().password;
        const isPasswordValid = await compare(oldPassword, userPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid old password." });
        }

        const hashedPassword = await Hashing(newPassword);
        await user.update({ password: hashedPassword });

        res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

export const getAttendance = async (req, res) => {
  try {
    const admin_rollnumber = res.locals.jwtData.rollnumber; 
    const interviewId = req.params.id;
    const interview = await Interview.findByPk(interviewId);
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found.' });
    }
    const admin = await Admin.findByPk(admin_rollnumber);
    if (admin.get().college_id!== interview.get().collage_id) {
      return res.status(403).json({ message: 'You are not authorized to view attendance for this interview.' });
    }
    if (interview.get().status === 'scheduled') {
      return res.status(200).json({ message: 'Interview is scheduled but not started yet.' });
    }

    const interviewInstances = await InterviewInstance.findAll({
      where: { interview_ref: interviewId },
    });

    if (interviewInstances.length === 0) {
      return res.status(200).json({ message: 'No one has attended or the interview is not started yet.' });
    }

    if (interview.get().status === 'active') {
      const activeData = interviewInstances.map(instance => ({
        rollnumber: instance.get().student_roll,
        submitted: instance.get().status,
        total_marks: instance.get().status === "submitted" ? instance.get().marks : null
      }));

      return res.status(200).json({ activeData, numberOfStudents: interviewInstances.length , numberOfSubmitted: interviewInstances.filter(instance => instance.get().status === 'submitted').length });
    }
    if (interview.get().status === 'paused') {
      //get all students from the collage of interview and every department in the department from the InterviewToDepartment table
      const departments = await InterviewToDepartment.findAll({
        where: { interview_id: interviewId },
        attributes: ['department_id']
      });

      const students = await Promise.all(departments.map(async (department) => {
        return Student.findAll({
          where: { department_id: department.get().department_id, college_id: admin.get().college_id },
          attributes: ['rollnumber']
        });
      }));

      const flattenedStudents = students.flat();

      const pausedData = await Promise.all(flattenedStudents.map(async (s) => {
        const instance = await InterviewInstance.findOne({
          where: { student_roll: s.get().roll_number, interview_ref: interviewId }
        });
        if (instance) {
          return {
            rollnumber: s.get().roll_number,
            present: true,
            total_marks: instance.get().marks
          };
        } else {
          return {
            rollnumber: s.get().roll_number,
            present: false,
            total_marks: null
          };
        }
      }));

      return res.status(200).json(pausedData);
    }

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

export const get_student_profile = async (req: Request, res: Response) => {
  const rollnumber = req.params.rollnumber;
  try {
    const student = await Student.findOne({
      where: { roll_number: rollnumber },
      include: [
        { model: EvalMetrics },
        {
          model: InterviewInstance,
          attributes: ["feedback", "createdAt", "marks"],
        },
      ],
    });

    if (!student) {
      return res.status(401).json({ message: "User not found." });
    }
    const resume = await Resume.findOne({ where: { roll_number: rollnumber } });
    let resumedata;
    if (!resume) {
      resumedata = "Pls upload your resume";
    } else {
      resumedata = resume.get().resume_context;
    }

    const { password, ...userWithoutPassword } = student.get();

    res.status(200).json({ user: userWithoutPassword, resume: resumedata });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteAllStudents = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const year = req.query.year;

    const admin = (await Admin.findOne({ where: { roll_number: rollnumber } })).get()
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    await Student.destroy({
      where: { college_id: admin.college_id, year: parseInt(year as string) },
    });
    res.status(200).json({ message: "All students deleted successfully." });
  } catch (error) {
    console.error("Error deleting all students:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const view_student = async(req: Request, res: Response) => {
  try {
    const admin_rollnumber = res.locals.jwtData.rollnumber;
    const student_rollnumber = req.params.rollnumber;

    const admin = (await Admin.findOne({ where: { roll_number: admin_rollnumber } })).get();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const student = await Student.findOne({
      where: {
        college_id: admin.college_id,
        roll_number: student_rollnumber,
      },
    });

    const {password , ...studentWithoutPassword} = student.get();

    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    res.status(200).json(studentWithoutPassword);
    
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "can't get profile" });
  }
}

export const resetStudentPassword = async (req: Request, res: Response) => {
  try {
    const adminRollNumber = res.locals.jwtData.rollnumber;
    const studentRollNumber = req.params.rollnumber;

    const admin = (await Admin.findOne({ where: { roll_number: adminRollNumber } })).get();
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const student = await Student.findOne({
      where: {
        college_id: admin.college_id,
        roll_number: studentRollNumber,
      },
    });
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }
    console.log("Student:", student);
    const college = (await College.findOne({ where: { id: admin.college_id } })).get();
    if (!college) {
      return res.status(404).json({ message: "College not found." });
    }
    console.log("College:", college);
    const studentPassword = await Hashing(college.defaultPassword);
    await student.update({ password: studentPassword });
    res.status(200).json({ message: "Student password reset successfully." });
  } catch (error) {
    console.error("Error resetting student password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};




export const setPreferences = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const admin = (await Admin.findOne({ where: { roll_number: rollnumber } }));
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }

    const { preferences } = req.body;
    console.log("Preferences:", preferences);
    await Admin.update({ preferences: preferences }, { where: { roll_number: rollnumber } });
    console.log("Preferences updated successfully.\n\n\n");
    res.status(200).json({ message: "Preferences updated successfully." });
  } catch (error) {
    console.error("Error setting preferences:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const getPreferences = async (req: Request, res: Response) => {
  try {
    const rollnumber = res.locals.jwtData.rollnumber;
    const admin = (await Admin.findOne({ where: { roll_number: rollnumber } }));
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
    const adminData = admin.get();
    res.status(200).json(adminData.preferences);
  } catch (error) {
    console.error("Error getting preferences:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export const getInterwievResult = async (req: Request, res: Response) => {
  const aroll = res.locals.jwtData.rollnumber;
  const { id, rollNumber } = req.params;
  try {
    const admin = await Admin.findOne({ where: { roll_number: aroll } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found." });
    }
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





export const getStudentAttendance = async (req: Request, res: Response) => {
  const aroll = res.locals.jwtData.rollnumber;
  const {rollNumber} =req.params;
  try {
    const admin = await Admin.findOne({ where: { roll_number: aroll } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found."
      });
    }
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
  const aroll = res.locals.jwtData.rollnumber;
  const {rollNumber} = req.params;
  try {
    const admin = await Admin.findOne({ where: { roll_number: aroll } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found."
      });
    };
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
