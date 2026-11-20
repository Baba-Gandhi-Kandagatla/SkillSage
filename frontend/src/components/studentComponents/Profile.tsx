import {
  changeStudentPassword,
  getStudentDetails,
} from "@/Communicators/apiCommunications";
import {
  uploadStudentResume,
  getStudentResume,
} from "@/Communicators/studentCommunications";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Eye, EyeOff, Upload, Loader } from "lucide-react";
import { useEffect, useState } from "react";

export function ProfileSection() {
  const [file, setFile] = useState<File | null>(null);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [retypeNewPassword, setRetypeNewPassword] = useState("");
  const [newPasswordMismatch, setNewPasswordMismatch] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [resume, setResume] = useState<string | null>(null);
  const [resumeContext, setResumeContext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showVerificationInfo, setShowVerificationInfo] = useState(false);

  const loadingMessages = [
    "Uploading resume...",
    "Processing document...",
    "Extracting information...",
    "Analyzing content...",
    "Almost there..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setCurrentMessageIndex((prev) => 
          prev < loadingMessages.length - 1 ? prev + 1 : prev
        );
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setCurrentMessageIndex(0);
    };
  }, [loading]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.toLowerCase().endsWith('.docx')) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      if (selectedFile.name.toLowerCase().endsWith('.docx')) {
        setFile(selectedFile);
      }
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== retypeNewPassword) {
      setNewPasswordMismatch(true);
      setTimeout(() => setNewPasswordMismatch(false), 3000);
      return;
    }
    try {
      await changeStudentPassword(oldPassword, newPassword);
      setPasswordChanged(true);
      setTimeout(() => setPasswordChanged(false), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
    }
  };

  const LoadingOverlay = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <motion.div
            className="absolute inset-0 border-4 border-gray-300 rounded-full"
            style={{ borderTopColor: '#1a1a1a' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <div className="h-[2rem] flex items-center justify-center">
          <motion.p 
            key={loadingMessages[currentMessageIndex]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-lg font-semibold text-gray-800 text-center absolute"
          >
            {loadingMessages[currentMessageIndex]}
          </motion.p>
        </div>
        <p className="text-sm text-gray-600">Please wait while we process your file</p>
      </div>
    </motion.div>
  );

  const handleResumeUpload = async () => {
    if (!file) return;
    
    // Show verification info immediately
    setShowVerificationInfo(true);
    setUploadSuccess(true);
    
    // Continue with upload in background
    const formData = new FormData();
    formData.append("resume", file);
    try {
      await uploadStudentResume(formData);
      // No need to reload the page or show loading spinner
    } catch (error) {
      console.error("Error uploading resume:", error);
      setUploadError(true);
      setTimeout(() => {
        setUploadError(false);
      }, 3000);
    }
  };

  useEffect(() => {
    getStudentDetails()
      .then((user) => {
        setProfileData({
          name: user.username,
          roll_number: user.roll_number,
          year: user.year,
          college: user.College.name,
          semester: user.semester,
          department: user.Department.name,
          section: user.section,
        });
      })
      .catch((error) => {
        console.error("Error fetching student details:", error);
      });

    getStudentResume()
      .then((response) => {
        if (response.resume) {
          setResume(response.resume);
          setResumeContext(response.resume_context);
        }
      })
      .catch((error) => {
        console.error("Error fetching resume:", error);
      });
  }, []);

  const handleResumeClick = () => {
    if (resume && profileData?.roll_number) {
      const byteCharacters = atob(resume);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${profileData.roll_number}.docx`;
      a.target = "_blank";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      <div className="flex items-center justify-center p-6 min-h-screen text-black pt-20">
        <motion.div className="w-full max-w-4xl">
          <Card className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-300">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="p-6 space-y-4 bg-white"
                >
                  <Avatar className="w-32 h-32 mx-auto ring-4 ring-slate-400/20 shadow-lg">
                    <AvatarImage src="/OWL.png" alt="Profile picture" />
                  </Avatar>
                  <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-black">
                      {profileData?.name || "Loading..."}
                    </h2>
                  </div>
                  <div className="space-y-2 bg-gray-100 p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                    <p className="text-slate-950">
                        <strong>Name:</strong> {profileData?.name || "Loading..."}
                      </p>
                      <p className="text-slate-950">
                        <strong>Roll Number:</strong>{" "}
                        {profileData?.roll_number || "Loading..."}
                      </p>
                      <p className="text-slate-950">
                        <strong>College:</strong>{" "}
                        {profileData?.college || "Loading..."}
                      </p>
                      <p className="text-slate-950">
                        <strong>Year:</strong> {profileData?.year || "Loading..."}
                      </p>
                      <p className="text-slate-950">
                        <strong>Semester:</strong>{" "}
                        {profileData?.semester || "Loading..."}
                      </p>
                      <p className="text-slate-950">
                        <strong>Department:</strong>{" "}
                        {profileData?.department || "Loading..."}
                      </p>
                  </div>
                  {resume && (
                    <div className="space-y-2 bg-gray-100 p-4 rounded-lg shadow-md transition-transform transform hover:scale-105">
                      <h3 className="font-semibold text-slate-900">Resume</h3>
                      <button
                        onClick={handleResumeClick}
                        className="bg-slate-900 hover:bg-slate-600/60 text-slate-100 px-4 py-2 rounded-lg transition-all duration-300"
                      >
                        Open Resume
                      </button>
                      {resumeContext && (
                        <div className="mt-4 text-slate-700">
                          <h4 className="font-semibold">Resume Summary:</h4>
                          <p>{resumeContext}</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
                <div className="p-6 space-y-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <CardHeader className="px-0">
                      <CardTitle className="text-slate-900">
                        Change Password
                      </CardTitle>
                    </CardHeader>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="old-password" className="text-black font-semibold">
                          Old Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="old-password"
                            type={showOldPassword ? "text" : "password"}
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-900"
                          >
                            {showOldPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-slate-900">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-900"
                          >
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="retype-new-password"
                          className="text-slate-900"
                        >
                          Retype New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="retype-new-password"
                            type={showNewPassword ? "text" : "password"}
                            required
                            value={retypeNewPassword}
                            onChange={(e) => setRetypeNewPassword(e.target.value)}
                            className="bg-white border-gray-300 text-gray-800 placeholder-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-900"
                          >
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>
                      </div>
                      <AnimatePresence>
                        {newPasswordMismatch && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-400 flex items-center gap-2"
                          >
                            <Check size={16} />
                            New passwords do not match!
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {passwordChanged && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-green-400 flex items-center gap-2"
                          >
                            <Check size={16} />
                            Password changed successfully!
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <Button
                        type="submit"
                        className="w-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg transition-transform transform hover:scale-105"
                      >
                        Change Password
                      </Button>
                    </form>
                  </motion.div>
                  {/* <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                      <CardTitle className="text-slate-900">
                        Upload Your Resume
                      </CardTitle>
                    <CardHeader className="px-0">
                    </CardHeader>
                    
                    {showVerificationInfo && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 bg-blue-100 text-blue-800 rounded-lg border border-blue-200"
                      >
                        <p className="text-sm">
                          <strong>Note:</strong> Your resume has been submitted for verification. 
                          Once approved, it will be visible to potential employers. This process may take a few minutes.
                        </p>
                      </motion.div>
                    )}
                    
                    <div className="flex items-center justify-center w-full">
                      <Label
                        htmlFor="dropzone-file"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="flex flex-col items-center justify-center w-full h-64  rounded-lg cursor-pointer bg-gray-900/40 hover:bg-slate-800/60 transition-colors duration-300"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-10 h-10 mb-3 text-slate-700" />
                          <p className="mb-2 text-sm text-slate-800">
                            <span className="font-semibold">Click to upload</span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-slate-900">
                            DOCX (MAX. 5MB)
                          </p>
                        </div>
                        <Input
                          id="dropzone-file"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".docx"
                        />
                      </Label>
                    </div>
                    <AnimatePresence>
                      {file && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 text-sm text-slate-300 flex items-center gap-2"
                        >
                          <Check size={16} className="text-green-400" />
                          File selected: {file.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                    <Button
                      className="w-full mt-4 bg-slate-900 hover:bg-slate-600/60 text-slate-100 border border-slate-500 transition-all duration-300"
                      disabled={!file || loading}
                      onClick={handleResumeUpload}
                    >
                      Upload Resume
                    </Button>
                    <AnimatePresence>
                      {uploadSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-green-400 flex items-center gap-2"
                        >
                          <Check size={16} />
                          Resume submitted for verification!
                        </motion.div>
                      )}
                      {uploadError && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-red-400 flex items-center gap-2"
                        >
                          <Check size={16} />
                          Error uploading resume!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div> */}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
