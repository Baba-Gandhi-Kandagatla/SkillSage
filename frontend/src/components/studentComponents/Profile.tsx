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
import { Check, Eye, EyeOff, Upload } from "lucide-react";
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
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

  const handleResumeUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    try {
      await uploadStudentResume(formData);
      setUploadSuccess(true);
      window.location.reload();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading resume:", error);
      setUploadError(true);
      setTimeout(() => setUploadError(false), 3000);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-20 pb-5">
      <motion.div className="w-full max-w-4xl">
        <Card className="backdrop-blur-lg bg-gray-800/70 shadow-xl rounded-xl overflow-hidden border-2 border-slate-600/80 ">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="p-6 space-y-4 bg-gradient-to-br from-slate-800/60 to-gray-700/60"
              >
                <Avatar className="w-32 h-32 mx-auto ring-4 ring-slate-400/20 shadow-lg">
                  <AvatarImage src="/avatar.png" alt="Profile picture" />
                  {/* <AvatarFallback>nice</AvatarFallback> */}
                </Avatar>
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold text-slate-100">
                    {profileData?.name || "Loading..."}
                  </h2>
                  {/* <p className="text-slate-300">Software Engineer</p> */}
                </div>
                <div className="space-y-2 bg-slate-800/40 p-4 rounded-lg backdrop-blur-sm">
                  <div className="space-y-2 bg-slate-800/40 p-4 rounded-lg backdrop-blur-sm">
                    <p className="text-slate-200">
                      <strong>Name:</strong> {profileData?.name || "Loading..."}
                    </p>
                    <p className="text-slate-200">
                      <strong>Roll Number:</strong>{" "}
                      {profileData?.roll_number || "Loading..."}
                    </p>
                    <p className="text-slate-200">
                      <strong>College:</strong>{" "}
                      {profileData?.college || "Loading..."}
                    </p>
                    <p className="text-slate-200">
                      <strong>Year:</strong> {profileData?.year || "Loading..."}
                    </p>
                    <p className="text-slate-200">
                      <strong>Semester:</strong>{" "}
                      {profileData?.semester || "Loading..."}
                    </p>
                    <p className="text-slate-200">
                      <strong>Department:</strong>{" "}
                      {profileData?.department || "Loading..."}
                    </p>
                  </div>
                </div>
                {resume && (
                  <div className="space-y-2 bg-slate-800/40 p-4 rounded-lg backdrop-blur-sm">
                    <h3 className="font-semibold text-slate-100">Resume</h3>
                    <button
                      onClick={handleResumeClick}
                      className="bg-slate-700/60 hover:bg-slate-600/60 text-slate-100 px-4 py-2 rounded-lg transition-all duration-300"
                    >
                      Open Resume
                    </button>
                    {resumeContext && (
                      <div className="mt-4 text-slate-200">
                        <h4 className="font-semibold">Resume Context:</h4>
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
                    <CardTitle className="text-slate-100">
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="old-password" className="text-slate-200">
                        Old Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="old-password"
                          type={showOldPassword ? "text" : "password"}
                          required
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          className="bg-gray-900/40 border-slate-500/40 text-slate-100 placeholder-slate-400/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
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
                      <Label htmlFor="new-password" className="text-slate-200">
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-gray-900/40 border-slate-500/40 text-slate-100 placeholder-slate-400/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
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
                        className="text-slate-200"
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
                          className="bg-gray-900/40 border-slate-500/40 text-slate-100 placeholder-slate-400/60"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
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
                      className="w-full bg-slate-700/60 hover:bg-slate-600/60 text-slate-100 border border-slate-500/40 transition-all duration-300"
                    >
                      Change Password
                    </Button>
                  </form>
                </motion.div>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <CardHeader className="px-0">
                    <CardTitle className="text-slate-100">
                      Upload Your Resume
                    </CardTitle>
                  </CardHeader>
                  <div className="flex items-center justify-center w-full">
                    <Label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-500/40 border-dashed rounded-lg cursor-pointer bg-gray-900/40 hover:bg-slate-800/60 transition-colors duration-300"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-10 h-10 mb-3 text-slate-300" />
                        <p className="mb-2 text-sm text-slate-300">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-slate-400">
                          PDF, DOC, DOCX (MAX. 5MB)
                        </p>
                      </div>
                      <Input
                        id="dropzone-file"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
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
                    className="w-full mt-4 bg-slate-700/60 hover:bg-slate-600/60 text-slate-100 border border-slate-500/40 transition-all duration-300"
                    disabled={!file}
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
                        Resume uploaded successfully!
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
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
