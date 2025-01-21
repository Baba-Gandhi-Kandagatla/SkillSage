import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDownIcon, ChevronUpIcon, CopyIcon } from "@radix-ui/react-icons"
import { AnimatePresence, motion } from "framer-motion"
import Prism from 'prismjs'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-python'
import 'prismjs/themes/prism-tomorrow.css'
import React from "react"

const sampleData = {
  title: "Java Programming Interview",
  topic: "Java",
  score: 85,
  questions: [
    {
      id: 1,
      question: "What is polymorphism in object-oriented programming?",
      answer: "Polymorphism is the ability of an object to take on many forms. In Java, it allows a single interface to represent different underlying forms (data types or classes). There are two types of polymorphism: compile-time (method overloading) and runtime (method overriding).",
      feedback: "Excellent explanation! You've covered both the definition and types of polymorphism. To further improve, you could provide a simple code example demonstrating each type.",
    },
    {
      id: 2,
      question: "What are the key differences between abstract classes and interfaces in Java?",
      answer: "Abstract classes can have both abstract and non-abstract methods, while interfaces (prior to Java 8) can only have abstract methods. Abstract classes can have instance variables, while interfaces can only have static final variables. Since Java 8, interfaces can have default and static methods.",
      feedback: "Great answer! You've highlighted the main differences and even mentioned the changes introduced in Java 8. To make it perfect, you could briefly explain when to use each one.",
    },
    {
      id: 3,
      question: "What is wrong with this code?",
      code: `
int x = "hello";
System.out.println(x + 5);
      `,
      answer: "The code is trying to assign a string value to an integer variable, which is not allowed in Java. This will result in a type mismatch error. Additionally, attempting to add an integer to a string variable would cause a compilation error.",
      feedback: "Correct identification of the errors. To improve, you could suggest a fix, such as changing the variable type to String or assigning an integer value instead.",
    },
    {
      id: 4,
      question: "Explain the concept of multithreading in Java and provide an example.",
      answer: "Multithreading in Java allows concurrent execution of two or more parts of a program for maximum utilization of CPU. Each part of such a program is called a thread. Threads are lightweight sub-processes, they share the same address space.",
      code: `
public class MultithreadingDemo extends Thread {
    public void run() {
        try {
            System.out.println("Thread " + Thread.currentThread().getId() + " is running");
        } catch (Exception e) {
            System.out.println("Exception is caught");
        }
    }
}

public class Main {
    public static void main(String[] args) {
        int n = 8; // Number of threads
        for (int i = 0; i < n; i++) {
            MultithreadingDemo object = new MultithreadingDemo();
            object.start();
        }
    }
}
      `,
      feedback: "Good explanation of multithreading. Your code example effectively demonstrates creating and starting multiple threads. To enhance your answer, you could mention the benefits and potential challenges of multithreading, such as improved performance and the need for synchronization.",
    },
    {
      id: 5,
      question: "Implement a binary search algorithm in Java.",
      answer: "Here's an implementation of the binary search algorithm in Java:",
      code: `
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            }
            
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1; // Element not found
    }

    public static void main(String[] args) {
        int[] arr = {2, 3, 4, 10, 40};
        int target = 10;
        int result = binarySearch(arr, target);
        if (result == -1)
            System.out.println("Element not present");
        else
            System.out.println("Element found at index " + result);
    }
}
      `,
      feedback: "Excellent implementation of the binary search algorithm! Your code is correct and efficient. To make it even better, you could add comments explaining the key steps of the algorithm and mention that the input array must be sorted for binary search to work correctly.",
    },
  ],
  overallFeedback: "You demonstrated a strong understanding of Java concepts and object-oriented programming principles. Your answers were generally accurate, well-articulated, and showed depth of knowledge. There's room for improvement in providing more comprehensive explanations, considering edge cases, and demonstrating practical applications of concepts through code examples. Keep up the good work and continue to practice implementing complex algorithms and multithreading concepts.",
  strengths: [
    "Strong grasp of core OOP concepts",
    "Clear and concise explanations",
    "Ability to identify code errors quickly",
    "Good understanding of multithreading",
    "Effective implementation of algorithms",
  ],
  weaknesses: [
    "Could provide more detailed explanations in some answers",
    "Opportunity to mention more recent Java features",
    "Room for improvement in suggesting fixes for code errors",
    "Could elaborate more on practical applications of concepts",
  ],
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    // You can add a toast notification here if desired
    console.log('Code copied to clipboard')
  })
}

const separateCodeFromText = (text: string) => {
  const codeRegex = /```[\s\S]*?```/g;
  const codes = text.match(codeRegex) || [];
  const textParts = text.split(codeRegex);
  return { textParts, codes: codes.map(code => code.replace(/```/g, '').trim()) };
}

export function ViewAnalysis() {
  const [expandedQuestion, setExpandedQuestion] = React.useState<number | null>(null)

  React.useEffect(() => {
    Prism.highlightAll()
  }, [expandedQuestion, sampleData.questions])

  const detectLanguage = (code: string) => {
    if (code.includes('public class') || code.includes('System.out.println')) {
      return 'java'
    } else if (code.includes('def ') || code.includes('print(')) {
      return 'python'
    } else {
      return 'javascript'
    }
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
            <CardTitle className="text-3xl font-bold text-gray-800">{sampleData.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <span className="text-lg font-medium text-gray-600">Topic: {sampleData.topic}</span>
              <div className="mt-4 md:mt-0">
                <span
                  className={`
                    text-2xl font-bold
                    ${
                      sampleData.score < 50
                        ? 'text-red-500'
                        : sampleData.score < 60
                        ? 'text-orange-500'
                        : 'text-green-500'
                    }
                  `}
                >
                  Score: {sampleData.score}%
                </span>
                <Progress value={sampleData.score} className="w-64 h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <motion.div variants={itemVariants}>
          <Card className="shadow-lg">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-2xl font-bold text-gray-800">Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-gray-700 leading-relaxed">{sampleData.overallFeedback}</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg mt-8">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-2xl font-bold text-blue-800">Strengths and Weaknesses</CardTitle>
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
                  {Array.from({ length: Math.max(sampleData.strengths.length, sampleData.weaknesses.length) }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-green-700">{sampleData.strengths[index] || ''}</TableCell>
                      <TableCell className="text-red-700">{sampleData.weaknesses[index] || ''}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div className="space-y-6 mb-8" variants={containerVariants}>
          <h2 className="text-2xl font-bold text-blue-800 mb-4">Detailed Question Analysis</h2>
          {sampleData.questions.map((item, index) => (
            <motion.div key={item.id} variants={itemVariants}>
              <Card className="overflow-hidden shadow-lg">
                <CardHeader
                  className="cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                  onClick={() => setExpandedQuestion(expandedQuestion === index ? null : index)}
                >
                  <CardTitle className="text-xl font-semibold flex justify-between items-center">
                    <span>Question {index + 1}</span>
                    {expandedQuestion === index ? (
                      <ChevronUpIcon className="w-6 h-6" />
                    ) : (
                      <ChevronDownIcon className="w-6 h-6" />
                    )}
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
                            <h3 className="font-semibold mb-2 text-blue-700">Question:</h3>
                            <p className="text-gray-700">{item.question}</p>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 text-green-700">Your Answer:</h3>
                            <p className="text-gray-700">{item.answer}</p>
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
                                <pre className="mt-2 p-4 pt-10 rounded-lg overflow-x-auto">
                                  <code className={`language-${detectLanguage(item.code)}`}>
                                    {item.code.trim()}
                                  </code>
                                </pre>
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2 text-purple-700">Feedback:</h3>
                            {(() => {
                              const { textParts, codes } = separateCodeFromText(item.feedback);
                              return (
                                <>
                                  {textParts.map((part, index) => (
                                    <React.Fragment key={index}>
                                      <p className="text-gray-700 mb-2">{part}</p>
                                      {codes[index] && (
                                        <div className="relative mt-2 mb-4">
                                          <div className="absolute top-0 right-0 flex items-center space-x-2 m-2">
                                            <span className="text-sm font-medium text-gray-500 bg-gray-100 rounded-md px-2 py-1">
                                              {detectLanguage(codes[index])}
                                            </span>
                                            <button
                                              onClick={() => copyToClipboard(codes[index])}
                                              className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            >
                                              <CopyIcon className="w-5 h-5" />
                                            </button>
                                          </div>
                                          <pre className="mt-2 p-4 pt-10 rounded-lg overflow-x-auto">
                                            <code className={`language-${detectLanguage(codes[index])}`}>
                                              {codes[index].trim()}
                                            </code>
                                          </pre>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  ))}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}