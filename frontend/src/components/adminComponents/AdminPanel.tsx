import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DataExport } from "./AdminPanel/DataExport";
import { Departments } from "./AdminPanel/Departments";
import { InterviewSettings } from "./AdminPanel/InterviewSettings";
import { UserManagement } from "./AdminPanel/UserManagement";
import { SubjectsAndTopics } from "./AdminPanel/SubjectAndTopics";

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem("adminPanelActiveTab") || "interview-settings"
  );

  useEffect(() => {
    localStorage.setItem("adminPanelActiveTab", activeTab);
  }, [activeTab]);

  return (
    <div className="container mx-auto p-4 mt-20">
      <motion.h1
        className="text-xl font-bold mb-6 sm:text-2xl md:text-3xl"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        Admin Control Panel
      </motion.h1>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
        className="space-y-4"
      >        <TabsList className="flex flex-wrap justify-center gap-2 mb-4 sm:gap-x-8 md:gap-x-16 lg:gap-x-40 bg-gray-100  ">
          <TabsTrigger value="interview-settings">
            Interview Settings
          </TabsTrigger>
          <TabsTrigger value="user-management">User Management</TabsTrigger>
          <TabsTrigger value="departments-sections">Batches</TabsTrigger>
          <TabsTrigger value="subject-topics">Subject & Topics</TabsTrigger>
        </TabsList>        <div className="bg-transparent">
          {activeTab === "interview-settings" && <InterviewSettings />}
          {activeTab === "user-management" && <UserManagement />}
          {activeTab === "departments-sections" && <Departments />}
          {activeTab === "subject-topics" && <SubjectsAndTopics />}
        </div>
      </Tabs>
    </div>
  );
}
