import { getWholeStudentInfo } from "@/Communicators/studentCommunications";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react"; // Add Loader2 import
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { getDepartment, resetStudentPassword, updateStudent } from '../../Communicators/apiCommunications'; // Added getDepartment import

interface Interview {
  id: string;
  name: string;
  status: "Completed" | "In Progress" | "Not Attended";
  score?: number;
}

export function ViewStudent() {
  const navigate = useNavigate(); // Add useNavigate hook
  const { rollNumber } = useParams<{ rollNumber: string }>();
  
  interface StudentData {
    attendance: number;
    college_id: number; // Changed from string to number
    createdAt: string;
    department_id: number; // Changed from string to number
    roll_number: string;
    section: string;
    semester: number; // Changed from string to number
    updatedAt: string;
    username: string;
    year: number;
  }
  
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [attendancePercentage, setAttendancePercentage] = useState(0); // Initialize to 0
  
  const [isDataLoading, setIsDataLoading] = useState(true); // New state
  const [evaluation, setEvaluation] = useState<any>(null); // new state for evaluationMetrics

  useEffect(() => {
    const fetchStudentData = async () => {
      if (rollNumber) {
        try {
          const data = await getWholeStudentInfo(rollNumber);
          // Destructure response
          const { studentProfile, evaluationMetrics, interviewSummary } = data;
          console.log("Fetched whole student info:", data);
          setStudentData(studentProfile);
          
          // Get the department name from getDepartment
          const departmentName = await getDepartment(studentProfile.department_id);
          
          // Set student details from studentProfile with department mapping
          const updatedDetails = {
            name: studentProfile.username || "",
            rollNo: studentProfile.roll_number || "",
            year: `${studentProfile.year}` || "",
            branch: departmentName || `Department ${studentProfile.department_id}`,
            section: studentProfile.section || "",
          };
          setStudentDetails(updatedDetails);
          setInitialDetails(updatedDetails);
          
          // Compute attendance percentage from interviewSummary
          if (interviewSummary.total_interviews > 0) {
            setAttendancePercentage(
              Math.round((interviewSummary.attempted_interviews / interviewSummary.total_interviews) * 100)
            );
          } else {
            setAttendancePercentage(studentProfile.attendance || 0);
          }
          
          // Save evaluation metrics for proficiency levels
          if (evaluationMetrics && evaluationMetrics.length > 0) {
            setEvaluation(evaluationMetrics[0]);
          }
          // Set interviewsResponse so table data appears
          setInterviewsResponse(interviewSummary);
        } catch (error) {
          console.error("Error fetching whole student info:", error);
        } finally {
          setIsDataLoading(false);
        }
      }
    };
    fetchStudentData();
  }, [rollNumber]);
  
  useEffect(() => {
    console.log("Roll Number:", rollNumber);
  }, [rollNumber]);

  const [searchTerm, setSearchTerm] = useState("");
  
  const initialStudentDetails = {
    name: "",
    rollNo: "",
    year: "",
    branch: "",
    section: "",
  };

  const [studentDetails, setStudentDetails] = useState(initialStudentDetails);
  const [initialDetails, setInitialDetails] = useState(initialStudentDetails); // New state for initial details
  const [hasChanges, setHasChanges] = useState(false); // New state to track changes

  useEffect(() => {
    // Check if any field has changed
    const changes = Object.keys(studentDetails).some(
      (key) => studentDetails[key as keyof typeof studentDetails] !== initialDetails[key as keyof typeof initialDetails]
    );
    setHasChanges(changes);
  }, [studentDetails, initialDetails]);

  const [isLoading, setIsLoading] = useState(false); 
  const [loadingAction, setLoadingAction] = useState<"update" | "reset" | null>(null); 

  const barColor =
    attendancePercentage >= 80
      ? "bg-green-500"
      : attendancePercentage >= 65
      ? "bg-yellow-500"
      : "bg-red-500";

  const handleUpdate = async () => {
    if (!rollNumber || !studentData) return;
  
    const updatedData = {
      username: studentDetails.name,
      year: parseInt(studentDetails.year) || studentData.year,
      semester: studentData.semester || 1, // No need to parseInt since it's already a number
      department_id: studentData.department_id || 0,
      section: studentDetails.section || studentData.section,
      college_id: studentData.college_id || 0,
      attendance: attendancePercentage,
    };
  
    try {
      setLoadingAction("update");
      setIsLoading(true);
      await updateStudent(rollNumber, updatedData);
      setInitialDetails(studentDetails); 
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleResetPassword = async () => {
    if (!rollNumber) return;

    setLoadingAction("reset");
    setIsLoading(true);

    try {
      await resetStudentPassword(rollNumber);
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  const handleViewInterview = (interviewId: string) => {
    navigate("/admin/view-analysis", { state: { rollNo: studentDetails.rollNo, interviewId } });
  }

  // New state for interviews API response
  const [interviewsResponse, setInterviewsResponse] = useState<{
    total_interviews: number;
    attempted_interviews: number;
    interview_details: {
      interview_id: string;
      interview_name: string;
      subject: string;
      topic: string;
      status: string;
      marks: number;
    }[];
  } | null>(null);

  // Replace filtering of mockInterviews with interview_details from API
  const filteredInterviews = (
    (interviewsResponse && interviewsResponse.interview_details) || []
  ).filter((interview) =>
    interview.interview_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Replace old weeklyPerformance and proficiencyLevels with the following:
  const weeklyPerformance = interviewsResponse
    ? interviewsResponse.interview_details.map((interview, index) => ({
        index: index, // Add index to use for xAxis instead of name
        week: interview.interview_name,
        score: interview.marks*10,
      }))
    : [];

  const proficiencyLevels = evaluation
    ? [
        { name: "Problem Solving", value: Number(evaluation.problem_solving) },
        { name: "Code Quality", value: Number(evaluation.code_quality) },
        { name: "Debugging", value: Number(evaluation.debugging) },
      ]
    : [
        { name: "Problem Solving", value: 0 },
        { name: "Code Quality", value: 0 },
        { name: "Debugging", value: 0  },
      ];

  return (
    <div className="container mx-auto p-6 min-h-screen pt-20 font-sans">
      {isDataLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-800 mr-4" />
          <p className="text-gray-800 font-semibold">Loading student data...</p>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-black opacity-50 backdrop-blur-sm"></div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="bg-white p-6 rounded-lg shadow-xl z-10 flex flex-col items-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-gray-800 mb-4" />
                  <p className="text-gray-800 font-semibold">
                    {loadingAction === "update" ? "Updating student information..." : "Resetting password..."}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                       <div>
              <h1 className="text-4xl font-bold mb-4 text-gray-900">
                {/* {studentDetails.name} Updated to display dynamic name */}
                Student Details
              </h1>
              <div className="p-6 bg-white rounded shadow-md">
                <div className="mb-2 flex items-center">
                  <strong className="w-24">Name:</strong> {/* Added Name field */}
                  <input
                    type="text"
                    value={studentDetails.name}
                    onChange={(e) => setStudentDetails({ ...studentDetails, name: e.target.value })}
                    className="ml-2 border px-2 py-1 rounded flex-grow"
                  />
                </div>
                <div className="mb-2 flex items-center">
                  <strong className="w-24">Roll No:</strong>
                  <input
                    type="text"
                    disabled
                    value={studentDetails.rollNo}
                    className="ml-2 border px-2 py-1 rounded flex-grow cursor-not-allowed"
                  />
                </div>
                <div className="mb-2 flex items-center">
                  <strong className="w-24">Year:</strong>
                  <input
                    type="text"
                    value={studentDetails.year}
                    onChange={(e) => setStudentDetails({ ...studentDetails, year: e.target.value })}
                    className="ml-2 border px-2 py-1 rounded flex-grow"
                  />
                </div>
                <div className="mb-2 flex items-center">
                  <strong className="w-24">Branch:</strong>
                  <input
                    type="text"
                    disabled
                    value={studentDetails.branch}
                    className="ml-2 border px-2 py-1 rounded flex-grow cursor-not-allowed"
                  />
                </div>
                {/* <div className="mb-2 flex items-center">
                  <strong className="w-24">Section:</strong>
                  <input
                    type="text"
                    value={studentDetails.section}
                    onChange={(e) => setStudentDetails({ ...studentDetails, section: e.target.value })}
                    className="ml-2 border px-2 py-1 rounded flex-grow"
                  />
                </div> */}
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdate}
                    disabled={!hasChanges} // Disable button if no changes
                    className={`mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 ${
                      !hasChanges ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Update Now
                  </button>
                  <button
                    onClick={handleResetPassword}
                    className="mt-4 bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 bg-white rounded shadow-md w-full">
              <h2 className="text-3xl font-semibold mb-4 text-gray-800">
                Weekly Performance
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" tick={false} /> {/* Remove visible labels */}
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(label, payload) => {
                      return payload && payload.length > 0 ? payload[0].payload.week : label; // Display interview name in tooltip
                    }} 
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mb-6 flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 w-full">
              <div className="p-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-semibold mb-2 text-gray-800">
                  Proficiency Levels
                </h2>
                <ul className="space-y-2">
                  {proficiencyLevels.map((skill) => (
                    <li key={skill.name} className="flex justify-between">
                      <span className="font-medium">{skill.name}</span>
                      <span>{skill.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:w-2/3 w-full mt-4 md:mt-0 md:ml-6">
              <div className="p-6 bg-white rounded shadow-md">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={proficiencyLevels}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Attendance
            </h2>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${barColor} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${attendancePercentage}%` }}
                transition={{ duration: 1 }}
              />

              <div className="absolute inset-0 flex items-center justify-end pr-3">
                <span className="text-gray-800 font-medium">
                  {attendancePercentage}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Interviews
            </h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm border px-3 py-2 rounded-md"
              />
            </div>
            <div
              className="bg-white rounded-lg shadow-md overflow-hidden"
              style={{ height: "400px", overflowY: "auto" }}
            >
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-3 text-lg">Interview Name</th>
                    <th className="text-left p-3 text-lg">Subject</th>
                    <th className="text-left p-3 text-lg">Status</th>
                    <th className="text-left p-3 text-lg">Score</th>
                    <th className="text-left p-3 text-lg">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map((interview) => (
                    <tr key={interview.interview_id} className="border-t border-gray-200">
                      <td className="p-3">{interview.interview_name}</td>
                      <td className="p-3">{interview.subject}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-semibold ${
                            interview.status === "submitted"
                              ? "bg-green-200 text-green-800"
                              : interview.status === "in progress"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {interview.status}
                        </span>
                      </td>
                      <td className="p-3">{interview.marks*10 || "-"}</td>
                      <td className="p-3">
                        <motion.button
                          onClick={interview.status !== "not_attempted" ? () => handleViewInterview(interview.interview_id) : undefined}
                          whileHover={interview.status !== "not_attempted" ? { scale: 1.05 } : {}}
                          whileTap={interview.status !== "not_attempted" ? { scale: 0.9 } : {}}
                          className={`px-3 py-1 rounded ${
                            interview.status !== "not_attempted" 
                              ? "bg-gray-800 text-white cursor-pointer" 
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          View
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


