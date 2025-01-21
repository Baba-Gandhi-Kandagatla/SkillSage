import { getAllInterviews, getSubmittedInterviews } from '@/Communicators/studentCommunications'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatePresence, motion } from 'framer-motion'
import { AlertOctagonIcon, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Interview {
  id: string
  title: string
  subject: string
  topic: string
  status: 'scheduled' | 'active' | 'paused'
  isSubmitted?: boolean
}

interface APIInterview {
  id: string
  name: string
  subject: string
  topic: string
  status: 'scheduled' | 'active' | 'paused'
}

interface InterviewInstance {
  
}

// {
//   "interviews": [
//     {
//       "id": "49",
//       "name": "iv1",
//       "collage_id": "1",
//       "subject": "JAVA",
//       "topic": "\"Error handling, OOPS\"",
//       "no_of_questions": 6,
//       "no_of_coding_questions": 6,
//       "status": "scheduled",
//       "createdAt": "2024-12-08T08:10:42.618Z",
//       "updatedAt": "2024-12-08T08:10:42.618Z",
//       "InterviewToDepartments": [
//         {
//           "id": "49",
//           "interview_id": "49",
//           "department_id": "47",
//           "createdAt": "2024-12-08T08:10:42.625Z",
//           "updatedAt": "2024-12-08T08:10:42.625Z"
//         }
//       ]
//     }
//   ]
// }

export function StudentInterviews() {
  console.log("opened student interviews");
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [submittedInterviewIds, setSubmittedInterviewIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate();
  const showPausedInterviews = false; // Flag to show or hide paused interviews this is just for developer friendlness, don't remove these

  const fetchInterviews = async () => {
    setIsLoading(true)
    try {
      const [interviewsResponse, submittedResponse] = await Promise.all([
        getAllInterviews(),
        getSubmittedInterviews()
      ]);

      const submittedIds = submittedResponse.interviews.map((interview: APIInterview) => interview.id);
      setSubmittedInterviewIds(submittedIds);

      setInterviews(interviewsResponse.interviews.map((interview: APIInterview) => ({
        id: interview.id,
        title: interview.name,
        subject: interview.subject,
        topic: interview.topic,
        status: interview.status,
        isSubmitted: submittedIds.includes(interview.id)
      })))
    } catch (error) {
      console.error('Failed to fetch interviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInterviews()
  }, [])

  const refreshInterviews = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      fetchInterviews().finally(() => setIsRefreshing(false))
    }, 2000)
  }

  const startInterview = (interviewId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/student/interview/${interviewId}`);
    }, 2000);
  };

  // Filter and sort interviews
  const filteredInterviews = interviews.filter(interview => showPausedInterviews || interview.status !== 'paused');
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return 0;
  });

  return (
    <div className="container mx-auto px-4 pt-20 pb-8 font-sans">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-bold text-gray-900">Your Interviews</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Refresh</span>
          <Button
            onClick={refreshInterviews}
            variant="outline"
            size="icon"
            className="rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </motion.div>
      {sortedInterviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64">
          <AlertOctagonIcon className="h-12 w-12 text-yellow-500" />
          <p className="text-gray-600 mt-4">No interviews found.</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {sortedInterviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="bg-gray-100">
                  <div className="flex flex-row justify-between items-center">
                    <CardTitle className="text-xl font-semibold">{interview.title}</CardTitle>
                    <Button
                      variant={interview.status === 'active' ? 'default' : 'secondary'}
                      size="sm"
                      className="shadow-md hover:shadow-lg transition-shadow duration-300"
                      disabled={interview.status !== 'active' || interview.isSubmitted}
                      onClick={() => interview.isSubmitted ? null : startInterview(interview.id)}
                    >
                      {interview.isSubmitted ? 'Submitted' :
                       interview.status === 'active' ? 'Start Interview' : 
                       interview.status === 'scheduled' ? 'Scheduled' : 'Paused'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-row justify-between items-center">
                    <div className='flex flex-col gap-4 '>
                    <p className="text-gray-600"><b>Subject</b>: {interview.subject}</p>
                    <p className="text-gray-600"><b>Topic</b>: {interview.topic}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      interview.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      interview.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white p-6 rounded-lg shadow-xl flex items-center space-x-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-lg font-semibold">Loading interview...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}