import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { motion } from "framer-motion"

const sampleData = {
  title: "Java Programming Interview",
  topic: "Java",
  score: 85,
  questions: [
    {
      id: 1,
      question: "What is polymorphism in object-oriented programming?",
      answer: "Polymorphism is the ability of an object to take on many forms. In Java, it allows a single interface to represent different underlying forms (data types or classes).",
      feedback: "Good explanation. You could have mentioned the two types of polymorphism: compile-time (method overloading) and runtime (method overriding) for a more comprehensive answer.",
    },
    {
      id: 2,
      question: "What are the key differences between abstract classes and interfaces in Java?",
      answer: "Abstract classes can have both abstract and non-abstract methods, while interfaces (prior to Java 8) can only have abstract methods. Abstract classes can have instance variables, while interfaces can only have static final variables.",
      feedback: "Excellent answer! You've highlighted the main differences clearly. Consider mentioning that since Java 8, interfaces can have default and static methods as well.",
    },
    {
      id: 3,
      question: "What is wrong with this code?",
      code: 'int x = "hello";',
      answer: "The code is trying to assign a string value to an integer variable, which is not allowed in Java. This will result in a type mismatch error.",
      feedback: "Correct identification of the error. You could have suggested the fix: either changing the variable type to String or assigning an integer value instead.",
    },
  ],
  overallFeedback: "You demonstrated a good understanding of Java concepts and object-oriented programming principles. Your answers were generally accurate and well-articulated. There's room for improvement in providing more comprehensive explanations and considering edge cases or recent language updates in your responses.",
  strengths: [
    "Strong grasp of core OOP concepts",
    "Clear and concise explanations",
    "Ability to identify code errors quickly",
  ],
  weaknesses: [
    "Could provide more detailed explanations in some answers",
    "Opportunity to mention more recent Java features",
    "Room for improvement in suggesting fixes for code errors",
  ],
}

export function ViewAnalysis() {
  return (
    <div className="container mx-auto px-4 py-8 pt-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{sampleData.title}</h1>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium">Topic: {sampleData.topic}</span>
          <span className="text-2xl font-bold text-green-600">Score: {sampleData.score}%</span>
        </div>
      </div>

      <div className="space-y-8 mb-8">
        {sampleData.questions.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex flex-col space-y-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Question:</h3>
                <p>{item.question}</p>
                {item.code && (
                  <pre className="bg-gray-800 text-white p-4 rounded-lg mt-2 overflow-x-auto">
                    <code>{item.code}</code>
                  </pre>
                )}
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Your Answer:</h3>
                <p>{item.answer}</p>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Feedback:</h3>
                <p>{item.feedback}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Overall Feedback</h2>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>{sampleData.overallFeedback}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Strengths and Weaknesses</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 bg-gray-200 text-xl font-bold">Strengths</TableHead>
              <TableHead className="w-1/2 bg-gray-200 text-xl font-bold">Weaknesses</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: Math.max(sampleData.strengths.length, sampleData.weaknesses.length) }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>{sampleData.strengths[index] || ""}</TableCell>
                <TableCell>{sampleData.weaknesses[index] || ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}