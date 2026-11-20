import { getSubmittedInterviews } from '@/Communicators/studentCommunications'
import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"  // Add this import
import { Info } from 'lucide-react'
interface CompletedInterview {
  id: string;
  name: string;
  subject: string;
  topic: string;
  InterviewInstances: Array<{
    id: string;
    marks: number;
    status: string;
    feedback: {
      summary: string;
      strengths: string[];
      weaknesses: string[];
    };
  }>;
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
        console.log('Completed interviews:', response.interviews)
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
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  }

  const handleViewAnalysis = (interviewId: string) => {
    navigate(`/student/interview-result/${interviewId}`)
  }

  const getScoreColor = (marks: number) => {
    if (marks * 10 >= 70) return 'bg-green-100 text-green-800'
    if (marks * 10 >= 50) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const formatTopics = (topicString: string) => {
    try {
      // Remove quotes and parse the string as JSON array
      const topics = JSON.parse(topicString.replace(/^"|"$/g, ''));
      return Array.isArray(topics) ? topics : topicString.split(',').map(t => t.trim());
    } catch {
      // Fallback to simple string split if JSON parse fails
      return topicString.split(',').map(t => t.trim());
    }
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
      
      <div className="flex items-center gap-1.5 mb-4">
        <Info className="h-4 w-4 text-blue-800" />
        <p className="text-sm text-blue-800 italic">Please note that Interview evaluations may take a few minutes. We appreciate your patience!</p>
      </div>
      
      {interviews.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No completed interviews found
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {interviews.map((interview) => {
            // Correctly access marks from InterviewInstances array
            const marks = interview.InterviewInstances[0]?.marks ?? 0;
            const topics = formatTopics(interview.topic);
            
            return (
              <motion.div key={interview.id} variants={itemVariants}>
                <Card 
                  className="cursor-pointer overflow-hidden transition-shadow duration-300 ease-in-out hover:shadow-lg"
                  onClick={() => handleViewAnalysis(interview.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start">
                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold">{interview.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          <b>Subject</b>: {interview.subject}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {topics.map((topic: string, index: number) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="bg-gray-100 text-gray-600 hover:bg-gray-200"
                            >
                              {topic.trim().replace(/^"|"$/g, '')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2 sm:mt-0">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-sm font-medium ${getScoreColor(marks)}`}>
                          Score: {marks * 10}%
                        </span>
                        <Button 
                          className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg"
                          onClick={(e) => { e.stopPropagation(); handleViewAnalysis(interview.id) }}
                        >
                          View Analysis <ArrowRight className="ml-2 h-4 w-4" />
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