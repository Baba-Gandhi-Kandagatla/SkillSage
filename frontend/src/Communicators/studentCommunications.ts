import axios from 'axios'
// ...existing code...

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

// ...existing code...
