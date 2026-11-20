import React, { useState, useEffect } from "react"
import { motion, animate } from "framer-motion"
import { Users, BookOpen, Building2, ShieldCheck, Calendar, HelpCircle, Loader2 } from "lucide-react"
import { getDashboardData } from "@/Communicators/apiCommunications"

// Custom hook for animated counter
const useCountUp = (end: number, duration = 2) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const controls = animate(0, end, {
      duration,
      onUpdate: (value) => setCount(Math.floor(value)),
    })

    return () => controls.stop()
  }, [end, duration])

  return count
}

// Card component
const MetricCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => {
  const count = useCountUp(value)

  return (
    <motion.div
      className="overflow-hidden rounded-lg border bg-white text-gray-900 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
    >
      <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon}
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{count}</div>
      </div>
    </motion.div>
  )
}

// Define the dashboard data type
interface DashboardData {
  totalStudents: number
  totalInterviews: number
  totalDepartments: number
  totalAdmins: number
  totalInterviewInstances: number
  totalInterviewQuestions: number
}

const Dashboard: React.FC = () => {
  // Remove incoming props – fetch data internally instead.
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    getDashboardData()
      .then((data: DashboardData) => setDashboardData(data))
      .catch((error) => console.error("Failed to load dashboard data", error))
  }, [])

  if (!dashboardData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center p-6 bg-white rounded shadow">
          <Loader2 className="h-10 w-10 text-gray-900 animate-spin" />
          <p className="mt-2 text-gray-900">Loading metrics...</p>
        </div>
      </div>
    )
  }

  const metrics = [
    { title: "Total Students", value: dashboardData.totalStudents, icon: <Users className="h-4 w-4 text-gray-500" /> },
    { title: "Total Interviews", value: dashboardData.totalInterviews, icon: <BookOpen className="h-4 w-4 text-gray-500" /> },
    { title: "Total Batches", value: dashboardData.totalDepartments, icon: <Building2 className="h-4 w-4 text-gray-500" /> },
    { title: "Total Admins", value: dashboardData.totalAdmins, icon: <ShieldCheck className="h-4 w-4 text-gray-500" /> },
    {
      title: "Total Interviews Taken",
      value: dashboardData.totalInterviewInstances,
      icon: <Calendar className="h-4 w-4 text-gray-500" />,
    },
    {
      title: "Total Interview Questions",
      value: dashboardData.totalInterviewQuestions,
      icon: <HelpCircle className="h-4 w-4 text-gray-500" />,
    },
  ]

  return (
    <div className="dashboard-container pt-24 p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <div key={index} className="dashboard-card p-4 rounded-lg shadow-md">
            <MetricCard key={metric.title} {...metric} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard

