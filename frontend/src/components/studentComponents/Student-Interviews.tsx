import { getAllInterviews, getSubmittedInterviews } from '@/Communicators/studentCommunications'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatePresence, motion } from 'framer-motion'
import { AlertOctagonIcon, Loader2, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge as Babji } from '../ui/badge'

interface Interview {
  InterviewInstance?: {
    status: string;
  }
  id: string
  title: string
  subject: string
  topic: string
  status: 'scheduled' | 'active' | 'paused'
  isSubmitted?: boolean
  no_of_questions: number; // added property
}

interface APIInterview {
  no_of_coding_questions: number
  id: string
  name: string
  subject: string
  topic: string
  status: 'scheduled' | 'active' | 'paused'
  no_of_questions: number
  predefined_questions: string[]
  InterviewInstances?: Array<{
    id: string
    interview_ref: string
    student_roll: string
    status: string
    marks: string
    violation: number
    feedback: any
  }>
}



export function StudentInterviews() {
  console.log("opened student interviews");
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [submittedInterviewIds, setSubmittedInterviewIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null)
  const navigate = useNavigate();
  const showPausedInterviews = false; // Flag to show or hide paused interviews this is just for developer friendlness, don't remove these

  // Request microphone access when component mounts
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          // we can may use 'stream' anta if needed
          console.log('Microphone access granted');
        })
        .catch((error) => {
          console.error('Microphone access denied:', error);
        });
    } else {
      console.error('Media Devices API not supported');
    }
  }, []);

  const fetchInterviews = async () => {
    setIsLoading(true)
    try {
      const [interviewsResponse, submittedResponse] = await Promise.all([
        getAllInterviews(),
        getSubmittedInterviews()
      ]);

      const submittedIds = submittedResponse.interviews.map((interview: APIInterview) => interview.id);
      setSubmittedInterviewIds(submittedIds);      setInterviews(interviewsResponse.interviews.map((interview: any) => {
        // Check if there are any interview instances and get the first one if it exists
        const interviewInstance = interview.InterviewInstances && interview.InterviewInstances.length > 0 
          ? interview.InterviewInstances[0] 
          : null;

        return {
          id: interview.id,
          title: interview.name,
          subject: interview.subject,
          topic: interview.topic,
          status: interview.status,
          isSubmitted: submittedIds.includes(interview.id),
          no_of_questions: interview.no_of_questions + interview.no_of_coding_questions + interview.predefined_questions.length, // mapping question count
          InterviewInstance: interviewInstance
        };
      }))
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
    setSelectedInterviewId(interviewId)
    setDialogOpen(true)
  };

  const handleAccept = () => {
    if (selectedInterviewId) {
      setDialogOpen(false)
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        navigate(`/student/interview/${selectedInterviewId}`);
      }, 2000);
    }
  };

  const handleCancel = () => {
    setDialogOpen(false)
    setSelectedInterviewId(null)
  };
  // Filter and sort interviews
  const filteredInterviews = interviews.filter(interview => showPausedInterviews || interview.status !== 'paused');
  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    // First prioritize active interviews with "not submitted" status (ones that can be started)
    const aCanStart = a.status === 'active' && a.InterviewInstance && a.InterviewInstance.status === "not submitted";
    const bCanStart = b.status === 'active' && b.InterviewInstance && b.InterviewInstance.status === "not submitted";
    
    if (aCanStart && !bCanStart) return -1;
    if (!aCanStart && bCanStart) return 1;
    
    // Then sort by submission status
    if (a.isSubmitted && !b.isSubmitted) return 1;
    if (!a.isSubmitted && b.isSubmitted) return -1;
    
    // Then sort by ID in descending order
    const idCompare = b.id.localeCompare(a.id);
    if (idCompare !== 0) return idCompare;
    
    // Finally sort by active status
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
                    <div className="flex items-center space-x-6">
                    <span className="text-sm text-gray-500">Questions: {interview.no_of_questions }</span>                      <Button                        variant={interview.status === 'active' && (!interview.InterviewInstance || interview.InterviewInstance.status === "not submitted") ? 'default' : 'secondary'}
                        size="sm"
                        className="shadow-md hover:shadow-lg transition-shadow duration-300"
                        disabled={interview.status !== 'active' || interview.isSubmitted || (interview.InterviewInstance && interview.InterviewInstance.status !== "not submitted")}
                        onClick={() => startInterview(interview.id)}
                      >                        {interview.isSubmitted ? 'Submitted' :
                         interview.status === 'active' && (!interview.InterviewInstance || interview.InterviewInstance.status === "not submitted") ? 'Start Interview' : 
                         interview.status === 'active' && interview.InterviewInstance ? 'Submitted' :
                         interview.status === 'scheduled' ? 'Scheduled' : 'Paused'}
                      </Button>
                      
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-row justify-between items-center">
                    <div className='flex flex-col gap-4 '>
                    <p className="text-gray-800"><b>Subject</b>: {interview.subject}</p>
                    {/* Replace the plain topic text with tag boxes */}
                    <div>
                    <p className="text-gray-800"><b>Topic(s)</b>:</p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {interview.topic.replace(/^"|"$/g, "").split(',').map((tag, idx) => (
                          <Babji key={idx} 
                            variant="secondary" 
                          className="bg-gray-100 m-1 font-medium text-gray-600 hover:bg-gray-200"
                          >
                            {tag.trim().replace(/^"|"$/g, '')}
                          </Babji>
                        ))}
                      </div>
                    </div>
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
      <AnimatePresence>
      {dialogOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 mx-4">
            <h2 className="text-2xl font-bold mb-4">Skill Sage Mock Interview Guidelines</h2>
            <div className="space-y-3 text-sm text-gray-700 max-h-80 overflow-y-auto">
              <p>To maintain the integrity of the mock interview, we have implemented strict proctoring measures. Please follow these guidelines carefully:</p>
              <h3 className="font-semibold">1. Fullscreen Mode Enforcement</h3>
              <ul className="list-disc ml-5">
                <li>The system will automatically enter fullscreen mode when the interview starts.</li>
                <li>You must remain in fullscreen throughout the session.</li>
                <li>Exiting fullscreen at any time will be considered a violation.</li>
              </ul>
              <h3 className="font-semibold">2. Restricted Keyboard Actions</h3>
              <ul className="list-disc ml-5">
                <li>Certain keys, including Escape (Esc), Meta (Command/Windows), and Tab, are disabled.</li>
                <li>Attempting to use these keys will trigger a violation.</li>
              </ul>
              <h3 className="font-semibold">3. Copy & Paste Prevention</h3>
              <ul className="list-disc ml-5">
                <li>Copying and pasting content is strictly disabled during the interview.</li>
                <li>Any attempt to perform these actions will be blocked and recorded as a violation.</li>
              </ul>
              <h3 className="font-semibold">4. Tab Change Restrictions</h3>
              <ul className="list-disc ml-5">
                {/* <li>Clicking on navigation elements is not allowed.</li> */}
                <li>Switching browser tabs or minimizing the window will result in a violation.</li>
              </ul>
              <h3 className="font-semibold">5. Monitoring Refresh & Key Down Actions</h3>
              <ul className="list-disc ml-5">
                <li>Refreshing the page using Ctrl+R, Cmd+R, F5, or F11 is prohibited.</li>
                <li>Pressing these keys will be intercepted and counted as a violation.</li>
              </ul>
              <h3 className="font-semibold">6. Disabling Text Selection</h3>
              <ul className="list-disc ml-5">
                <li>Text selection is globally disabled to prevent copying content.</li>
                <li>Any attempt to highlight or select text will be blocked.</li>
              </ul>
              <h3 className="font-semibold text-red-600">7. Violation Counter & Warnings</h3>
              <ul className="list-disc ml-5">
                <li>Every detected violation will increase your violation count.</li>
                <li>If the violation count exceeds the allowed limit, your session may be terminated.</li>
                <li className='font-bold text-red-500'>Your violations play a key role in determining your performance and score, so please be careful</li>
              </ul>
              <p>By proceeding, you agree to abide by these rules. Failure to comply may lead to immediate disqualification from the mock interview.</p>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleAccept}>Yes I Accept</Button>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  )
}