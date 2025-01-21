import { getSubmittedInterviews } from '@/Communicators/studentCommunications'
import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"

interface CompletedInterview {
  id: string;
  name: string;
  subject: string;
  topic: string;
  InterviewInstance: {
    marks: number;
    status: string;
  }[];
}

export function CompletedInterviews() {
  const navigate = useNavigate()
  const [interviews, setInterviews] = useState<CompletedInterview[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchCompletedInterviews = async () => {
      setIsLoading(true)
      try {
        const response = await getSubmittedInterviews()
        setInterviews(response.interviews)
      } catch (error) {
        console.error('Failed to fetch completed interviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompletedInterviews()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const handleViewAnalysis = (interviewId: string) => {
    navigate(`/student/interview-result/${interviewId}`)
  }

  const getScoreColor = (marks: number) => {
    if (marks >= 70) return 'bg-green-100 text-green-800';
    if (marks >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 font-sans mt-16 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 font-sans mt-16">
      <h1 className="text-3xl font-bold mb-6 text-center">Completed Interviews</h1>
      {interviews.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No completed interviews found
        </div>
      ) : (
        <motion.div
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {interviews.map((interview) => {
            const score = interview.InterviewInstance?.[0]?.marks ?? 0;
            
            return (
              <motion.div key={interview.id} variants={itemVariants}>
                <Card className="overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold">{interview.name}</h2>
                        <div className="flex gap-4 flex-row">
                          <p className="text-sm text-muted-foreground"><b>Subject</b>: {interview.subject}</p>
                          <p className="text-sm text-muted-foreground"><b>Topic</b>: {interview.topic}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs sm:text-sm font-medium ${getScoreColor(score)}`}>
                          Score: {score}%
                        </span>
                        <Button
                          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg group"
                          onClick={() => handleViewAnalysis(interview.id)}
                        >
                          <span className="mr-2">View Analysis</span>
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}