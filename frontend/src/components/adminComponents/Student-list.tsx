import {
  addStudent,
  addStudents,
  deleteAllStudents,
  deleteStudent,
  getDepartment as fetchDepartment,
  getAllStudents,
} from "@/Communicators/apiCommunications";
import { Button } from "@/components/ui/button";
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
  ChevronLeft,
  ChevronRight,
  MinusCircleIcon,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddStudentForm from "./AddStudentForm";

interface Student {
  roll_number: string;
  username: string;
  year: string;
  department_name: string;
  department_id: number;
}

export default function AdminStudentManagement() {
  const navigate = useNavigate();
  const { year } = useParams<{ year: string }>();

  useEffect(() => {
    if (parseInt(year || "0") > 4) {
      navigate("/admin/student-list/4", { replace: true });
      return;
    }
    setNewStudent((prevStudent) => ({
      ...prevStudent,
      year: year || "",
    }));
  }, [year, navigate]);

  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [studentsPerPage, setStudentsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isWarningDelete, setIsWarningDelete] = useState("");
  const [newStudent, setNewStudent] = useState<Omit<Student, "id">>({
    roll_number: "",
    username: "",
    year: year || "",
    department_name: "",
    department_id: 0,
  });

  useEffect(() => {
    setIsWarningModalOpen(false);
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const studentsData = await getAllStudents(year || "");
        const studentsWithDepartment = await Promise.all(
          await studentsData.map(async (student: { department_id: BigInt }) => {
            const department_name = await getDepartment(student.department_id);
            return { ...student, department_name };
          })
        );
        setStudents(studentsWithDepartment);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setIsLoading(false);
        // window.location.reload();
      }
    };

    fetchStudents();
  }, [year]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleDelete = (id: string) => {
    setStudents(students.filter((student) => student.roll_number !== id));
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    await addStudent(
      newStudent.roll_number,
      newStudent.username,
      newStudent.department_name,
      Number(newStudent.year)
    );
    setStudents([...students, { ...newStudent }]);
    setNewStudent({
      roll_number: "",
      username: "",
      year: year || "",
      department_name: "",
      department_id: 0,
    });
    setShowAddForm(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.name.split(".").pop()?.toLowerCase();
      if (!["csv", "xlsx"].includes(fileType || "")) {
        alert("Please upload only CSV or XLSX files");
        return;
      }

      const formData = new FormData();
      formData.append("studentsFile", file);
      formData.append("year", year || "");
      try {
        await addStudents(formData);
        const studentsData = await getAllStudents(year || "");
        const studentsWithDepartment = await Promise.all(
          await studentsData.map(async (student: { department_id: BigInt }) => {
            const department_name = await getDepartment(student.department_id);
            return { ...student, department_name };
          })
        );
        console.log(studentsData);
        setStudents(studentsWithDepartment);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
    e.target.value = ""; // Reset the input value
  };

  const deleteStudents = async (year: number) => {
    // console.log(`Deleting all students of ${year} year`)
    await deleteAllStudents(year);
    setStudents([]);
    setIsWarningModalOpen(false);
  };

  const deleteOneStudent = async (roll_number: string) => {
    // console.log(`Deleting student with roll number: ${roll_number}`)
    await deleteStudent(roll_number);
    handleDelete(roll_number);
    setIsWarningDelete("");
  };

  const filteredStudents = students.filter((student) =>
    student.roll_number.includes(searchTerm)
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  const pageNumbers = [];
  for (
    let i = 1;
    i <= Math.ceil(filteredStudents.length / studentsPerPage);
    i++
  ) {
    pageNumbers.push(i);
  }

  const getDepartment = async (department_id: BigInt): Promise<string> => {
    try {
      const departmentName = await fetchDepartment(department_id);
      return departmentName; // This should return the department name string
    } catch (error) {
      console.error("Error fetching department:", error);
      return "Unknown Department";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto p-6 min-h-screen text-gray-800 pt-20"
    >
      <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center md:text-left">
        Student Management for {year}
        {year === "2" ? "nd" : year === "3" ? "rd" : "th"} year
      </h1>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <Input
            type="text"
            placeholder="Search by Roll Number"
            value={searchTerm}
            onChange={handleSearch}
            className="mr-2 bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400"
          />
          <Search className="text-gray-400" />
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setIsWarningModalOpen(true)}
            className="bg-red-800 text-white hover:bg-red-700"
          >
            <MinusCircleIcon className="mr-2 h-4 w-4" />
            Delete All
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gray-800 text-white hover:bg-gray-700"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
          <Button className="bg-gray-800 text-white hover:bg-gray-700 relative overflow-hidden">
            <Upload className="mr-2 h-4 w-4" /> Upload CSV
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {isWarningModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-100 p-6 rounded-lg shadow-xl z-10"
            >
              <h2 className="text-gray-800 font-semibold mb-4">Attention</h2>
              <p className="text-gray-800 mb-4">
                This will remove all students of {year} year from database. Are
                you sure you want to proceed?
              </p>
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsWarningModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => deleteStudents(Number(year))}
                  className="bg-red-800 hover:bg-slate-950 text-white"
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddForm && (
          <AddStudentForm
            newStudent={newStudent}
            setNewStudent={setNewStudent}
            handleAddStudent={handleAddStudent}
            setShowAddForm={setShowAddForm}
          />
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-800"></div>
        </div>
      ) : (
        <div
          className="bg-white rounded-lg shadow-md overflow-hidden"
          style={{ height: "60vh" }}
        >
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200">
                  <TableHead className="text-gray-700 text-center">
                    Roll Number
                  </TableHead>
                  <TableHead className="text-gray-700 text-center ">
                    Name
                  </TableHead>
                  <TableHead className="text-gray-700 text-center ">
                    Branch
                  </TableHead>
                  <TableHead className="text-gray-700 text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {currentStudents.map((student) => (
                    <motion.tr
                      key={student.roll_number}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="hover:bg-gray-100"
                    >
                      <TableCell className="text-gray-800 text-center">
                        {student.roll_number}
                      </TableCell>
                      <TableCell className="text-gray-800 text-center">
                        {student.username}
                      </TableCell>
                      <TableCell className="text-gray-800 text-center">
                        {student.department_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center items-start space-x-2">
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setIsWarningDelete(student.roll_number)
                            }
                            className="p-0 h-8 w-8 rounded-full"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>

                          <Button
                            onClick={() =>
                              navigate(
                                `/admin/view-student/${student.roll_number}`
                              )
                            }
                            className="bg-gray-800 text-white hover:bg-gray-700 px-3 py-1 rounded h-8"
                          >
                            View
                          </Button>
                        </div>
                        <AnimatePresence>
                          {isWarningDelete && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-50 flex items-center justify-center"
                            >
                              <div className="absolute inset-0 bg-black opacity-30"></div>
                              <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-slate-100 p-6 rounded-lg shadow-xl z-10"
                              >
                                <h2 className="text-gray-800 font-semibold mb-4 text-xl">
                                  Attention
                                </h2>
                                <p
                                  className="text-gray-800 mb-4 "
                                  style={{ fontSize: "18px" }}
                                >
                                  This will remove the data for student bearing
                                  roll number: <b>{isWarningDelete}</b> <br />
                                  Are you sure you want to proceed?
                                </p>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    onClick={() => setIsWarningDelete("")}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() =>
                                      deleteOneStudent(isWarningDelete)
                                    }
                                    className="bg-red-800 hover:bg-slate-950 text-white"
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-col md:flex-row justify-between items-center">
        <Select
          value={studentsPerPage.toString()}
          onValueChange={(value) => {
            setStudentsPerPage(Number(value));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-white border-gray-300 text-gray-800 focus:border-gray-400 focus:ring-gray-400">
            <SelectValue placeholder="Results per page" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 text-gray-800">
            <SelectItem value="25" className="focus:bg-gray-100">
              25 per page
            </SelectItem>
            <SelectItem value="50" className="focus:bg-gray-100">
              50 per page
            </SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button
            onClick={() =>
              setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
            }
            disabled={currentPage === 1}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {pageNumbers.map((number) => (
            <Button
              key={number}
              onClick={() => setCurrentPage(number)}
              variant={currentPage === number ? "default" : "outline"}
              className={
                currentPage === number
                  ? "bg-gray-800 text-white"
                  : "text-gray-800 border-gray-300 hover:bg-gray-100"
              }
            >
              {number}
            </Button>
          ))}
          <Button
            onClick={() =>
              setCurrentPage(
                currentPage < pageNumbers.length
                  ? currentPage + 1
                  : pageNumbers.length
              )
            }
            disabled={currentPage === pageNumbers.length}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
