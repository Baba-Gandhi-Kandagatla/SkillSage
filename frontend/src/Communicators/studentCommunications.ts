import { useAuth } from '@/Context/AuthContext'
import axios from 'axios'

export const getAllInterviews = async () => {
  const response = await axios.get('student/get_all_interviews')
  return response.data
}

export const uploadStudentResume = async (formData: FormData) => {
  const response = await axios.post('student/upload_resume', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getStudentResume = async () => {
  const response = await axios.get('student/get_resume')
  return response.data
}

export const getSubmittedInterviews = async () => {
  try {
    const response = await axios.get('/student/getCompletedInterviews');
    return response.data;
  } catch (error) {
    console.error('Error fetching submitted interviews:', error);
    throw error;
  }
};

export const getInterviewResult = async (interviewId: string, rollnumber: string = '', role?: string) => {
  if (role === 'admin') {
    console.log('Admin role detected. Fetching interview result as admin.');
    console.log('Interview ID:', interviewId);
    console.log('Roll Number:', rollnumber);
    // If rollnumber is provided, use it. Otherwise, fetch overall result for the interview.
    const url = rollnumber 
      ? `/admin/getInterviewResult/${interviewId}/${rollnumber}` :"/"
    console.log('Admin Endpoint:', url);
    try {
      const response = await axios.get(url);
      console.log('Admin response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview result:', error);
      throw error;
    }
  } else {
    try {
      const response = await axios.get(`/student/getInterwievResult/${interviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching interview result:', error);
      throw error;
    }
  }
};

export const getWholeStudentInfo = async (rollNumber: string) => {
  try {
    const response = await axios.get(`/admin/getViewStudentDetails/${rollNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student info:', error);
    throw error;
  }
}


export const getOnlyEvalMetrics = async ()=> {

    try {

      const response = await axios.get('/student/evalMetrics');
      return response.data;
    } catch (error) {
      console.error('Error fetching student info:', error);
      throw error
      
    }
}