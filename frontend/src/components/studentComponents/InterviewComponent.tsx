import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import Cookies from "js-cookie";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronUp,
  Code,
  Copy, // Added Copy icon
  Loader2,
  Mic,
  Plus,
  RefreshCw,
  Send,
  ThumbsUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "../../App.css";
import { incrementViolation } from "../../Communicators/InterviewCommunications";
import { useAuth } from "../../Context/AuthContext";
import { usePc } from "../../hooks/usePc";
import CancelConfirmationModal from "../shared/CancelConfirmationModal";
import { CodeEditor } from "./CodeEditor";
import { SymbolBox } from "./SymbolBox";
import { Warning } from "./Warning";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Extend Navigator interface to include keyboard API
interface Keyboard {
  lock: (keyCodes?: string[]) => Promise<void>;
  unlock: () => void;
}

declare global {
  interface Navigator {
    keyboard?: Keyboard;
  }
}

type Message = {
  id: number;
  type: "question" | "answer";
  content: string;
  showFeedback?: boolean;
  isTyping?: boolean;
  feedbackContent?: string;
  code?: string | null;
};

const REPHRASE_COUNT_KEY = (rollnumber: string, interviewId: string) =>
  `rephraseCount_${rollnumber}_${interviewId}`;

// Add this helper function after your type definitions and before the component
const getQuestionNumber = (messages: Message[], currentIndex: number) => {
  return messages
    .slice(0, currentIndex + 1)
    .filter((msg) => msg.type === "question").length;
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
  // New state to disable inputs during API calls
  const [disableInputs, setDisableInputs] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [isSpeechRecognitionActive, setIsSpeechRecognitionActive] =
    useState(false);
  const [codeQuestions, setCodeQuestions] = useState<
    { question: string; code: string }[]
  >([]);
  const [chatPanelWidth, setChatPanelWidth] = useState(50);
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
  const [isRephrasing, setIsRephrasing] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // <-- new state for refresh loading
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState<any>(null);

  const isPc = usePc();

  // New state for toggling feedback display for answers
  const [visibleFeedbackIds, setVisibleFeedbackIds] = useState<number[]>([]);
  // New state to force component refresh when a new question arrives
  const [componentKey, setComponentKey] = useState(0);
  const lastQuestionIdRef = useRef<number | null>(null);

  // New toggleFeedback function for answer messages
  const toggleFeedbackForAnswer = (answerId: number) => {
    setVisibleFeedbackIds((prev) =>
      prev.includes(answerId)
        ? prev.filter((id) => id !== answerId)
        : [...prev, answerId]
    );
  };

  // useEffect to update componentKey when a new question message arrives
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (
      last &&
      last.type === "question" &&
      last.id !== lastQuestionIdRef.current
    ) {
      lastQuestionIdRef.current = last.id;
      setComponentKey((prev) => prev + 1);
    }
  }, [messages]);

  // Disable text selection globally
  useEffect(() => {
    document.body.style.userSelect = "none";
    const handleDragStart = (e: Event) => e.preventDefault();
    document.addEventListener("dragstart", handleDragStart);
    return () => {
      document.body.style.userSelect = "";
      document.removeEventListener("dragstart", handleDragStart);
    };
  }, []);

  // If not PC view, display warning and button to navigate home.
  if (!isPc) {
    // Add mobile view detection and listener
    <Warning />;
  }

  const handleViolation = async () => {
    if (interviewId) {
      try {
        const violationCount = await incrementViolation(interviewId);
        setViolationCount(violationCount);
        setShowViolationDialog(true);
        enterFullscreen();
      } catch (error) {
        console.error("Error handling violation:", error);
        // Still show dialog even if API call fails
        setViolationCount((prev) => prev + 1);
        setShowViolationDialog(true);
      }
    }
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

  const lockKeyboard = async () => {
    if (navigator.keyboard?.lock) {
      try {
        // Exclude locking Win key to allow system shortcuts like Win+H
        await navigator.keyboard.lock([
          "Escape",
          "Tab",
        ]);
      } catch (err) {
        console.error("Failed to lock keys:", err);
      }
    }
  };

  // Add new useEffect to hide navbar on mount and show it on unmount
  useEffect(() => {
    const navbar = document.getElementById("student-navbar");
    if (navbar != null && navbar.style.display !== "none") {
      navbar.style.display = "none";
    }
    return () => {
      if (navbar) {
        navbar.style.display = "";
      }
    };
  }, []);

  // Modify existing useEffect for keydown and other events
  useEffect(() => {
    const handleVisibilityChange = (e: Event) => {
      if (document.hidden) {
        e.preventDefault();
        handleViolation();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow Win+H 
      if (e.key.toLowerCase() === "h" && e.getModifierState("Meta")) {
        return; 
      }
      
      // Prevent Ctrl+R (or Cmd+R), F5 and F11 actions
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") ||
        e.key === "F5" ||
        e.key === "F11" ||
        e.key === "Escape"
      ) {
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

    // New: Detect tab switch via window blur event
    const handleWindowBlur = () => {
      handleViolation();
    };

    lockKeyboard();
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("click", handleNavbarClick, true);
    window.addEventListener("blur", handleWindowBlur);
    enterFullscreen();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("click", handleNavbarClick, true);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  // Modify existing full-screen enforcement useEffect interval from 2000ms to 1000ms
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (interviewId) {
      fetchInterviewData();
    }
  }, [interviewId]);

  // Create a reusable function to fetch the initial interview data.
  const fetchInterviewData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/interview/start_interview/${interviewId}`
      );
      if (response.data.interview) {
        setInterviewDetails(response.data.interview);
      }
      // Only set interview as complete if the last question has a response
      const exchanges = response.data.interviewExchanges || [];
      const lastExchange = exchanges[exchanges.length - 1];
      const isActuallyComplete =
        response.data.status === "complete" && lastExchange?.response;

      setIsInterviewComplete(isActuallyComplete);

      if (response.data.interviewExchange) {
        setMessages([
          {
            id: Date.now(),
            type: "question",
            content: response.data.interviewExchange.question,
            code: response.data.interviewExchange.code || null,
            showFeedback: false,
            isTyping: false,
          },
        ]);
      } else if (exchanges.length > 0) {
        const formattedMessages = exchanges.flatMap((exchange: any) =>
          [
            {
              id: exchange.id,
              type: "question",
              content: exchange.question,
              code: exchange.code || null,
              showFeedback: false,
              isTyping: false,
            },
            exchange.response && {
              id: exchange.id + "-response",
              type: "answer",
              content: exchange.response,
              feedbackContent: exchange.feedback, // Attach feedback to the answer message
            },
          ].filter(Boolean)
        );
        setMessages(formattedMessages);
      }
      setHasCode(false);
      setCodeContent("");
      setCodePosition({ start: 0, end: 0 });
    } catch (error) {
      console.error("Error fetching interview data:", error);
    } finally {
      setIsLoading(false);
      setDisableInputs(false);
    }
  };

  // New handler: refresh interview without exiting fullscreen.
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setDisableInputs(true);
    try {
      await fetchInterviewData();
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (err) {
          console.error("Error re-enabling fullscreen:", err);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setDisableInputs(false);
      setIsRefreshing(false);
    }
  };

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
    // useEffect(() => {
    //   chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // }, [messages]);   // uncomment this to scroll to the bottom of the chat on every message update

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

  // copy cheyodh ante em ledh, aa event chesinappdu, em cheyyaku chaalu 😂

  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  // New state variables for code canvas
  const [showCodeCanvas, setShowCodeCanvas] = useState(false);
  const [pendingCode, setPendingCode] = useState("");

  const [pendingCodeLanguage, setPendingCodeLanguage] = useState("javascript");
  const handleAnswer = async () => {
    if (
      (inputValue.trim() || pendingCode.trim()) &&
      !isInterviewComplete &&
      interviewId
    ) {
      setDisableInputs(true);
      setIsLoading(true);

      // Combine code and text if both exist
      let finalAnswer = "";
      if (pendingCode.trim()) {
        finalAnswer += `\`\`\`${pendingCodeLanguage}\n${pendingCode}\n\`\`\`\n`;
      }
      if (inputValue.trim()) {
        finalAnswer += inputValue;
      }

      setInputValue("");
      setPendingCode("");
      setShowCodeCanvas(false);

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: "answer", content: finalAnswer },
      ]);

      try {
        const response = await axios.post(`/interview/next/${interviewId}`, {
          response: finalAnswer,
        });
        if (response.data.status === "complete") {
          setIsInterviewComplete(true);
        } else {
          const exchanges = response.data.interviewExchanges;
          const feedback = exchanges.slice(-2)[0].feedback;
          const nextExchange = exchanges.slice(-1)[0];
          setMessages((prev) => {
            const updated = prev.map((msg, idx) =>
              idx === prev.length - 1 && msg.type === "answer"
                ? { ...msg, feedbackContent: feedback }
                : msg
            );
            return [
              ...updated,
              {
                id: Date.now(),
                type: "question",
                content: nextExchange.question,
                code: nextExchange.code || null, // Add code from next question
                isTyping: true,
              },
            ];
          });
        }
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setHasCode(false);
        setCodeContent("");
        setCodePosition({ start: 0, end: 0 });
        setIsEditingCode(false);
      } catch (error) {
        console.error("Error fetching next question:", error);
      } finally {
        setIsLoading(false);
        setDisableInputs(false);
      }
    }
  };

  const handleSkip = async () => {
    if (!isInterviewComplete && interviewId) {
      setShowSkipDialog(false);
      setDisableInputs(true);
      setIsLoading(true);
      const skipResponse =
        "Please move to next question, I don't know the answer";
      setMessages((prev) => [
        ...prev,

        { id: Date.now(), type: "answer", content: skipResponse },
      ]);

      try {
        const response = await axios.post(`/interview/next/${interviewId}`, {
          response: skipResponse,
        });
        if (response.data.status === "complete") {
          setIsInterviewComplete(true);
        } else {
          const exchanges = response.data.interviewExchanges;
          const feedback = exchanges.slice(-2)[0].feedback;
          const nextExchange = exchanges.slice(-1)[0];
          handleRefresh();
        }
        setInputValue("");
        setHasCode(false);
        setCodeContent("");
        setCodePosition({ start: 0, end: 0 });
        setIsEditingCode(false);
      } catch (error) {
        console.error("Error skipping question:", error);
      } finally {
        setIsLoading(false);
        setDisableInputs(false);
      }
    }
  };

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const handleMicClick = () => {
    if (!browserSupportsSpeechRecognition) {
      toast.error("Browser doesn't support speech recognition.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      // Keep the current transcript in inputValue
      setInputValue((prev) => prev + (transcript ? " " + transcript : ""));
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  useEffect(() => {
    if (listening && transcript) {
      setInputValue((prev) => prev + " " + transcript);
      resetTranscript();
    }
  }, [transcript, listening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (listening) {
        SpeechRecognition.stopListening();
        resetTranscript();
      }
    };
  }, []);

  const handleSubmit = async () => {
    console.log(isInterviewComplete + "   and   " + interviewId);
    if (isInterviewComplete && interviewId) {
      setIsSubmitLoading(true); // Show loading modal

      try {
        // Send the request and wait for response
        console.log("sending request");
        const response = await axios.get(`/interview/submit/${interviewId}`);
        console.log("Interview submission response:", response.data);
        
        // Only navigate on successful response
        navigate("/student/completed-interviews");
      } catch (error) {
        console.error("Error submitting interview:", error);
        toast.error("There was an error submitting the interview. Please try again.");
      } finally {
        // Hide loading modal after response or error
        setTimeout(() => {
          setIsSubmitLoading(false);
        }, 1000);
      }
    } else {
      toast.error("you should finish all the questions to submit");
    }
  };

  const handleRephrase = async () => {
    if (globalRephraseCount > 0 && interviewId) {
      setDisableInputs(true);
      setIsRephrasing(true); // Start loading state
      try {
        await axios.get(`/interview/reframe/${interviewId}`);
        handleRefresh();
        setGlobalRephraseCount(globalRephraseCount - 1);
        setHasCode(false);
        setCodeContent("");
        setCodePosition({ start: 0, end: 0 });
      } catch (error) {
        console.error("Error rephrasing question:", error);
      } finally {
        setIsRephrasing(false);
        setDisableInputs(false);
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
    setShowCodeCanvas(true);
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

  const handleCancelCode = () => {
    if (pendingCode.trim()) {
      setShowCancelModal(true);
    } else {
      setShowCodeCanvas(false);
    }
  };

  const confirmCancelCode = () => {
    setPendingCode("");
    setShowCodeCanvas(false);
    setShowCancelModal(false);
  };

  const cancelCancelCode = () => {
    setShowCancelModal(false);
  };

  // New state to store copied code
  const [copiedCode, setCopiedCode] = useState<string>("");

  // Replace existing handleCopyCode with:
  const handleCopyCode = (code: string) => {
    setCopiedCode(code);
    toast.success("Code copied!");
  };

  // Add a new paste handler:
  const handlePasteCode = () => {
    setPendingCode(copiedCode);
  };

  // Update the copy/paste prevention to allow our controlled copying and pasting
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      // Allow copy only through our copy button
      if (
        !e.target ||
        !(e.target as HTMLElement).closest(".code-copy-button")
      ) {
        e.preventDefault();
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      // Allow paste only in code editor and only if content matches copiedCode
      if ((showCodeDialog || showCodeCanvas) && e.clipboardData) {
        const pastedText = e.clipboardData.getData("text");

        if (pastedText !== copiedCode || !copiedCode) {
          e.preventDefault();
          toast.error("You can only paste code copied from questions");
        }
        // If content matches copiedCode, allow the paste to proceed
      } else {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
    };
  }, [copiedCode, showCodeDialog, showCodeCanvas]);

  return (
    <div className="h-screen">
      {/* Loading modal for submit */}
      <Dialog open={isSubmitLoading} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="flex flex-col items-center space-y-4">
            <Check className="h-9 w-8 text-green-500" />
            <DialogTitle>Answers submitted successfully!</DialogTitle>
            <div>Please wait for the results.</div>
          </div>
        </DialogContent>
      </Dialog>

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
            Action not permitted. Violation count: {violationCount}
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

      <div className="h-full flex flex-col">
        {/* Main content area */}
        <div className="flex-1 min-h-0">
          {" "}
          {/* min-h-0 is crucial for nested flex scrolling */}
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="flex-none px-6 py-4 bg-white border-b">
                  <div className="flex justify-between items-center">
                    {/* Modified header title */}
                    <div className="flex flex-col">
                      <div
                        title={interviewDetails?.name || "Interview"}
                        className="text-3xl font-bold truncate max-w-xs"
                      >
                        {interviewDetails?.name &&
                        interviewDetails.name.length > 15
                          ? interviewDetails.name.slice(0, 15) + "..."
                          : interviewDetails?.name || "Interview"}
                        {interviewDetails?.subject && (
                          <span className="ml-2 text-xl text-gray-600">
                            {interviewDetails.subject}
                          </span>
                        )}
                      </div>
                      {interviewDetails?.topic && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {interviewDetails.topic
                            .replace(/"/g, "")
                            .split(",")
                            .map((t: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-xs"
                              >
                                {t.trim()}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-lg font-medium"></span>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          toast.success("thank you for liking skillsage");
                        }}
                      >
                        <ThumbsUp className="h-6 w-6" />
                      </Button>
                      <div className="flex items-center align-middle space-x-2">
                        <span className="font-bold">Refresh</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="rounded-full shadow-md hover:shadow-lg transition-shadow duration-300"
                                onClick={handleRefresh}
                                disabled={disableInputs}
                              >
                                {isRefreshing ? (
                                  <Loader2 className="animate-spin h-6 w-6" />
                                ) : (
                                  <RefreshCw className="h-6 w-6" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Refresh the interview to get the latest data</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div
                        className={`${
                          isInterviewComplete ? "submit-shadow rounded-sm" : ""
                        }`}
                      >
                        <Button
                          onClick={handleSubmit}
                          className={`${
                            isInterviewComplete ? "h-11 w-24" : ""
                          }`}
                        >
                          Submit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat container - Make it scrollable */}
                <div className="flex-1 min-h-0 p-6">
                  {" "}
                  {/* min-h-0 is crucial */}
                  <div className="h-full overflow-y-auto bg-white rounded-lg shadow-md p-4">
                    <AnimatePresence>
                      {messages.map((message, index) => {
                        // For answer messages, check if next message has feedbackContent
                        const nextMessage =
                          index + 1 < messages.length
                            ? messages[index + 1]
                            : null;
                        return (
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
                            <div
                              className={`flex ${
                                message.type !== "question"
                                  ? "flex-row-reverse"
                                  : ""
                              }`}
                            >
                              {/* ...existing avatar rendering code... */}
                              <div
                                className={`inline-block p-2.5 pl-4 rounded-lg max-w-5xl ${
                                  message.type === "question"
                                    ? "bg-blue-100 text-left"
                                    : "bg-green-100 text-left"
                                }`}
                              >
                                {message.type === "question" ? (
                                  <>
                                    <span className="font-bold mr-2">
                                      Q{getQuestionNumber(messages, index)}:
                                    </span>
                                    {formatMessageContent(message.content)}
                                    {message.code && (
                                      <div className="mt-4 p-2 bg-gray-800 rounded-lg relative">
                                        {/* Improved copy button */}
                                        <div className="absolute top-2 right-2 z-10 code-copy-button">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="bg-gray-700 text-white hover:bg-gray-500 flex items-center gap-1 px-2 py-1 shadow-md"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleCopyCode(message.code);
                                            }}
                                          >
                                            <Copy className="h-3.5 w-3.5 mr-1" />
                                            <span className="text-xs font-medium">
                                              Copy
                                            </span>
                                          </Button>
                                        </div>
                                        <SyntaxHighlighter
                                          language="java"
                                          style={materialDark}
                                          showLineNumbers={true}
                                          wrapLines={true}
                                          customStyle={{
                                            margin: 0,
                                            padding: "1rem",
                                            borderRadius: "0.5rem",
                                          }}
                                        >
                                          {message.code}
                                        </SyntaxHighlighter>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {formatMessageContent(message.content)}
                                    {/* Comment out feedback functionality 
                                    {message.feedbackContent && (
                                      <>
                                        <div className="mt-2 flex items-center">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              toggleFeedbackForAnswer(
                                                message.id
                                              )
                                            }
                                          >
                                            {visibleFeedbackIds.includes(
                                              message.id
                                            )
                                              ? "Hide Feedback"
                                              : "Show Feedback"}
                                            {visibleFeedbackIds.includes(
                                              message.id
                                            ) ? (
                                              <ChevronUp className="ml-1" />
                                            ) : (
                                              <ChevronDown className="ml-1" />
                                            )}
                                          </Button>
                                        </div>
                                        <AnimatePresence>
                                          {visibleFeedbackIds.includes(
                                            message.id
                                          ) && (
                                            <motion.div
                                              initial={{
                                                height: 0,
                                                opacity: 0,
                                              }}
                                              animate={{
                                                height: "auto",
                                                opacity: 1,
                                              }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.5 }}
                                              style={{
                                                overflow: "hidden",
                                                maxWidth: "100%",
                                              }}
                                              className="mt-1"
                                            >
                                              <div className="p-2 border rounded bg-gray-50 text-sm text-gray-600">
                                                {formatMessageContent(
                                                  message.feedbackContent
                                                )}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </>
                                    )}
                                    */}
                                  </>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
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
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              </div>
            </ResizablePanel>

            {showCodeCanvas && (
              <>
                <ResizableHandle className="relative w-2 transition-colors hover:bg-blue-100">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white p-1.5 rounded-lg border border-blue-200 shadow-sm">
                      <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                    </div>
                  </div>
                </ResizableHandle>
                <ResizablePanel defaultSize={50} minSize={30}>
                  <div className="h-full flex flex-col">
                    <ResizablePanelGroup direction="vertical">
                      <ResizablePanel defaultSize={60}>
                        <div className="h-full overflow-hidden">
                          <CodeEditor
                            showCodeDialog={showCodeCanvas}
                            setShowCodeDialog={setShowCodeCanvas}
                            codeLanguage={pendingCodeLanguage}
                            setCodeLanguage={setPendingCodeLanguage}
                            codeContent={pendingCode}
                            setCodeContent={setPendingCode}
                            handleCodeSubmit={handleAnswer}
                            isEditingCode={false}
                            isCanvas={true}
                            onCancel={handleCancelCode}
                            onPaste={handlePasteCode} // <-- pass new onPaste prop
                          />
                        </div>
                      </ResizablePanel>

                      {/* ...existing vertical handle... */}

                      <ResizablePanel defaultSize={40}>
                        <div className="h-full overflow-y-auto p-4">
                          <div className="p-4 flex flex-col gap-4">
                            {/* Input controls section */}
                            <div className="flex items-center space-x-2">
                              {/* Comment out microphone button 
                              <motion.div
                                whileTap={{ scale: 0.95 }}
                                className="rounded-full shadow-md p-2 bg-white"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`rounded-full ${
                                    listening
                                      ? "bg-red-100 hover:bg-red-200"
                                      : ""
                                  }`}
                                  onClick={handleMicClick}
                                  disabled={
                                    isInterviewComplete || disableInputs
                                  }
                                >
                                  <Mic
                                    className={`h-4 w-4 ${
                                      listening ? "text-red-500" : ""
                                    }`}
                                  />
                                </Button>
                              </motion.div>
                              */}

                              <div className="flex-1 bg-gray-100">
                                <Textarea
                                  ref={textareaRef}
                                  value={inputValue}
                                  onChange={(e) =>
                                    setInputValue(e.target.value)
                                  }
                                  placeholder={
                                    isInterviewComplete
                                      ? "Interview complete"
                                      : "Add explanation (optional)..."
                                  }
                                  className="w-full"
                                  rows={4}
                                  disabled={
                                    isInterviewComplete || disableInputs
                                  }
                                />
                              </div>

                              <Button
                                onClick={handleAnswer}
                                disabled={isInterviewComplete || disableInputs}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Action buttons */}
                            <div className="flex justify-around gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="bg-slate-800 text-white shadow-lg flex-1"
                                      onClick={handleRephrase}
                                      disabled={
                                        isInterviewComplete ||
                                        globalRephraseCount <= 0 ||
                                        isRephrasing ||
                                        disableInputs
                                      }
                                    >
                                      {isRephrasing
                                        ? "Loading..."
                                        : `Rephrase (${globalRephraseCount})`}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Request a different phrasing of the
                                      current question
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="bg-slate-800 text-white shadow-lg flex-1"
                                      onClick={() =>
                                        setShowSymbolDialog(true)
                                      }
                                      disabled={
                                        isInterviewComplete || disableInputs
                                      }
                                    >
                                      <Plus className="h-4 w-4 mr-2" />
                                      Symbol
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Insert mathematical or special symbols</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="bg-slate-800 text-white shadow-lg flex-1"
                                      onClick={() =>
                                        setShowSkipDialog(true)
                                      }
                                      disabled={
                                        isInterviewComplete || disableInputs
                                      }
                                    >
                                      Skip
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      Skip the current question and move to the
                                      next one
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      </ResizablePanel>
                    </ResizablePanelGroup>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>

        {/* Bottom input area - when code canvas is not shown */}
        {!showCodeCanvas && (
          <div className="flex-none bg-gray-100 p-6">
            <div className="flex items-center space-x-2 relative">
              {/* Comment out microphone button in bottom area
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="rounded-full shadow-md p-2 bg-white"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${
                    listening ? "bg-red-100 hover:bg-red-200" : ""
                  }`}
                  onClick={handleMicClick}
                  disabled={
                    isSpeechRecognitionActive ||
                    isInterviewComplete ||
                    disableInputs
                  }
                >
                  <Mic
                    className={`h-4 w-4 ${
                      isSpeechRecognitionActive ? "text-red-500" : ""
                    }`}
                  />
                </Button>
              </motion.div>
              */}
              <div className="flex-1 relative group">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  rows={4}
                  style={{ height: "100px", width: "100%" }}
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
                  disabled={isInterviewComplete || disableInputs}
                  onDrop={(e) => e.preventDefault()} // disable drag-paste
                />
                {isInterviewComplete && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex  items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-gray-800 font-medium text-center">
                      Your interview is done, please submit to see the results
                    </p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleAnswer}
                disabled={isInterviewComplete || disableInputs}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-around mt-4">
              <div className="relative">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-slate-800 text-white shadow-lg"
                        onClick={handleRephrase}
                        disabled={
                          isInterviewComplete ||
                          globalRephraseCount <= 0 ||
                          isRephrasing ||
                          disableInputs
                        }
                      >
                        {isRephrasing
                          ? "Loading..."
                          : `Question rephrasing chances: ${globalRephraseCount}`}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Request a different phrasing of the current question
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {globalRephraseCount <= 0 && (
                  <div className="absolute inset-0 bg-gray-200 bg-opacity-80 flex items-center justify-center rounded-md">
                    <p className="text-gray-800 font-medium text-center text-sm px-2">
                      You have used all your rephrases
                    </p>
                  </div>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-slate-800 text-white shadow-lg"
                      onClick={() => setShowSymbolDialog(true)}
                      disabled={isInterviewComplete || disableInputs}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Symbol
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Insert mathematical or special symbols</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-slate-800 text-white shadow-lg"
                      onClick={hasCode ? handleEditCode : handleAddCode}
                      disabled={isInterviewComplete || disableInputs}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      {hasCode ? "Edit Code" : "Add Code"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {hasCode
                        ? "Edit existing code in your answer"
                        : "Add code to your answer"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-slate-800 text-white shadow-lg"
                      onClick={() => setShowSkipDialog(true)}
                      disabled={isInterviewComplete || disableInputs}
                    >
                      Skip the Question
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Skip the current question and move to the next one</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
      <CancelConfirmationModal
        isOpen={showCancelModal}
        onConfirm={confirmCancelCode}
        onCancel={cancelCancelCode}
      />
    </div>
  );
}

function setShowCodeCanvas(arg0: boolean) {
  throw new Error("Function not implemented.");
}
