import axios from "axios";
import toast from "react-hot-toast";

export const createNewInterview = async (interviewData: {
  name: string;
  subject: string;
  topic: string;
  departments: string[];
  no_of_questions: number;
  no_of_coding_questions: number;
}) => {
  try {
    console.log(interviewData + " is the Interview Data");
    const res = await axios.post("/admin/create_interview", interviewData);
    console.log(res.status);
    if (res.status !== 201) {
      throw new Error("Failed to create interview");
    }
    toast.success("Interview created successfully");
    return res.data;
  } catch (error) {
    console.error("Error creating interview:", error);
    toast.error("Failed to create interview");
    throw error;
  }
};

export const getAllInterviews = async () => {
  try {
    const res = await axios.get("/admin/get_interviews");
    if (res.status !== 200) {
      throw new Error("Failed to fetch interviews");
    }

    const parsedData = res.data.map((interview: any) => ({
      id: interview.id,
      name: interview.name,
      subject: interview.subject,
      departments: interview.departments
        .map((dept: any) => dept.name + " ")
        .join("- "), // Map departments to an array of names
      topic: interview.topic,
      no_of_questions: interview.no_of_questions,
      no_of_coding_questions: interview.no_of_coding_questions,
      status: interview.status,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    }));

    return parsedData;
  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw error;
  }
};
export const createInterview = async (interviewData: {
  name: string;
  subject: string;
  department: string[];
  topic: string;
}) => {
  try {
    const res = await axios.post("/admin/create_interview", interviewData);
    console.log(res.status);
    if (res.status !== 201) {
      throw new Error("Failed to create interview");
    }
    toast.success("Interview created successfully");
    return res.data;
  } catch (error) {
    console.error("Error creating interview:", error);
    toast.error("Error creating interview");
    throw error;
  }
};

export const updateInterviewStatus = async (id: string, status: string) => {
  try {
    const res = await axios.put(`/admin/update_interview_status/${id}`, {
      status,
    });
    if (res.status !== 200) {
      throw new Error("Failed to update interview status");
    }
    toast.success("Interview status updated successfully");
    return res.data;
  } catch (error) {
    console.error("Error updating interview status:", error);
    toast.error("Failed to update interview status");
    throw error;
  }
};

export const deleteInterview = async (id: string) => {
  try {
    const res = await axios.delete(`/admin/delete_interview/${id}`);
    if (res.status !== 200) {
      throw new Error("Failed to delete interview");
    }
    toast.success("Interview deleted successfully");
    return res.data;
  } catch (error) {
    console.error("Error deleting interview:", error);
    toast.error("Failed to delete interview");
    throw error;
  }
};

export const startInterview = async (id: string) => {
  try {
    const res = await axios.put(`/admin/start_interview/${id}`);
    if (res.status !== 200) {
      throw new Error("Failed to start interview");
    }
    toast.success("Interview started successfully");
    return res.data;
  } catch (error) {
    console.error("Error starting interview:", error);
    toast.error("Failed to start interview");
    throw error;
  }
};

export const pauseInterview = async (id: string) => {
  try {
    const res = await axios.put(`/admin/pause_interview/${id}`);
    if (res.status !== 200) {
      throw new Error("Failed to pause interview");
    }
    toast.success("Interview paused successfully");
    return res.data;
  } catch (error) {
    console.error("Error pausing interview:", error);
    toast.error("Failed to pause interview");
    throw error;
  }
};

export const getInterviewId = async (interviewData: {
  name: string;
  subject: string;
  topic: string;
  departments: string[];
  no_of_questions: number;
  no_of_coding_questions: number;
}) => {
  try {
    const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
    const res = await axios.post("/admin/create_interview", interviewData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status !== 201) {
      throw new Error("Failed to create interview");
    }
    return res.data.id; // Assuming the response contains the interview ID
  } catch (error) {
    console.error("Error getting interview ID:", error);
    throw error;
  }
};

export const submitInterview = async (interview_id:string) => {
  try {
    
    const res = await axios.get(`/interivew/submit_interview/${interview_id}`);
    if (res.status !== 200) {
      throw new Error("Failed to submit interview");
    }
    toast.success("Interview submitted successfully");
    return res.data;
  } catch (error) {
    console.error("Error submitting interview:", error);
    toast.error("Failed to submit interview");
    throw error;
  }
};
