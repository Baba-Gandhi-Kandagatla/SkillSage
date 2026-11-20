import { getInterviewAttendance } from '@/Communicators/apiCommunications';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DonutChart } from "@/components/ui/donut-chart";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Search, BarChart, ArrowUpDown } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useLocation, useNavigate } from "react-router-dom";

export interface Student {
  rollNo: string;
  name: string;
  violations: number;
  status: 'Completed' | 'In Progress' | 'Not Started';
  score: number | null;
  ip: string;           // Added IP field
  ipChange: boolean;     // Added IP change flag
}

interface InterviewStudentListProps {
  interviewName: string;
}

export default function InterviewStudentList({ interviewName }: InterviewStudentListProps) {
  console.log(interviewName);
  const navigate = useNavigate();
  const location = useLocation();
  const { interview } = location.state || { interview: null };

  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rollNo' | 'name' | 'score' | 'rollNoAndStatus' | 'violations'>('rollNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Added sort direction
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [open, setOpen] = useState(false); // State for dialog visibility
  const didFetch = useRef(false);

  // Add IP frequency count
  const ipCounts = students.reduce((acc, student) => {
    if (student.ip) {
      acc[student.ip] = (acc[student.ip] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Prepare charts data
  const completedCount = students.filter(s => s.status === 'Completed').length;
  const inProgressCount = students.filter(s => s.status === 'In Progress').length;
  
  const submissionData = [
    { label: "Completed", value: completedCount },
    { label: "In Progress", value: inProgressCount },
  ];
  
  // Calculate average score
  const calculateAverageScore = () => {
    const studentsWithScores = students.filter(s => s.score !== null);
    if (studentsWithScores.length === 0) return 0;
    
    const totalScore = studentsWithScores.reduce((sum, student) => sum + (student.score || 0), 0);
    return (totalScore / studentsWithScores.length) * 10; // Convert to 0-100 scale
  };
  
  const averageScore = calculateAverageScore();
  
  // Create score distribution data
  const createScoreRangeData = () => {
    const ranges = [
      { label: "0-10", value: 0 },
      { label: "10-20", value: 0 },
      { label: "20-30", value: 0 },
      { label: "30-40", value: 0 },
      { label: "40-50", value: 0 },
      { label: "50-60", value: 0 },
      { label: "60-70", value: 0 },
      { label: "70-80", value: 0 },
      { label: "80-90", value: 0 },
      { label: "90-100", value: 0 },
    ];
    
    students.forEach(student => {
      if (student.score !== null) {
        // Convert score to 0-100 scale
        const score = student.score * 10;
        const rangeIndex = Math.min(Math.floor(score / 10), 9);
        ranges[rangeIndex].value += 1;
      }
    });
    
    // Filter out ranges with zero values to make chart cleaner
    return ranges.filter(range => range.value > 0);
  };
  
  const scoreData = createScoreRangeData();

  const fetchAttendance = async () => {
    if (interview?.id) {
      try {
        console.log('Fetching attendance for interview ID:', interview.id);
        const response = await getInterviewAttendance(interview.id);
        
        const attendanceData = response.activeData || [];
        
        const studentsWithDetails = await Promise.all(
          attendanceData.map(async (student: any) => {            try {
              // Transforming student data to our format
              return {
                rollNo: student.rollnumber,
                name: student.username,
                violations: student.violations || 0,
                status: student.submitted === 'submitted' ? 'Completed' : 'In Progress',
                score: student.total_marks ? parseFloat(student.total_marks) : null,
                ip: student.ip,
                ipChange: student.ip_change,
              };
            } catch (error) {
              console.error(`Failed to fetch details for student ${student.rollnumber}:`, error);
              return {
                rollNo: student.rollnumber,
                name: student.username,
                violations: student.violations || 0,
                status: student.submitted === 'submitted' ? 'Completed' : 'In Progress',
                score: student.total_marks ? parseFloat(student.total_marks) : null,
                ip: student.ip,
                ipChange: student.ip_change,
              };
            }
          })
        );
        
        setStudents(studentsWithDetails);
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setIsLoading(false); // Ensure the loading state is turned off
      }
    }
  };

  useEffect(() => {
    if (!didFetch.current) {
      fetchAttendance();
      didFetch.current = true;
    }
  }, [interview?.id]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  const handleSort = (value: 'rollNo' | 'name' | 'score' | 'rollNoAndStatus' | 'violations') => {
    if (sortBy === value) {
      // Toggle direction if same field is selected
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending when changing sort field
      setSortDirection('asc');
      setSortBy(value);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAttendance();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStudentsPerPageChange = (value: number) => {
    setStudentsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing students per page
  };

  const handleViewStudent = (student: Student) => {
    setIsViewLoading(true);
    setTimeout(() => {
      setIsViewLoading(false);
    }, 2000);
    // For admin, send only rollNo and interviewId in state
    navigate('/admin/view-analysis', { state: { rollNo: student.rollNo, interviewId: interview?.id } });
  };

  const handleDownload = () => {
    const csvContent = [
      ['Roll No', 'Name', 'Violations', 'Status', 'Score', 'IP'], // Added IP header
      ...students.map(student => [
        student.rollNo,
        student.name,
        student.violations,
        student.status,
        student.score !== null ? student.score.toString() : '',
        student.ip,  // Added IP value
      ]),
    ]
      .map(e => e.join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter(student =>
    (student.rollNo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'rollNo':
        comparison = a.rollNo.localeCompare(b.rollNo);
        break;
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'score':
        comparison = (b.score || 0) - (a.score || 0);
        break;
      case 'rollNoAndStatus':
        if (a.status === b.status) {
          comparison = a.rollNo.localeCompare(b.rollNo);
        } else {
          comparison = a.status === 'In Progress' ? -1 : 1;
        }
        break;
      case 'violations':
        comparison = b.violations - a.violations;
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-6 min-h-screen text-gray-800 pt-20 font-roboto"
    >
      {interview && (
        <div className="flex flex-row justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{interview.name}</h2>
            <p className="text-md text-gray-600">
              <strong>Subject:</strong> {interview.subject}<strong>Topic:</strong>{' '}
              {interview.topic.split(',').map((tag:any) => (
                <span key={tag} className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2 mb-1 text-sm">
                  {tag.trim().replace(/^"|"$/g, '')}
                </span>
              ))}
            </p>
          </div>          <div className="flex gap-2 items-center">
            <div className='font-bold animate-pulse'>Refresh </div>
            <Button
              onClick={handleRefresh}
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
            <Button
              onClick={handleDownload}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Download Student Data
            </Button>
            <Button
              onClick={() => setOpen(true)}
              className="bg-gray-800 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </div>
      )}      <div className="mb-6">
        {/* Stats Tile Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Submission Status Tile */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Submission Status</h3>
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <div className="flex justify-center">
                    <motion.div 
                      className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-semibold text-xl"
                      whileHover={{ scale: 1.1 }}
                    >
                      {completedCount}
                    </motion.div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Completed</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center">
                    <motion.div 
                      className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold text-xl"
                      whileHover={{ scale: 1.1 }}
                    >
                      {inProgressCount}
                    </motion.div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="flex justify-center">
                    <motion.div 
                      className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-semibold text-xl"
                      whileHover={{ scale: 1.1 }}
                    >
                      {students.length}
                    </motion.div>
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Total</div>
                </div>
              </div>
            </div>
            
            {/* Average Score Tile */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Average Test Score</h3>
              <div className="flex items-start justify-center h-full">
                <motion.div 
                  className="text-5xl font-bold text-gray-800"
                  initial={{ scale: 1 }}
                  animate={{ scale: 1 }}
                  transition={{ repeat: Infinity, repeatType: "reverse", duration: 10 }}
                >
                  {averageScore.toFixed(1)}
                  <span className="text-2xl text-gray-500 ml-1">/100</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Sort Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="relative w-full md:w-64 flex mb-4 md:mb-0">
            <label className="sr-only" htmlFor="search">Search Students</label>
            <Input
              id="search"
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 w-full bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sort By</label>
              <div className="flex items-center">
                <Select onValueChange={(value) => handleSort(value as 'rollNo' | 'name' | 'score' | 'rollNoAndStatus' | 'violations')} defaultValue={sortBy}>
                  <SelectTrigger className="w-full md:w-[170px] bg-white border-gray-300 text-gray-800 focus:border-gray-400 focus:ring-gray-400">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rollNo">Roll No</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="score">Score</SelectItem>
                    <SelectItem value="rollNoAndStatus">Roll No & Status</SelectItem>
                    <SelectItem value="violations">Violations</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="ml-2 h-10 w-10"
                >
                  <ArrowUpDown className={`h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Students per page</label>
              <Select onValueChange={(value) => handleStudentsPerPageChange(Number(value))} defaultValue={studentsPerPage.toString()}>
                <SelectTrigger className="w-full md:w-[170px] bg-white border-gray-300 text-gray-800 focus:border-gray-400 focus:ring-gray-400">
                  <SelectValue placeholder="Students per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="text-gray-700">Roll No</TableHead>
              <TableHead className="text-gray-700">Name</TableHead>
              <TableHead className="text-gray-700">Violations</TableHead>
              <TableHead className="text-gray-700">Status</TableHead>
              <TableHead className="text-gray-700">Score</TableHead>
              <TableHead className="text-gray-700">IP</TableHead> {/* New IP column header */}
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  <p className="mt-2">Loading student data...</p>
                </TableCell>
              </TableRow>
            ) : currentStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  <p>No students found</p>
                </TableCell>
              </TableRow>
            ) : (
              currentStudents.map((student) => (
                <TableRow key={student.rollNo} className="hover:bg-gray-100">
                  <TableCell className="text-gray-800">{student.rollNo}</TableCell>
                  <TableCell className="text-gray-800">{student.name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.violations > 0 
                        ? 'bg-red-200 text-red-800'
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {student.violations || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.status === "In Progress"
                        ? "bg-blue-200 text-blue-800"
                        : student.status === "Completed"
                        ? "bg-green-200 text-green-800"
                        : "bg-gray-200 text-gray-800"
                    }`}>
                      {student.status}
                    </span>
                  </TableCell>
                    <TableCell className="text-gray-800">
                    {student.score !== null ? (student.score*10).toFixed(1) : '-'} / 100
                    </TableCell>
                  <TableCell>
                    {(student.ipChange || ipCounts[student.ip] > 1) ? (
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-red-200 text-red-800 opacity-75 rounded">
                        {student.ip}
                      </span>
                    ) : (
                      <span className="text-gray-800">{student.ip}</span>
                    )}
                  </TableCell> {/* Modified IP table cell with badge */}
                  <TableCell className="text-center">
                    <motion.button
                      onClick={() => handleViewStudent(student)}
                      disabled={student.status === 'Not Started'}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={`px-4 py-2 rounded ${
                        student.status !== "Not Started" 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                      }`}
                    >
                      View
                    </motion.button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>      </div>

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {totalPages <= 7 ? (
              // If we have 7 or fewer pages, show all page numbers
              [...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index + 1}>
                  <PaginationLink 
                    onClick={() => setCurrentPage(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))
            ) : (
              // Otherwise use a more complex pagination with ellipsis
              <>
                {/* Always show the first page */}
                <PaginationItem>
                  <PaginationLink 
                    onClick={() => setCurrentPage(1)}
                    isActive={currentPage === 1}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                
                {/* Show ellipsis if current page is beyond 3 */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {/* Show current page with neighbors */}
                {currentPage > 2 && currentPage < totalPages - 1 && (
                  <>
                    {currentPage > 2 && (
                      <PaginationItem>
                        <PaginationLink 
                          onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          {currentPage - 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                    
                    <PaginationItem>
                      <PaginationLink 
                        onClick={() => setCurrentPage(currentPage)}
                        isActive
                      >
                        {currentPage}
                      </PaginationLink>
                    </PaginationItem>
                    
                    {currentPage < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationLink 
                          onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          {currentPage + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )}
                  </>
                )}
                
                {/* Show ellipsis if current page is not close to the last page */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                {/* Always show the last page */}
                <PaginationItem>
                  <PaginationLink 
                    onClick={() => setCurrentPage(totalPages)}
                    isActive={currentPage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      
      {/* Analytics Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold mb-4">Submission & Score Stats</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 px-2">
            <DonutChart 
              data={submissionData} 
              label="Submission Status"
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center"
            />
            <DonutChart 
              data={scoreData} 
              label="Score Ranges"
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Modal */}
      {isViewLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-center mt-4">Loading...</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}