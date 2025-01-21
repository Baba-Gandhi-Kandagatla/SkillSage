import {
  addDepartment,
  deleteDepartment,
  getAllDepartments,
} from "@/Communicators/apiCommunications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactDOM from 'react-dom';

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } },
};

const AnimatedButton = motion(Button);

export const Departments = () => {
  const [departments, setDepartments] = useState<string[]>([]);


  // Add state variables for the modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState("");
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addDepartmentName, setAddDepartmentName] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const deptData = await getAllDepartments();
        setDepartments(deptData.map((dept) => dept.name));
      } catch (error) {
        // Handle error
      }
    };
    fetchDepartments();
  }, []);

  const handleAddDepartment = useCallback(async () => {
    if (addDepartmentName && !departments.includes(addDepartmentName)) {
      try {
        await addDepartment(addDepartmentName);
        setDepartments([...departments, addDepartmentName]);
        toast.success(`Department "${addDepartmentName}" added successfully.`);
      } catch (error) {
        toast.error("Failed to add department.");
      } finally {
        setIsAddModalOpen(false);
        setAddDepartmentName("");
      }
    }
  }, [addDepartmentName, departments]);

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddDepartmentName("");
  };

  const handleRemoveDepartment = useCallback((dept: string) => {
    setIsDeleteModalOpen(true);
    setDepartmentToDelete(dept);
  }, []);

  const confirmDeleteDepartment = async () => {
    try {
      await deleteDepartment(departmentToDelete);
      setDepartments((prevDepartments) =>
        prevDepartments.filter((d) => d !== departmentToDelete)
      );
      toast.success(`Department "${departmentToDelete}" deleted successfully.`);
    } catch (error: any) {
      toast.error("Failed to delete department.");
    } finally {
      setIsDeleteModalOpen(false);
      setDepartmentToDelete("");
      setDeleteConfirmationText("");
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDepartmentToDelete("");
    setDeleteConfirmationText("");
  };

  return (
    <>
      <TabsContent value="departments-sections">
        <Card className="shadow-md">
          <div className="flex items-center justify-between ">
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>Manage departments</CardDescription>
            </CardHeader>
            <div className="p-4 flex flex-col justify-center  gap-2">
              <Label htmlFor="new-department">Add Department</Label>
              <div className="flex space-x-2 ">
                <AnimatedButton
                  onClick={() => setIsAddModalOpen(true)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className="bg-gray-800 w-full text-white hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </AnimatedButton>
              </div>
            </div>
          </div>
          <CardContent>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Existing Departments</Label>
                <div className="space-y-2">
                  {departments.map((dept) => (
                    <motion.div
                      key={dept}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="flex items-center justify-between bg-gray-100 p-2 rounded"
                    >
                      <span>{dept}</span>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveDepartment(dept)}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Trash2 className="w-4 h-4" />
                      </AnimatedButton>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      {ReactDOM.createPortal(
        <AnimatePresence>
          {isDeleteModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center"
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
                  Please type <strong>'delete'</strong> to confirm the deletion of
                  the department "{departmentToDelete}".
                </p>
                <Input
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type 'delete' to confirm"
                  className="mb-4"
                />
                <div className="flex justify-end space-x-2">
                  <Button onClick={closeDeleteModal}>Cancel</Button>
                  <Button
                    onClick={confirmDeleteDepartment}
                    disabled={deleteConfirmationText !== "delete"}
                    className={`bg-red-800 hover:bg-red-700 text-white ${
                      deleteConfirmationText !== "delete"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    Delete
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
      {ReactDOM.createPortal(
        <AnimatePresence>
          {isAddModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-slate-100 px-8 py-6 rounded-lg shadow-xl z-10"
              >
                <h2 className="text-gray-800 font-semibold mb-4">
                  Add Department
                </h2>
                <Input
                  value={addDepartmentName}
                  onChange={(e) => setAddDepartmentName(e.target.value)}
                  placeholder="Enter department name"
                  className="mb-4 w-[320px]"
                />
                <div className="flex justify-end space-x-2">
                  <Button onClick={closeAddModal}>Cancel</Button>
                  <Button
                    onClick={handleAddDepartment}
                    disabled={!addDepartmentName}
                    className={`bg-gray-800 hover:bg-gray-700 text-white ${
                      !addDepartmentName ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    Proceed
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
