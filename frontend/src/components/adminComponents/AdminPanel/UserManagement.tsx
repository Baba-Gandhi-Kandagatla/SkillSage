import { getDefaultPassword, changeAdminPassword, setDefaultPasswordStudent, resetStudentPassword } from "@/Communicators/apiCommunications";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import { AnimatePresence, motion } from "framer-motion";
import {
    Eye,
    EyeOff,
    Save
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReactDOM from 'react-dom';

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } },
};

const AnimatedButton = motion(Button);

export const UserManagement = () => {
    // Add state declarations
    const [defaultPassword, setDefaultPassword] = useState("");
    const [newDefaultPassword, setNewDefaultPassword] = useState("");
    const [isDefaultPasswordVisible, setIsDefaultPasswordVisible] = useState(false);

    const [oldAdminPassword, setOldAdminPassword] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [isAdminPasswordMatch, setIsAdminPasswordMatch] = useState(false);

    const [rollNumber, setRollNumber] = useState("");
    const [, setIsResetting] = useState(false);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);

    // Add useEffect for admin password match
    useEffect(() => {
        setIsAdminPasswordMatch(
            oldAdminPassword !== "" && newAdminPassword !== ""
        );
    }, [oldAdminPassword, newAdminPassword]);

    // Add useEffect to fetch default password
    useEffect(() => {
        const fetchDefaultPassword = async () => {
            try {
                const defaultPwd = await getDefaultPassword();
                setDefaultPassword(defaultPwd);
            } catch (error) {
                // Handle error
            }
        };

        fetchDefaultPassword();
    }, []);

    // Add functions
    const handleResetPassword = useCallback(() => {
        setIsResetting(true);
        setTimeout(() => {
            setIsResetting(false);
            setRollNumber("");
        }, 2000);
    }, [rollNumber]);

    const handleDefaultPasswordSave = useCallback(async () => {
        setIsWarningModalOpen(false);
        try {
            await setDefaultPasswordStudent(newDefaultPassword);
            setNewDefaultPassword("");
            // Optionally, update the default password state if needed
        } catch (error) {
            // Handle error if needed
            toast.error("dk shit debugger neeed bruh ");
        }
    }, [newDefaultPassword]);

    const handleAdminPasswordReset = useCallback(async () => {
        try {
            await changeAdminPassword(oldAdminPassword, newAdminPassword);
            setOldAdminPassword("");
            setNewAdminPassword("");
        } catch (error) {
            // Handle error if needed
        }
    }, [oldAdminPassword, newAdminPassword]);

    const handleResetStudentPassword = useCallback(async () => {
        try {
            await resetStudentPassword(rollNumber);
            setRollNumber("");
        } catch (error) {
        }
    }, [rollNumber]);

    return(
        <TabsContent value="user-management" className="">
          {/* Set Default Password Card */}
          <Card className="shadow-md mb-6">
            <CardHeader>
              <CardTitle>Set Default Password</CardTitle>
              <CardDescription>
                Set the default password for students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Display existing default password with eye icon */}
                <div className="space-y-2">
                  <Label htmlFor="existing-default-password">
                    Existing Default Password
                  </Label>
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-2">
                    <Input
                      id="existing-default-password"
                      type={isDefaultPasswordVisible ? "text" : "password"}
                      value={defaultPassword}
                      readOnly
                      className="flex-grow"
                    />
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setIsDefaultPasswordVisible(!isDefaultPasswordVisible)
                      }
                    >
                      {isDefaultPasswordVisible ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-password">New Default Password</Label>
                  <Input
                    id="default-password"
                    type="password"
                    value={newDefaultPassword}
                    onChange={(e) => setNewDefaultPassword(e.target.value)}
                    placeholder="Enter new default password"
                  />
                </div>
                <AnimatedButton
                  onClick={() => setIsWarningModalOpen(true)}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={newDefaultPassword === ""}
                  className="bg-gray-800 text-white hover:bg-gray-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Default Password
                </AnimatedButton>

                {/* Warning Modal */}
                {ReactDOM.createPortal(
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
                                    <h2 className="text-gray-800 font-semibold mb-4">
                                        Attention
                                    </h2>
                                    <p className="text-gray-800 mb-4">
                                        This will change the passwords of all students. Are
                                        you sure you want to proceed?
                                    </p>
                                    <div className="flex justify-end space-x-2">
                                        <Button onClick={() => setIsWarningModalOpen(false)}>
                                            No
                                        </Button>
                                        <Button
                                            onClick={handleDefaultPasswordSave}
                                            className="bg-slate-700 hover:bg-slate-950 text-white"
                                        >
                                            Yes
                                        </Button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reset Admin Password Card */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Reset Admin Password</CardTitle>
              <CardDescription>
                Reset the admin account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="old-admin-password">Old Admin Password</Label>
                  <Input
                    id="old-admin-password"
                    type="password"
                    value={oldAdminPassword}
                    onChange={(e) => setOldAdminPassword(e.target.value)}
                    placeholder="Enter old admin password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-admin-password">New Admin Password</Label>
                  <Input
                    id="new-admin-password"
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Enter new admin password"
                  />
                </div>
                <AnimatedButton
                  onClick={handleAdminPasswordReset}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={!isAdminPasswordMatch}
                  className={`bg-gray-800 text-white hover:bg-gray-700 ${
                    !isAdminPasswordMatch ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Reset Admin Password
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>

          {/* Add new card for resetting student password */}
          <Card className="shadow-md mt-6">
            <CardHeader>
              <CardTitle>Reset Student Password</CardTitle>
              <CardDescription>
                Reset a student's password by roll number
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roll-number">Roll Number</Label>
                  <Input
                    id="roll-number"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="Enter roll number"
                  />
                </div>
                <AnimatedButton
                  onClick={handleResetStudentPassword}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={rollNumber === ""}
                  className="bg-gray-800 text-white hover:bg-gray-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Reset Password
                </AnimatedButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
    )
}