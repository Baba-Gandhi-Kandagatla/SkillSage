import {
  createNewInterview,
  deleteInterview,
  getAllInterviews,
  pauseInterview,
  startInterview,
} from "@/Communicators/InterviewCommunications";
import { getAllDepartments, getInterviewPreferences } from "@/Communicators/apiCommunications";
import { Badge } from "@/components/ui/badge";
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
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
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
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { SetStateAction, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreateInterviewCard } from "./CreateInterviewCard";
import { Label } from "@/components/ui/label";

let allDepartments: string[] = [];

// Add helper function to parse topic string into tags
const parseTopics = (topicString: string) =>
  topicString.replace(/^"|"$/g, "").split(",").map(tag => tag.trim());

// Add these new interfaces after the existing Interview interface
interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  interviewName: string;
}

function DeleteConfirmDialog({ isOpen, onClose, onConfirm, interviewName }: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState("");
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600">Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the interview <span className="font-semibold">"{interviewName}"</span>? 
            This action cannot be undone.
          </p>
          <div className="space-y-2">
            <Label htmlFor="confirm-text">Type "delete" to confirm:</Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete"
              className="w-full"
            />
          </div>
        </div>
        <DialogFooter className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmText !== "delete"}
          >
            Delete Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function InterviewDashboard() {
  const [interviews, setInterviews] = useState([] as Interview[]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Interview>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

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

  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; interviewId: number | null; interviewName: string }>({
    isOpen: false,
    interviewId: null,
    interviewName: ""
  });

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const data = await getAllInterviews();
        setInterviews(data);
        setDataLoaded(true);
      } catch (error) {
        console.error("Error fetching interviews:", error);
        setDataLoaded(true);
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
    predefined_questions: string[];
  }) => {
    try {
      const get_prefs = async()=>{
        const response = await getInterviewPreferences();
        console.log("got the response",response);
        return response;
      }

      const {total_questions,no_of_coding_questions}= await get_prefs();
      
      await createNewInterview({
        name: newInterview.name,
        subject: newInterview.subject,
        topic: newInterview.topic,
        departments: newInterview.department.split(",").map(dep => dep.trim()),
        no_of_questions: total_questions,
        no_of_coding_questions: no_of_coding_questions,
        predefined_questions: newInterview.predefined_questions || [], // Add predefined questions
      } as {
        name: string;
        subject: string;
        topic: string;
        departments: string[];
        no_of_questions: number;
        no_of_coding_questions: number;
        predefined_questions: string[];
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
      setDeleteDialog({ isOpen: false, interviewId: null, interviewName: "" });
    } catch (error) {
      console.error("Error deleting interview:", error);
    }
  }, []);

  const initiateDelete = (interview: Interview) => {
    setDeleteDialog({
      isOpen: true,
      interviewId: interview.id,
      interviewName: interview.name
    });
  };

  const handleViewInterview = (interview: Interview) => {
    navigate("/admin/interview-student-list", { state: { interview } });
  };

  const filteredInterviews = interviews.filter(
    (interview) =>
      interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Fix: Ensure departments is an array
      (Array.isArray(interview.departments) ? interview.departments : [interview.departments])
        .some(department => department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      interview.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedInterviews = filteredInterviews.sort((a, b) => {
    let comp = 0;
    if (sortField === "createdAt") {
      comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortField === "departments") {
      comp = a.departments[0]?.toLowerCase().localeCompare(b.departments[0]?.toLowerCase() || "");
    } else {
      comp = String(a[sortField]).localeCompare(String(b[sortField]));
    }
    return sortOrder === "asc" ? comp : -comp;
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

  const handleSortFieldChange = (value: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSortField(value as keyof Interview);
      setCurrentPage(1);
      setIsLoading(false);
    }, 500);
  };

  const handleSortOrderChange = (order: "asc" | "desc") => {
    setIsLoading(true);
    setTimeout(() => {
      setSortOrder(order);
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
      <TableRow key={interview.id}>        <TableCell className="text-center">{interview.name}</TableCell>
        <TableCell className="text-center">{interview.subject}</TableCell>
        {/* Updated topic cell: use Badge component with flex-wrap for proper stacking */}        <TableCell className="text-center p-2">
          <div className="flex flex-wrap justify-center gap-1 max-w-full">
            {(() => {
              const topics = parseTopics(interview.topic);
              const visibleTopics = topics.slice(0, 3); // Show only first 3 topics
              const remainingCount = topics.length - visibleTopics.length;

              return (
                <TooltipProvider>
                  <>
                    {visibleTopics.map((tag, idx) => (
                      <Badge key={idx} 
                      variant="secondary" 
                      className="bg-gray-100 font-medium text-gray-600 hover:bg-gray-200 text-xs whitespace-nowrap"
                      >
                        {tag.trim().replace(/^"|"$/g, '')}
                      </Badge>
                    ))}
                    
                    {remainingCount > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge 
                            variant="outline" 
                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs cursor-pointer"
                          >
                            +{remainingCount} more
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white text-gray-800 border border-gray-200 p-2 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {topics.slice(3).map((tag, idx) => (
                              <Badge key={idx} 
                                variant="secondary" 
                                className="bg-gray-100 font-medium text-gray-600 text-xs"
                              >
                                {tag.trim().replace(/^"|"$/g, '')}
                              </Badge>
                            ))}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </>
                </TooltipProvider>
              );
            })()}
          </div>
        </TableCell>
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
              onClick={() => initiateDelete(interview)}
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
              disabled={interview.status === "scheduled"}
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

  if (!dataLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin mb-4" />
          <p>Loading Interviews</p>
        </div>
      </div>
    )
  }

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
          {/* New sort label */}
          <span className="font-medium">Sort:</span>
          <Select onValueChange={handleSortFieldChange} defaultValue={sortField}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Sort by field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Created At</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="departments">Department</SelectItem>
              <SelectItem value="topic">Topic</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleSortOrderChange("asc")} variant={sortOrder === "asc" ? "default" : "outline"}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button onClick={() => handleSortOrderChange("desc")} variant={sortOrder === "desc" ? "default" : "outline"}>
            <ArrowDown className="h-4 w-4" />
          </Button>
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
                  onDelete={initiateDelete}
                  onView={handleViewInterview}
                  loadingStates={loadingStates[interview.id] || {}}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden bg-white bg-opacity-20 backdrop-blur-lg backdrop-filter border border-gray-200 shadow-xl">          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="text-center w-[15%]">Name</TableHead>
                <TableHead className="text-center w-[15%]">Subject</TableHead>
                <TableHead className="text-center w-[25%]">Topic</TableHead>
                <TableHead className="text-center w-[15%]">Department</TableHead>
                <TableHead className="text-center w-[10%]">Status</TableHead>
                <TableHead className="text-center w-[20%]">Actions</TableHead>
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
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, interviewId: null, interviewName: "" })}
        onConfirm={() => deleteDialog.interviewId && handleDeleteInterview(deleteDialog.interviewId)}
        interviewName={deleteDialog.interviewName}
      />
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
  createdAt: string; // added for timestamp sorting
  predefined_questions?: string[]; // Add predefined_questions field to match backend model
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
  onDelete: (interview: Interview) => void;
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
        Department: {interview.departments}        <br />        Topic:
        <div className="flex flex-wrap gap-1 mt-1">
          {(() => {
            const topics = parseTopics(interview.topic);
            const visibleTopics = topics.slice(0, 2); // Show only first 2 topics for mobile
            const remainingCount = topics.length - visibleTopics.length;

            return (
              <TooltipProvider>
                <>
                  {visibleTopics.map((tag, idx) => (
                    <Badge key={idx} 
                      variant="secondary" 
                      className="bg-gray-100 font-medium text-gray-600 hover:bg-gray-200 text-xs"
                    >
                      {tag.trim().replace(/^"|"$/g, '')}
                    </Badge>
                  ))}
                  
                  {remainingCount > 0 && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs cursor-pointer"
                        >
                          +{remainingCount} more
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-gray-800 border border-gray-200 p-2 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {topics.slice(2).map((tag, idx) => (
                            <Badge key={idx} 
                              variant="secondary" 
                              className="bg-gray-100 font-medium text-gray-600 text-xs"
                            >
                              {tag.trim().replace(/^"|"$/g, '')}
                            </Badge>
                          ))}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              </TooltipProvider>
            );
          })()}
        </div>
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
          onClick={() => onDelete(interview)}
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
