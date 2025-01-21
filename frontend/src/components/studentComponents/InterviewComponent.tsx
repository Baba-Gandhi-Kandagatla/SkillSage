import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, ChevronDown, ChevronUp, Code, Mic, Plus, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CodeEditor } from "./CodeEditor";
import { SymbolBox } from "./SymbolBox";
import { useAuth } from "../../Context/AuthContext";
import Cookies from "js-cookie"; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Message = {
  id: number;
  type: "question" | "answer";
  content: string;
  showFeedback?: boolean;
  isTyping?: boolean;
  feedbackContent?: string;
  isFeedbackTyping?: boolean;
};

const REPHRASE_COUNT_KEY = (rollnumber: string, interviewId: string) =>
  `rephraseCount_${rollnumber}_${interviewId}`;

// Add this helper function after your type definitions and before the component
const getQuestionNumber = (messages: Message[], currentIndex: number) => {
  return messages.slice(0, currentIndex + 1).filter(msg => msg.type === "question").length;
};

function formatMessageContent(content: string) {
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
}

export function InterviewComponent() {
  const navigate = useNavigate();
  const { interviewId } = useParams<{ interviewId: string }>(); // Get interviewId from URL parameters
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] =
    useState(false);
  const [codeQuestions, setCodeQuestions] = useState<
    { question: string; code: string }[]
  >([]);
  const [chatPanelWidth, setChatPanelWidth] = useState(100);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationDialog, setShowViolationDialog] = useState(false);
  const [showSymbolDialog, setShowSymbolDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeContent, setCodeContent] = useState("");
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [hasCode, setHasCode] = useState(false);
  const [codePosition, setCodePosition] = useState({ start: 0, end: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showSkipDialog, setShowSkipDialog] = useState(false);
  const [globalRephraseCount, setGlobalRephraseCount] = useState(() => {
    const savedCount = Cookies.get(
      REPHRASE_COUNT_KEY(user?.rollnumber || "", interviewId || "")
    );
    return savedCount !== undefined ? parseInt(savedCount, 10) : 3;
  }); // Global rephrase counter
  const [isLoading, setIsLoading] = useState(false); // Add this to your existing state declarations

  const handleViolation = () => {
    setViolationCount((prev) => prev + 1);
    setShowViolationDialog(true);
    // Automatically enter fullscreen when a violation occurs
    enterFullscreen();
  };

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("Error attempting to enable fullscreen:", err);
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleViolation();
        enterFullscreen();
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation();
      }
    };

    const handleNavbarClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("nav")) {
        e.preventDefault();
        handleViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("click", handleNavbarClick, true);
    enterFullscreen();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("click", handleNavbarClick, true);
    };
  }, []);

  useEffect(() => {
    if (interviewId) {
      const fetchFirstQuestion = async () => {
        setIsLoading(true)
        try {
          const response = await axios.get(
            `/interview/start_interview/${interviewId}`
          );
          if (response.data.interviewExchange) {
            const firstQuestion = response.data.interviewExchange.question;
            setMessages([
              {
                id: Date.now(),
                type: "question",
                content: firstQuestion,
                showFeedback: false,
                isTyping: false,
              },
            ]);
          } else if (response.data.interviewExchanges) {
            const exchanges = response.data.interviewExchanges.flatMap(
              (exchange: any) =>
                [
                  {
                    id: exchange.id,
                    type: "question",
                    content: exchange.question,
                    showFeedback: false,
                    isTyping: false,
                    feedbackContent: exchange.feedback,
                  },
                  exchange.response && {
                    id: exchange.id + "-response",
                    type: "answer",
                    content: exchange.response,
                  },
                ].filter(Boolean)
            );
            setMessages(exchanges);
          }
          setHasCode(false); // Reset hasCode
          setCodeContent(""); // Reset codeContent
          setCodePosition({ start: 0, end: 0 }); // Reset codePosition
        } catch (error) {
          console.error("Error fetching first question:", error);
        }
        finally{
          setIsLoading(false)
        }
      };

      fetchFirstQuestion();
    }
  }, [interviewId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const typingTimeout = setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) =>
          message.isTyping ? { ...message, isTyping: false } : message
        )
      );
    }, 1500);

    return () => clearTimeout(typingTimeout);
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizeRef.current && resizeRef.current.dataset.resizing === "true") {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        setChatPanelWidth(Math.min(Math.max(newWidth, 30), 70));
      }
    };

    const handleMouseUp = () => {
      if (resizeRef.current) {
        resizeRef.current.dataset.resizing = "false";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (codeQuestions.length > 0) {
      setChatPanelWidth(60);
    } else {
      setChatPanelWidth(100);
    }
  }, [codeQuestions]);

  useEffect(() => {
    if (user?.rollnumber && interviewId) {
      Cookies.set(
        REPHRASE_COUNT_KEY(user.rollnumber, interviewId),
        globalRephraseCount.toString(),
        { expires: 1 / 6 }
      ); // 4 hours expiration
    }
  }, [globalRephraseCount, user?.rollnumber, interviewId]);

  const handleAnswer = async () => {
    if (inputValue.trim() && !isInterviewComplete && interviewId) {
      setIsLoading(true); // Start loading
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "answer", content: inputValue },
      ]);
      try {
        const response = await axios.post(
          `/interview/next/${interviewId}`,
          {
            response: inputValue,
          }
        );
        const nextQuestion =
          response.data.interviewExchanges.slice(-1)[0].question;
        const feedback = response.data.interviewExchanges.slice(-2)[0].feedback;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "question",
            content: nextQuestion,
            showFeedback: false,
            isTyping: true,
            feedbackContent: feedback,
          },
        ]);
        setInputValue("");
        // Reset all states when moving to next question
        setHasCode(false);
        setCodeContent("");
        setCodePosition({ start: 0, end: 0 });
        setIsEditingCode(false);
        if (response.data.status === "complete") {
          setIsInterviewComplete(true);
        }
      } catch (error) {
        console.error("Error fetching next question:", error);
      } finally {
        setIsLoading(false); // Stop loading regardless of success/failure
      }
    }
  };

  const handleSkip = async () => {
    if (!isInterviewComplete && interviewId) {
      setShowSkipDialog(false);
      setIsLoading(true); // Start loading
      const skipResponse =
        "Please move to next question, student does not know the answer";
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "answer", content: skipResponse },
      ]);

      try {
        const response = await axios.post(
          `/interview/next/${interviewId}`,
          {
            response: skipResponse,
          }
        );
        const nextQuestion =
          response.data.interviewExchanges.slice(-1)[0].question;
        const feedback = response.data.interviewExchanges.slice(-2)[0].feedback;

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "question",
            content: nextQuestion,
            showFeedback: false,
            isTyping: true,
            feedbackContent: feedback,
          },
        ]);
        setInputValue("");
        setHasCode(false);
        setCodeContent("");
        setCodePosition({ start: 0, end: 0 });
        setIsEditingCode(false);

        if (response.data.status === "complete") {
          setIsInterviewComplete(true);
        }
      } catch (error) {
        console.error("Error skipping question:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    }
  };

  const toggleFeedback = (id: number) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id
          ? {
              ...message,
              showFeedback: !message.showFeedback,
              isFeedbackTyping: !message.showFeedback,
            }
          : message
      )
    );

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === id ? { ...message, isFeedbackTyping: false } : message
        )
      );
    }, 1500);
  };

  const handleMicClick = () => {
    setIsSpeechRecognitionActive(true);
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => prev + transcript);
      };
      recognition.onend = () => {
        setIsSpeechRecognitionActive(false);
      };
      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
      setIsSpeechRecognitionActive(false);
    }
  };

  const handleSubmit = async () => {
    if (isInterviewComplete && interviewId) {
      try {
        const response = await axios.get(
          `/interview/submit/${interviewId}`
        );
        if (response.data.status === "submitted") {
          navigate("/student/completed-interviews");
        }
      } catch (error) {
        console.error("Error submitting interview:", error);
      }
    }
  };

  const handleRephrase = async () => {
    if (globalRephraseCount > 0 && interviewId) {
      try {
        const response = await axios.get(
          `/interview/reframe/${interviewId}`
        );

        setMessages(
          response.data.interviewExchanges.flatMap((exchange: any) =>
            [
              {
                id: exchange.id,
                type: "question",
                content: exchange.question,
                showFeedback: false,
                isTyping: false,
                feedbackContent: exchange.feedback,
              },
              exchange.response && {
                id: exchange.id + "-response",
                type: "answer",
                content: exchange.response,
              },
            ].filter(Boolean)
          )
        );

        setGlobalRephraseCount(globalRephraseCount - 1);
        setHasCode(false);
        setCodeContent("");
        setCodePosition({ start: 0, end: 0 });
      } catch (error) {
        console.error("Error rephrasing question:", error);
      }
    }
  };

  const handleSymbolClick = (display: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const newValue =
        inputValue.substring(0, start) + display + inputValue.substring(end);
      setInputValue(newValue);
      setShowSymbolDialog(false);

      // Set cursor position after the inserted symbol
      setTimeout(() => {
        textareaRef.current?.setSelectionRange(
          start + display.length,
          start + display.length
        );
        textareaRef.current?.focus();
      }, 0);
    }
  };

  const handleAddCode = () => {
    setIsEditingCode(false);
    setCodeContent("");
    setCodeLanguage("javascript");
    setShowCodeDialog(true);
  };

  const handleEditCode = () => {
    // Extract existing code from the textarea
    const codeMatch = inputValue
      .substring(codePosition.start, codePosition.end)
      .match(/```(\w+)\n([\s\S]*?)\n```/);
    if (codeMatch) {
      setCodeLanguage(codeMatch[1]);
      setCodeContent(codeMatch[2]);
      setIsEditingCode(true);
      setShowCodeDialog(true);
    }
  };

  const handleCodeSubmit = () => {
    if (textareaRef.current) {
      const codeBlock = `\`\`\`${codeLanguage}\n${codeContent}\n\`\`\``;
      let newValue;
      if (isEditingCode) {
        newValue =
          inputValue.substring(0, codePosition.start) +
          codeBlock +
          inputValue.substring(codePosition.end);
      } else {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        newValue =
          inputValue.substring(0, start) +
          codeBlock +
          inputValue.substring(end);
        setCodePosition({ start, end: start + codeBlock.length });
      }
      setInputValue(newValue);
      setHasCode(true);
      setShowCodeDialog(false);
    }
  };

  return (
    <>
      <style>{`
        .dialog-content [data-radix-collection-item] {
          color: transparent !important;
        }
      `}</style>
      <Dialog open={showViolationDialog} onOpenChange={() => {}}>
        <DialogContent
          className="bg-red-50 sm:max-w-[425px] dialog-content bg-cover bg-center"
          // style={{ backgroundImage: 'url("/image.png")' }} // Updated image path
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-red-600 font-bold text-xl">
              Violation!
            </DialogTitle>
          </DialogHeader>
          <div className="text-red-600 font-bold ">
            Don't be a third class idiot Violation Count: {violationCount}
          </div>
          <div className="flex justify-end">
            <Button
              variant="destructive"
              onClick={() => {
                setShowViolationDialog(false);
                enterFullscreen(); // Ensure fullscreen is re-enabled
              }}
            >
              Understood
            </Button>
          </div>
          {/* Removed the cross button to prevent closing the dialog */}
        </DialogContent>
      </Dialog>

      <SymbolBox
        showSymbolDialog={showSymbolDialog}
        setShowSymbolDialog={setShowSymbolDialog}
        handleSymbolClick={handleSymbolClick}
      />

      <CodeEditor
        showCodeDialog={showCodeDialog}
        setShowCodeDialog={setShowCodeDialog}
        codeLanguage={codeLanguage}
        setCodeLanguage={setCodeLanguage}
        codeContent={codeContent}
        setCodeContent={setCodeContent}
        handleCodeSubmit={handleCodeSubmit}
        isEditingCode={isEditingCode}
      />

      <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Skip Question</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to skip this question?
          </div>
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              className="bg-black text-white hover:bg-gray-800"
              onClick={handleSkip}
            >
              Skip Question
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowSkipDialog(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex h-screen bg-gray-100 pt-16">
        <div className="flex-1 flex" style={{ height: "calc(100vh - 4rem)" }}>
          <div
            className="flex flex-col p-6"
            style={{ width: `${chatPanelWidth}%` }}
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">
                Interview-{currentQuestion + 1}
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium">Topic- Java</span>
                <Button onClick={handleSubmit}>Submit</Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto mb-6 bg-white rounded-lg shadow-md p-4">
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={`mb-4 flex ${
                      message.type === "answer"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className={`flex ${message.type !== "question" ? "flex-row-reverse" : ""}`}>
                      {message.type === "question" && (
                      <div className="flex items-start mr-2 mt-2">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
                        <Bot/>
                        </div>
                      </div>
                      )}
                      {message.type === "answer" && (
                      <div className="flex items-start ml-2 mt-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-black">
                        <User/>
                        </div>
                      </div>
                      )}
                      <div
                      className={`inline-block p-2.5 pl-4 rounded-lg max-w-5xl ${
                        message.type === "question"
                        ? "bg-blue-100 text-left"
                        : "bg-green-100 text-left"
                      }`}
                      >
                      {message.isTyping ? (
                        <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="block overflow-hidden whitespace-nowrap"
                        >
                        {message.content}
                        </motion.span>
                      ) : (
                        <>
                        {message.type === "question" && (
                          <span className="font-bold mr-2">
                          Q{getQuestionNumber(messages, index)}:
                          </span>
                        )}
                        {formatMessageContent(message.content)}
                        </>
                      )}
                      {message.type === "question" && index !== 0 && (
                        <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-1 text-xs"
                          onClick={() => toggleFeedback(message.id)}
                        >
                          {message.showFeedback ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                          ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                          )}
                          Toggle Feedback
                        </Button>
                        <AnimatePresence>
                          {message.showFeedback && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-2 p-2 bg-gray-100 rounded-lg text-sm"
                          >
                            {message.isFeedbackTyping ? (
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{
                              duration: 1.5,
                              ease: "easeInOut",
                              }}
                              className="block overflow-hidden whitespace-nowrap"
                            >
                              {message.feedbackContent}
                            </motion.span>
                            ) : (
                            message.feedbackContent
                            )}
                          </motion.div>
                          )}
                        </AnimatePresence>
                        </div>
                      )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center py-4"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-center space-x-2 relative">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="rounded-full shadow-md p-2 bg-white"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={handleMicClick}
                  disabled={isSpeechRecognitionActive || isInterviewComplete}
                >
                  <Mic
                    className={`h-4 w-4 ${
                      isSpeechRecognitionActive ? "text-red-500" : ""
                    }`}
                  />
                </Button>
              </motion.div>
              <div className="flex-1 relative group">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    isInterviewComplete
                      ? "Interview complete"
                      : "Type your answer here..."
                  }
                  className="w-full"
                  onKeyPress={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !isInterviewComplete
                    ) {
                      e.preventDefault();
                      handleAnswer();
                    }
                  }}
                  disabled={isInterviewComplete}
                />
                {isInterviewComplete && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex  items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-gray-800 font-medium text-center">
                      Your interview is done, please submit to see the results
                    </p>
                  </div>
                )}
              </div>
              <Button onClick={handleAnswer} disabled={isInterviewComplete}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-around mt-4">
              <div className="relative">
                <Button
                  variant="outline"
                  className="bg-slate-800 text-white shadow-lg"
                  onClick={handleRephrase}
                  disabled={isInterviewComplete || globalRephraseCount <= 0}
                >
                  Rephrase the Question {globalRephraseCount}
                </Button>
                {globalRephraseCount <= 0 && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center rounded-md">
                    <p className="text-gray-800 font-medium text-center text-sm px-2">
                      You have used all your rephrases
                    </p>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                className="bg-slate-800 text-white shadow-lg"
                onClick={() => setShowSymbolDialog(true)}
                disabled={isInterviewComplete}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Symbol
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 text-white shadow-lg"
                onClick={hasCode ? handleEditCode : handleAddCode}
                disabled={isInterviewComplete}
              >
                <Code className="h-4 w-4 mr-2" />
                {hasCode ? "Edit Code" : "Add Code"}
              </Button>
              <Button
                variant="outline"
                className="bg-slate-800 text-white shadow-lg"
                onClick={() => setShowSkipDialog(true)}
                disabled={isInterviewComplete}
              >
                Skip the Question
              </Button>
            </div>
          </div>
          {codeQuestions.length > 0 && (
            <>
              <div
                ref={resizeRef}
                className="w-2 bg-gray-300 cursor-col-resize hover:bg-gray-400 transition-colors"
                onMouseDown={() => {
                  if (resizeRef.current) {
                    resizeRef.current.dataset.resizing = "true";
                  }
                }}
              />
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-200 p-6 overflow-y-auto"
                style={{ width: `${100 - chatPanelWidth}%` }}
              >
                <h2 className="text-xl font-bold mb-4">Code Questions</h2>
                <AnimatePresence>
                  {codeQuestions.map((codeQuestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="mb-4 bg-white rounded-lg shadow-md p-4"
                    >
                      <h3 className="font-medium mb-2">
                        Question {index + 1}: {codeQuestion.question}
                      </h3>
                      <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                        <code>{codeQuestion.code}</code>
                      </pre>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
