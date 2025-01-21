import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import ShadCN components
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { getAllDepartments } from "@/Communicators/apiCommunications"; // Import the method

interface Student {
  roll_number: string;
  username: string;
  year: string;
  department_name: string;
  department_id: number;
}

interface AddStudentFormProps {
  newStudent: Omit<Student, 'id'>;
  setNewStudent: React.Dispatch<React.SetStateAction<Omit<Student, 'id'>>>;
  handleAddStudent: (e: React.FormEvent) => void;
  setShowAddForm: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddStudentForm: React.FC<AddStudentFormProps> = ({ newStudent, setNewStudent, handleAddStudent, setShowAddForm }) => {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getAllDepartments();
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <motion.form
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      onSubmit={handleAddStudent}
      className="mb-6 p-4 bg-white rounded-md shadow-md"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input
          type="text"
          placeholder="Roll Number"
          value={newStudent.roll_number}
          onChange={(e) => setNewStudent({ ...newStudent, roll_number: e.target.value.toUpperCase() })}
          required
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400"
        />
        <Input
          type="text"
          placeholder="Name"
          value={newStudent.username}
          onChange={(e) => setNewStudent({ ...newStudent, username: e.target.value })}
          required
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400"
        />
        <Select
          value={newStudent.department_name}
          onValueChange={(value) => setNewStudent({ ...newStudent, department_name: value })}
          required
        >
          <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Year"
          value={newStudent.year}
          onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
          required
          disabled
          className="bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-400 focus:border-gray-400 focus:ring-gray-400"
        />
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <Button type="submit" className="bg-gray-800 text-white hover:bg-gray-700">Add Student</Button>
        <Button variant="outline" onClick={() => setShowAddForm(false)} className="text-gray-800 border-gray-800 hover:bg-gray-100">Cancel</Button>
      </div>
    </motion.form>
  );
};

export default AddStudentForm;








