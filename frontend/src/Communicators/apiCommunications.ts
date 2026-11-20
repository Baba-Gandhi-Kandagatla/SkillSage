import axios from "axios";
import toast from "react-hot-toast";
// import { setTimeout } from "timers/promises";

export const loginUser = async (rollnumber: string, password: string) => {
  const loadingToast = toast.loading("Logging in...");
  try {
    console.log("Logging in with rollnumber:", rollnumber);
    const res = await axios.post("/login", { rollNumber: rollnumber, password });
    if (res.status !== 200) {
      throw new Error("Unable to login");
    }
    const data = await res.data;
    console.log(data);
    toast.success("Logged in successfully", { id: loadingToast });
    return {
      rollnumber: data.rollNumber,
      role: data.role,
      username: data.username,
    };
  } catch (error) {
    toast.error("Cannot Login, Check your credentials", { id: loadingToast });
    console.error("Error logging in:", error);
    throw error;
  }
};

export const checkAuthStatus = async () => {
  try {
    const res = await axios.get("/auth_status");
    if (res.status !== 200) {
      throw new Error("Unable to authenticate");
    }
    const data = await res.data;
    console.log(data.rollNumber  + "thiis is the data ")
    return {
      rollNumber: data.rollNumber,
      role: data.role,
      username: data.username,
    };
  } catch (error) {
    // toast.error("Authentication failed");
    console.error("Error checking auth status:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const res = await axios.get("/logout");
    if (res.status !== 200) {
      throw new Error("Unable to logout");
    }
    const data = res.data;
    toast.success("Logged out successfully");
    return data;
  } catch (error) {
    toast.error("Unable to logout");
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getAllDepartments = async () => {
  try {
    const res = await axios.get("/admin/get_all_departments");
    if (res.status !== 200) {
      throw new Error("Unable to fetch departments");
    }
    return res.data as {
      id: string;
      name: string;
      college_id: string;
      createdAt: string;
      updatedAt: string;
    }[];
  } catch (error) {
    toast.error("Failed to fetch departments");
    console.error("Error fetching departments:", error);
    throw error;
  }
};

export const getDepartment = async (id: BigInt) => {
  try {
    const res = await axios.get(`/admin/get_department/${id}`);
    if (res.status !== 200) {
      throw new Error("Unable to fetch department");
    }
    return res.data;
  } catch (error) {
    toast.error("Failed to fetch department");
    console.error("Error fetching department:", error);
    throw error;
  }
};

export const addDepartment = async (name: string) => {
  try {
    const res = await axios.post("/admin/add_department", { name });
    if (res.status !== 201) {
      throw new Error("Failed to add department");
    }
    return res.data;
  } catch (error) {
    toast.error("Failed to add department");
    console.error("Error adding department:", error);
    throw error;
  }
};

export const deleteDepartment = async (name: string) => {
  try {
    const res = await axios.delete(`/admin/delete_department/${name}`);
    if (res.status !== 200) {
      toast.error("cannot delete the Departmwent");
      // throw new Error("Failed to delete department")
    }
    // toast.success("Department deleted successfully");
    return res.data;
  } catch (error) {
    console.error("Error deleting department:", error);
    toast.error("unable to delete");
    throw error;
  }
};

export const getDefaultPassword = async () => {
  try {
    const res = await axios.get("/admin/getDefaultPassword");
    if (res.status !== 200) {
      throw new Error("Unable to fetch default password");
    }
    return res.data.defaultPassword;
  } catch (error) {
    toast.error("Failed to fetch default password");
    console.error("Error fetching default password:", error);
    throw error;
  }
};

export const addStudents = async (formData: FormData) => {
  try {
    const res = await axios.post("/admin/add_students", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (res.status !== 201) {
      // throw new Error("Failed to add students")
      toast.error("Failed to add students");
    }
    // setTimeout(() => {
    //     window.location.reload();
    // }, 0);
    toast.success("Students added successfully");
    return res.data;
  } catch (error) {
    toast.error("Failed to add students");
    console.error("Error adding students:", error);
    throw error;
  }
};

export const addStudent = async (
  rollnumber: string,
  name: string,
  department_name: string,
) => {
  try {
    const res = await axios.post("/admin/add_student", {
      rollnumber,
      name,
      department_name,
    });

    if (res.status !== 201) {
      toast.error("Failed to add student");
      throw new Error("Failed to add student");
    }
    toast.success("Student added successfully");
    return res.data;
  } catch (error: any) {
    if (error.response.status === 409) {
      toast.error("Student already exists");
      throw new Error("Student already exists");
    }
    if (error.response.status === 404) {
      toast.error(
        `Department ${department_name} not found. \nPlease add it in Admin Panel`
      );
      throw new Error("Department not found");
    }
    toast.error("Failed to add student");
    console.error("Error adding student:", error);
    // throw error
  }
};

export const getAllStudents = async (departmentId: number) => {
  try {
    const response = await axios.get(`/admin/getStudentsByDepartment/${departmentId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getAllStudents:", error);
    throw error;
  }
};

export const deleteAllStudents = async (year: number) => {
  try {
    console.log("Deleting all students for year:", year);
    const res = await axios.delete(`/admin/delete_all_students?year=${year}`);
    if (res.status !== 200) {
      throw new Error("Unable to delete all students");
    }
    return res.data;
  } catch (error) {
    toast.error("Failed to delete all students");
    console.error("Error deleting all students:", error);
    throw error;
  }
};

export const deleteStudent = async (id: string) => {
  try {
    const res = await axios.delete(`/admin/students/${id}`);
    if (res.status !== 200) {
      throw new Error("Unable to delete student");
    }
    toast.success("Student deleted successfully");
    return res.data;
  } catch (error: any) {
    toast.error("Failed to delete student");
    console.error("Error deleting student:", error);
    throw error;
  }
};

export const getStudentViewStudent = async (rollnumber: string) => {
  try {
    const res = await axios.get(
      `/admin/get_student_view_student/${rollnumber}`
    );
    if (res.status !== 200) {
      throw new Error("Unable to fetch student data");
    }
    return res.data; // Assuming the backend returns student data in res.data
  } catch (error) {
    toast.error("Failed to fetch student data");
    console.error("Error fetching student data:", error);
    throw error;
  }
};

export const setDefaultPasswordStudent = async (newPassword: string) => {
  try {
    const res = await axios.post("/admin/setDefaultPassword", { newPassword });
    console.dir(res);
    if (res.status !== 200) {
      throw new Error("Failed to set default password");
    }
    toast.success("Password set successfully");
    return res.data;
  } catch (error) {
    toast.error("Failed to set default password");
    console.error("Error setting default password:", error);
    toast.error("unable to change password");
    throw error;
  }
};

export const getStudentDetails = async () => {
  try {
    const res = await axios.get("/student/profile");
    if (res.status !== 200) {
      throw new Error("Unable to fetch student details");
    }
    return res.data.user;
  } catch (error) {
    toast.error("Failed to fetch student details");
    console.error("Error fetching student details:", error);
    throw error;
  }
};

export const changeStudentPassword = async (
  oldPassword: string,
  newPassword: string
) => {
  try {
    const res = await axios.post(
      "/student/changepassword",
      {
        oldPassword,
        newPassword,
      }
    );
    if (res.status !== 200) {
      toast.error("cannot change password");
      throw new Error("Unable to change password");
    }

    toast.success("Password Changed Successfully");
    return res.data;
  } catch (error) {
    toast.error("Failed to change password");
    console.error("Error changing password:", error);
    throw error;
  }
};

export const changeAdminPassword = async (
  oldPassword: string,
  newPassword: string
) => {
  try {
    const res = await axios.post("/admin/change_password", {
      oldPassword,
      newPassword,
    });
    if (res.status !== 200) {
      throw new Error("Unable to change password");
    }
    toast.success("Admin password reset successfully");
    return res.data;
  } catch (error) {
    toast.error("Failed to reset admin password");
    console.error("Error changing admin password:", error);
    throw error;
  }
};

export const updateStudent = async (
  rollNumber: string,
  studentData: {
    username: string;
    year: number;
    semester: number;
    department_id: number;
    section: string;
    college_id: number;
    attendance: number;
  }
) => {
  try {
    const response = await axios.put(
      `/admin/update_student/${rollNumber}`,
      studentData
    );
    if (response.status !== 200) {
      throw new Error("Failed to update student");
    }
    toast.success("Student updated successfully");
    return response.data;
  } catch (error: any) {
    toast.error("Failed to update student");
    console.error("Error updating student:", error);
    throw error;
  }
};

export const resetStudentPassword = async (rollNumber: string) => {
  try {
    const res = await axios.post(`/admin/reset_student_password/${rollNumber}`);
    if (res.status !== 200) {
      throw new Error("Failed to reset student password");
    }
    toast.success("Password reset successfully");
    return res.data;
  } catch (error) {
    console.error("Error resetting student password:", error);
    toast.error("Failed to reset password");
    throw error;
  }
};

export const getInterviewPreferences = async () => {
  try {
    const response = await axios.get("/admin/getpreference");
    // console.log(response.data);
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch interview preferences");
    // toast.error("Failed to fetch interview preferences"); // Remove toast
    throw error;
  }
};

export const setInterviewPreferences = async (prefs: {
  totalQuestions: number;
  codingQuestions: number;
}) => {
  try {
    const response = await axios.put("/admin/setpreference", {
      preferences: {
        total_questions: prefs.totalQuestions,
        no_of_coding_questions: prefs.codingQuestions,
      },
    });
    if (response.status !== 200) {
      // toast.error("Failed to save interview preferences"); // Remove toast
      return;
    }
    // toast.success("Interview preferences saved!"); // Remove toast
  } catch (error) {
    toast.error("Failed to save interview preferences");
    // toast.error("Failed to save interview preferences"); // Remove toast
    throw error;
  }
};

export const getInterviewAttendance = async (interviewId: string) => {
  try {
    const res = await axios.get(`/admin/get_attendence/${interviewId}`);
    if (res.status !== 200) {
      throw new Error("Unable to fetch attendance data");
    }
    toast.success("Data fetched successfully");
    return res.data;
  } catch (error) {
    toast.error("Failed to fetch attendance data");
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};



export const getStudentInterviewsByRollNumber = async (rollNumber: string) => {
  try {
    const response = await axios.get(`/admin/getStudAttendedInter/${rollNumber}`);
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch student interviews");
    console.error('Error fetching student interviews:', error);
    throw error;
  }
}


export const getDashboardData = async () => {

  try {
    const response = await axios.get("/admin/getDashboardData");
    return response.data;
  } catch (error) {
    toast.error("Failed to fetch dashboard data");
    throw error;
  }
}

export const getSubjects = async () => {
  try {
    const response = await axios.get('/admin/preferences/subjects');
    return response.data;
  } catch (error) {
    // toast.error('Failed to fetch subjects');
    console.error('Error fetching subjects:', error);
    throw error;
  }
};

export const addSubject = async (subjectName: string) => {
  try {
    const response = await axios.post('/admin/preferences/subject', {
      subject: subjectName
    });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Failed to add subject');
    }
    toast.success('Subject added successfully');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 400 && error.response.data.error === 'Subject already exists') {
      toast.error('Subject already exists');
      throw new Error('Subject already exists');
    } else {
      toast.error('Failed to add subject');
      console.error('Error adding subject:', error);
      throw error;
    }
  }
};

export const updateSubjectName = async (oldSubjectName: string, newSubjectName: string) => {
  try {
    const response = await axios.put(`/admin/preferences/subject/${oldSubjectName}`, {
      newName: newSubjectName
    });
    if (response.status !== 200) {
      throw new Error('Failed to update subject');
    }
    toast.success('Subject updated successfully');
    return response.data;
  } catch (error) {
    toast.error('Failed to update subject');
    console.error('Error updating subject:', error);
    throw error;
  }
};

export const deleteSubject = async (subjectName: string) => {
  try {
    const response = await axios.delete(`/admin/preferences/subject/${subjectName}`);
    if (response.status !== 200) {
      throw new Error('Failed to delete subject');
    }
    toast.success('Subject deleted successfully');
    return response.data;
  } catch (error) {
    toast.error('Failed to delete subject');
    console.error('Error deleting subject:', error);
    throw error;
  }
};

export const addSubtopicToSubject = async (subjectName: string, subtopic: string) => {
  try {
    const response = await axios.post('/admin/preferences/subject/subtopic', {
      subjectName,
      subtopic
    });
    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Failed to add subtopic');
    }
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 400 && error.response.data.error === 'Subtopic already exists') {
      console.log(`Subtopic "${subtopic}" already exists in subject "${subjectName}"`);
      // Don't throw an error or show a toast for this case
      return { subject: { name: subjectName, subtopics: [subtopic] }};
    } else {
      toast.error('Failed to add subtopic');
      console.error('Error adding subtopic:', error);
      throw error;
    }
  }
};

export const deleteSubtopicFromSubject = async (subjectName: string, subtopic: string) => {
  try {
    const response = await axios.delete(`/admin/preferences/subject/${subjectName}/subtopic/${subtopic}`);
    if (response.status !== 200) {
      throw new Error('Failed to delete subtopic');
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting subtopic:', error);
    throw error;
  }
};