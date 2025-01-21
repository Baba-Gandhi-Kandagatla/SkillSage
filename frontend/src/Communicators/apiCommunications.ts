import axios from "axios";
import toast from "react-hot-toast";
// import { setTimeout } from "timers/promises";

export const loginUser = async (rollnumber: string, password: string) => {
  try {
    // rollnumber = rollnumber.toUpperCase()
    console.log("Logging in with rollnumber:", rollnumber);
    const res = await axios.post("/login", { rollNumber: rollnumber, password });
    if (res.status !== 200) {
      throw new Error("Unable to login");
    }
    const data = await res.data;
    console.log(data);
    toast.success("Logged in successfully");
    return {
      rollnumber: data.rollNumber,
      role: data.role,
      username: data.username,
    };
  } catch (error) {
    toast.error("Cannot Login, Check your credintials");
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
    toast.success("Department deleted successfully");
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
    console.error("Error adding students:", error);
    throw error;
  }
};

export const addStudent = async (
  rollnumber: string,
  name: string,
  department_name: string,
  year: number
) => {
  try {
    const res = await axios.post("/admin/add_student", {
      rollnumber,
      name,
      department_name,
      year,
    });

    if (res.status !== 201) {
      toast.error("Failed to add student");
      throw new Error("Failed to add student");
    }
    toast.success("Student added successfully");
    return res.data;
  } catch (error: any) {
    console.error("Error adding student:", error);
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
    // throw error
  }
};

export const getAllStudents = async (year: string) => {
  try {
    const res = await axios.get(`/admin/get_students?year=${year}`);
    if (res.status !== 200) {
      throw new Error("Unable to fetch students");
    }
    return res.data;
  } catch (error) {
    console.error("Error fetching students:", error);
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
    console.error("Error deleting student:", error);
    toast.error("Failed to delete student", error);
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
      "/api/v1/student/changepassword",
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
    console.log(response.data);
    return response.data;
  } catch (error) {
    // toast.error("Failed to fetch interview preferences"); // Remove toast
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
    // toast.error("Failed to save interview preferences"); // Remove toast
  }
};
