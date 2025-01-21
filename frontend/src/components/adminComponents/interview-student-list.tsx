import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from 'framer-motion';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

interface Student {
  rollNo: string;
  name: string;
  ipAddress: string;
  status: 'Completed' | 'In Progress';
  score: number | null;
}

const mockStudents: Student[] = Array.from({ length: 100 }, (_, i) => ({
  rollNo: `${i + 1}`.padStart(3, '0'),
  name: `Student ${i + 1}`,
  ipAddress: `192.168.1.${i + 1}`,
  status: i % 2 === 0 ? 'Completed' : 'In Progress',
  score: i % 2 === 0 ? Math.floor(Math.random() * 100) : null,
}));

interface InterviewStudentListProps {
  interviewName: string;
}

export default function InterviewStudentList({ interviewName }: InterviewStudentListProps) {
  console.log(interviewName);
  const navigate = useNavigate();
  const location = useLocation();
  const { interview } = location.state || { interview: null };

  const [students] = useState<Student[]>(mockStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rollNo' | 'name' | 'score' | 'rollNoAndStatus'>('rollNo');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage, setStudentsPerPage] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);

  useEffect(() => {
    // Simulating API call to fetch students
    // In a real application, you would fetch data from an API here
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (value: 'rollNo' | 'name' | 'score' | 'rollNoAndStatus') => {
    setSortBy(value);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      // Simulate data refresh
      console.log('Refreshing student list...');
      setIsRefreshing(false);
    }, 2000);
  };

  const handleStudentsPerPageChange = (value: number) => {
    setStudentsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing students per page
  };

  const handleViewStudent = (student: Student) => {
    setIsViewLoading(true);
    setTimeout(() => {
      setIsViewLoading(false);
      // Additional actions can be added here
    }, 2000);
    navigate('/view-analysis', { state: { student } });
  };

  const handleDownload = () => {
    const csvContent = [
      ['Roll No', 'Name', 'IP Address', 'Status', 'Score'],
      ...students.map(student => [
        student.rollNo,
        student.name,
        student.ipAddress,
        student.status,
        student.score !== null ? student.score.toString() : '',
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
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'rollNo':
        return a.rollNo.localeCompare(b.rollNo);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'score':
        return (b.score || 0) - (a.score || 0);
      case 'rollNoAndStatus':
        if (a.status === b.status) {
          return a.rollNo.localeCompare(b.rollNo);
        }
        return a.status === 'In Progress' ? -1 : 1;
      default:
        return 0;
    }
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
        <div className="flex flex-row justify-between items-center mb-6  ">
          <div className="flex justify-between gap-x-7">
          <div>
            <h2 className="text-2xl font-bold">{interview.name}</h2>
            <p className="text-md text-gray-600">
              <strong>Subject:</strong> {interview.subject} - <strong>Topic:</strong> {interview.topic}
            </p>
          </div>
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
          </div>
          <motion.div
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <Button
              onClick={handleDownload}
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              Download Student Data
            </Button>
          </motion.div>
        </div>
      )}

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
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
            <Select onValueChange={(value) => handleSort(value as 'rollNo' | 'name' | 'score' | 'rollNoAndStatus')} defaultValue={sortBy}>
              <SelectTrigger className="w-full md:w-[200px] bg-white border-gray-300 text-gray-800 focus:border-gray-400 focus:ring-gray-400">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rollNo">Roll No</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="rollNoAndStatus">Roll No & Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Students per page</label>
            <Select onValueChange={(value) => handleStudentsPerPageChange(Number(value))} defaultValue={studentsPerPage.toString()}>
              <SelectTrigger className="w-full md:w-[200px] bg-white border-gray-300 text-gray-800 focus:border-gray-400 focus:ring-gray-400">
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

      <div className="bg-white rounded-lg shadow-md overflow-auto">
        <Table className="min-h-[400px]">
          <TableHeader>
            <TableRow className="bg-gray-200">
              <TableHead className="text-gray-700">Roll No</TableHead>
              <TableHead className="text-gray-700">Name</TableHead>
              <TableHead className="text-gray-700">IP Address</TableHead>
              <TableHead className="text-gray-700">Status</TableHead>
              <TableHead className="text-gray-700">Score</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStudents.map((student) => (
              <TableRow key={student.rollNo} className="hover:bg-gray-100">
                <TableCell className="text-gray-800">{student.rollNo}</TableCell>
                <TableCell className="text-gray-800">{student.name}</TableCell>
                <TableCell className="text-gray-800">{student.ipAddress}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      student.status === "In Progress"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-green-200 text-green-800"
                    }`}
                  >
                    {student.status}
                  </span>
                </TableCell>
                <TableCell className="text-gray-800">{student.score !== null ? student.score : '-'}</TableCell>
                <TableCell className="text-center">
                  <motion.button
                    onClick={() => handleViewStudent(student)}
                    disabled={student.status !== 'Completed'}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`px-4 py-2 rounded ${
                      student.status === 'Completed' 
                        ? 'bg-gray-800 text-white' 
                        : 'bg-gray-300 text-gray-700 cursor-not-allowed'
                    }`}
                  >
                    View
                  </motion.button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end items-center mt-4 space-x-2"> {/* Changed justify-center to justify-end */}
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-800 text-white hover:bg-gray-700"
        >
          Previous
        </Button>
        {[...Array(totalPages)].map((_, index) => (
          <Button
            key={index + 1}
            onClick={() => setCurrentPage(index + 1)}
            className={`${
              currentPage === index + 1 ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'
            } hover:bg-gray-300`}
          >
            {index + 1}
          </Button>
        ))}
        <Button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="bg-gray-800 text-white hover:bg-gray-700"
        >
          Next
        </Button>
      </div>

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