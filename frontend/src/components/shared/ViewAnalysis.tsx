import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
} from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";
import { useLocation } from "react-router-dom";
import { getInterviewResult } from "@/Communicators/studentCommunications";
import { useParams } from "react-router-dom";
import { Student } from "../adminComponents/interview-student-list";
import { useAuth } from "@/Context/AuthContext"; // New import
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface InterviewData {
  marks: number;
  feedback: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
  };
}

interface InterviewExchange {
  id: number;
  question: string;
  response: string;
  feedback: string;
  marks: number; // Added marks property
  code?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // You can add a toast notification here if desired
    console.log("Code copied to clipboard");
  });
};

const formatContent = (content: string) => {
  const codeBlockRegex = /```(\w+)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  const elements: (string | JSX.Element)[] = [];
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [fullMatch, language, code] = match;
    const start = match.index;
    if (start > lastIndex) {
      elements.push(content.slice(lastIndex, start));
    }
    elements.push(
      <SyntaxHighlighter language={language} style={materialDark} key={start}>
        {code}
      </SyntaxHighlighter>
    );
    lastIndex = start + fullMatch.length;
  }
  if (lastIndex < content.length) {
    elements.push(content.slice(lastIndex));
  }
  return elements;
};

export function ViewAnalysis() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();

  // Updated state extraction to support both student and admin flows
  const state =
    (useLocation().state as {
      student?: Student;
      interviewId?: string;
      rollNo?: string;
    }) || {};
  const interviewIdValue = state.interviewId || id;
  const studentRollNo = state.student
    ? state.student.rollNo
    : state.rollNo || "";

  const [expandedQuestion, setExpandedQuestion] = React.useState<number | null>(
    null
  );
  const [interviewData, setInterviewData] =
    React.useState<InterviewData | null>(null);
  const [exchanges, setExchanges] = React.useState<InterviewExchange[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        let result;
        // If student exists, proceed with existing student flow; otherwise use the roll number passed in state for admin.
        result = await getInterviewResult(
          interviewIdValue!,
          studentRollNo,
          user.role
        );
        setInterviewData(result.interviewData);
        setExchanges(result.InterviewExchange);
      } catch (error) {
        console.error("Error fetching interview data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (interviewIdValue) {
      fetchData();
    }
  }, [interviewIdValue, studentRollNo]);

  const detectLanguage = (code: string) => {
    if (code.includes("public class") || code.includes("System.out.println")) {
      return "java";
    } else if (code.includes("def ") || code.includes("print(")) {
      return "python";
    } else {
      return "javascript";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded p-8 shadow-lg flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <span className="text-lg font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!interviewData) {
    return <div>No data found</div>;
  }

  return (
    <div className="container mx-auto px-4 pt-20 bg-white min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gray-100">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Interview Results
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div className="mt-4 md:mt-0">
                <span
                  className={`
                  text-2xl font-bold
                  ${
                    interviewData.marks * 10 < 50
                      ? "text-red-500"
                      : interviewData.marks * 10 < 60
                      ? "text-orange-500"
                      : "text-green-500"
                  }
                `}
                >
                  Score: {interviewData.marks * 10}%
                </span>
                <Progress
                  value={interviewData.marks * 10}
                  className="w-64 h-2 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Overall Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">
                {interviewData.feedback.summary}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-lg mt-8">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-2xl font-bold text-blue-800">
                Strengths and Weaknesses
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/2">Strengths</TableHead>
                    <TableHead className="w-1/2">Weaknesses</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({
                    length: Math.max(
                      interviewData.feedback.strengths.length,
                      interviewData.feedback.weaknesses.length
                    ),
                  }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className=" text-base text-green-700">
                        {interviewData.feedback.strengths[index] || ""}
                      </TableCell>
                      <TableCell className="text-base text-red-700">
                        {interviewData.feedback.weaknesses[index] || ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="space-y-6 mb-8" variants={containerVariants}>
          <h2 className="text-2xl font-bold text-blue-800 mb-4 mt-8">
            Detailed Question Analysis
          </h2>
          {exchanges.map((item, index) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card className="overflow-hidden shadow-lg">
                <CardHeader
                  className="cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                  onClick={() =>
                    setExpandedQuestion(
                      expandedQuestion === index ? null : index
                    )
                  }
                >
                  <CardTitle className="text-xl font-semibold flex justify-between items-center">
                    <span>Question {index + 1}</span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="text-sm font-medium shadow-md text-gray-700 bg-gray-200 rounded-md px-2 py-1"
                      >
                        Marks: {item.marks}
                      </Badge>
                      {expandedQuestion === index ? (
                        <ChevronUpIcon className="w-6 h-6" />
                      ) : (
                        <ChevronDownIcon className="w-6 h-6" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <AnimatePresence>
                  {expandedQuestion === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <CardContent className="pt-4">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold mb-2 text-blue-700">
                              Question:
                            </h3>
                            <p className="text-gray-700">{item.question}</p>
                            {item.code && (
                              <div className="relative mt-2">
                                <div className="absolute top-0 right-0 flex items-center space-x-2 m-2">
                                  <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-md px-2 py-1">
                                    {detectLanguage(item.code)}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(item.code)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                  >
                                    <CopyIcon className="w-5 h-5" />
                                  </button>
                                </div>
                                <SyntaxHighlighter
                                  language={detectLanguage(item.code)}
                                  style={materialDark}
                                  className="mt-2 rounded-lg"
                                >
                                  {item.code.trim()}
                                </SyntaxHighlighter>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 text-green-700">
                              Your Answer:
                            </h3>
                            <div className="text-gray-700">
                              {formatContent(item.response)}
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 text-purple-700">
                              Feedback:
                            </h3>
                            <div className="text-gray-700">
                              {formatContent(item.feedback)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
          <div className="pb-8"></div>
        </motion.div>
      </motion.div>
    </div>
  );
}
