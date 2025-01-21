import {
  createNewInterview,
  deleteInterview,
  getAllInterviews,
  pauseInterview,
  startInterview,
} from "@/Communicators/InterviewCommunications";
import { getAllDepartments } from "@/Communicators/apiCommunications";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Eye,
  Loader2,
  Play,
  RefreshCcw,
  Search,
  Square,
  Trash2,
} from "lucide-react";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateInterviewCard } from "./CreateInterviewCard";

let allDepartments: string[] = [];

export function InterviewDashboard() {
  const [interviews, setInterviews] = useState([] as Interview[]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof Interview>("name");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingStates, setLoadingStates] = useState<{
    [key: number]: { start?: boolean; end?: boolean; delete?: boolean };
  }>({});
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInterview] = useState<{
    id: number;
    name: string;
    subject: string;
    department: string;
    topic: string;
    status: string;
  } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getAllInterviews();
        setInterviews(data);
      } catch (error) {
        console.error("Error fetching interviews:", error);
      }
    };

    fetchInterviews();
  }, []);

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    getAllDepartments().then((res) => {
      // console.log(res);
      allDepartments = res.map(
        (department: { name: string }) => department.name
      );
      console.log(allDepartments);
    });
  }, []);

   const handleCreateInterview = async (newInterview: {
    name: string;
    subject: string;
    department: string;
    topic: string;
  }) => {
    try {
      await createNewInterview({
        name: newInterview.name,
        subject: newInterview.subject,
        topic: newInterview.topic,
        departments: newInterview.department.split(",").map(dep => dep.trim()), // Split and trim the department string
        no_of_questions: 6, // or any appropriate default value
        no_of_coding_questions: 6, // or any appropriate default value
      });
      const updatedInterviews = await getAllInterviews();
      setInterviews(updatedInterviews);
    } catch (error) {
      console.error("Error creating interview:", error);
    }
  };
  const handleStartInterview = useCallback(
    async (id: number) => {
      try {
        await startInterview(id.toString());
        setInterviews((interviews) =>
          interviews.map((interview) =>
            interview.id === id ? { ...interview, status: "active" } : interview
          )
        );
      } catch (error) {
        console.error("Error starting interview:", error);
      }
    },
    [interviews]
  );

  const handleEndInterview = useCallback(
    async (id: number) => {
      try {
        await pauseInterview(id.toString());
        setInterviews((interviews) =>
          interviews.map((interview) =>
            interview.id === id ? { ...interview, status: "paused" } : interview
          )
        );
      } catch (error) {
        console.error("Error pausing interview:", error);
      }
    },
    [interviews]
  );

  const handleDeleteInterview = useCallback(async (id: number) => {
    try {
      await deleteInterview(id.toString());
      setInterviews((interviews) =>
        interviews.filter((interview) => interview.id !== id)
      );
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  }, []);

  const handleViewInterview = (interview: Interview) => {
    navigate("/admin/interview-student-list", { state: { interview } });
  };

  const filteredInterviews = interviews.filter(
    (interview) =>
      interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.departments.some(department => department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      interview.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInterviews = filteredInterviews.sort((a, b) => {
    if (sortBy === "status") {
      const statusOrder = { Scheduled: 1, "In Progress": 2, Completed: 3 };
      return (
        statusOrder[a.status as keyof typeof statusOrder] -
        statusOrder[b.status as keyof typeof statusOrder]
      );
    }
    return String(a[sortBy]).localeCompare(String(b[sortBy]));
  });

  const paginatedInterviews = sortedInterviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageCount = Math.ceil(sortedInterviews.length / itemsPerPage);

  const handleSearch = () => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(1);
      setIsLoading(false);
    }, 1000);
  };

  const handleSearchInputChange = (e: {
    target: { value: SetStateAction<string> };
  }) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyPress = (e: { key: string }) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSort = (
    value: "id" | "name" | "subject" | "departments" | "topic" | "status"
  ) => {
    setIsLoading(true);
    setTimeout(() => {
      setSortBy(value);
      setCurrentPage(1);
      setIsLoading(false);
    }, 500);
  };

  const handleItemsPerPageChange = (value: any) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };


  const renderInterviewRows = () => {
    if (paginatedInterviews.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="h-24 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-yellow-500 mb-2" />
            No interviews are present
          </TableCell>
        </TableRow>
      );
    }

    const rows = paginatedInterviews.map((interview) => (
      <TableRow key={interview.id}>
        <TableCell className="text-center">{interview.name}</TableCell>
        <TableCell className="text-center">{interview.subject}</TableCell>
        <TableCell className="text-center">{interview.topic}</TableCell>
        <TableCell className="text-center">{interview.departments}</TableCell>
        <TableCell className="text-center align-middle">
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              interview.status === "scheduled"
                ? "bg-yellow-200 text-yellow-800"
                : interview.status === "active"
                ? "bg-green-200 text-green-800"
                : "bg-blue-200 text-blue-800"
            }`}
          >
            {interview.status}
          </span>
        </TableCell>
        <TableCell className="text-center align-middle">
          <div className="flex justify-center space-x-5">
            <Button
              size="sm"
              onClick={() => handleStartInterview(interview.id)}
              disabled={
                interview.status === "active" ||
                loadingStates[interview.id]?.start
              }
            >
              {loadingStates[interview.id]?.start ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={() => handleEndInterview(interview.id)}
              disabled={
                interview.status !== "active" ||
                loadingStates[interview.id]?.end
              }
            >
              {loadingStates[interview.id]?.end ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteInterview(interview.id)}
              disabled={loadingStates[interview.id]?.delete}
            >
              {loadingStates[interview.id]?.delete ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                handleViewInterview(interview);
                setViewDialogOpen(true);
              }}
              disabled={interview.status !== "active" && interview.status !== "Completed"}
              className={
                interview.status !== "active" && interview.status !== "Completed" ? "cursor-not-allowed" : ""
              }
            >
              View
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ));

    // Add empty rows to maintain consistent table size
    const emptyRows = 10 - rows.length;
    for (let i = 0; i < emptyRows; i++) {
      rows.push(
        <TableRow key={`empty-${i}`}>
          <TableCell colSpan={7}>&nbsp;</TableCell>
        </TableRow>
      );
    }

    return rows;
  };

  return (
    <div className="container mx-auto p-4 pt-16 space-y-4 font-inter">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body {
          font-family: 'Roboto', sans-serif;
        }
      `}</style>
      <h1 className="text-3xl font-bold mb-4">Interview Dashboard</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-64 flex">
          <Input
            type="text"
            placeholder="Search interviews..."
            value={searchTerm}
            onChange={handleSearchInputChange}
            onKeyPress={handleSearchKeyPress}
            className="pl-10 w-full"
          />
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Button onClick={handleSearch} className="ml-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select onValueChange={handleSort} defaultValue={sortBy}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="departments">Department</SelectItem>
              <SelectItem value="topic">Topic</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <CreateInterviewCard onCreateInterview={handleCreateInterview} />
        </div>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-800"></div>
        </div>
      ) : isMobile ? (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence>
            {paginatedInterviews.map((interview) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InterviewCard
                  interview={interview}
                  onStart={handleStartInterview}
                  onEnd={handleEndInterview}
                  onDelete={handleDeleteInterview}
                  onView={handleViewInterview}
                  loadingStates={loadingStates[interview.id] || {}}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden bg-white bg-opacity-20 backdrop-blur-lg backdrop-filter border border-gray-200 shadow-xl">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Name</TableHead>
                <TableHead className="text-center">Subject</TableHead>
                <TableHead className="text-center">Topic</TableHead>
                <TableHead className="text-center">Department</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderInterviewRows()}</TableBody>
          </Table>
        </div>
      )}
      <div className="flex justify-between items-center mt-4">
        <Select
          onValueChange={handleItemsPerPageChange}
          defaultValue={itemsPerPage.toString()}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Interviews per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10 per page</SelectItem>
            <SelectItem value="15">15 per page</SelectItem>
            <SelectItem value="25">25 per page</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
      </div>
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>View Interview Details</DialogTitle>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4">
              <p>
                <strong>Name:</strong> {selectedInterview.name}
              </p>
              <p>
                <strong>Subject:</strong> {selectedInterview.subject}
              </p>
              <p>
                <strong>Department:</strong> {selectedInterview.department}
              </p>
              <p>
                <strong>Topic:</strong> {selectedInterview.topic}
              </p>
              <p>
                <strong>Status:</strong> {selectedInterview.status}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface Interview {
  id: number;
  name: string;
  subject: string;
  departments: string[]; // Changing department to departments and make it an array of strings
  topic: string;
  status: string;
}

function InterviewCard({
  interview,
  onStart,
  onEnd,
  onDelete,
  onView,
  loadingStates,
}: {
  interview: Interview;
  onStart: (id: number) => void;
  onEnd: (id: number) => void;
  onDelete: (id: number) => void;
  onView: (interview: Interview) => void;
  loadingStates: { start?: boolean; end?: boolean; delete?: boolean };
}) {
  return (
    <motion.div
      className="bg-white bg-opacity-20 backdrop-blur-lg backdrop-filter border border-gray-200 p-6 rounded-lg shadow-xl"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <h3 className="text-lg font-semibold mb-2">{interview.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        Subject: {interview.subject}
        <br />
        Department: {interview.departments}
        <br />
        Topic: {interview.topic}
      </p>
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            interview.status === "Scheduled"
              ? "bg-yellow-200 text-yellow-800"
              : interview.status === "In Progress"
              ? "bg-blue-200 text-blue-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {interview.status}
        </span>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(interview.id)}
          disabled={loadingStates.delete}
        >
          {loadingStates.delete ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Delete"
          )}
        </Button>
      </div>
      <div className="flex justify-between">
        <Button
          onClick={() => onStart(interview.id)}
          disabled={interview.status === "In Progress" || loadingStates.start}
        >
          {loadingStates.start ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Start Interview"
          )}
        </Button>
        <Button
          onClick={() => onEnd(interview.id)}
          disabled={interview.status !== "In Progress" || loadingStates.end}
        >
          {loadingStates.end ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "End Interview"
          )}
        </Button>
      </div>
      <Button
        className="w-full mt-4"
        variant="outline"
        onClick={() => onView(interview)}
      >
        <Eye className="h-4 w-4 mr-2" /> View Details
      </Button>
    </motion.div>
  );
}
