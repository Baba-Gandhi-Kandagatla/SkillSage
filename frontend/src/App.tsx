import axios from 'axios';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { InterviewDashboard } from './components/adminComponents/AdminInterviewDashboard';
import AdminPanel from './components/adminComponents/AdminPanel';
import AdminProfile from './components/adminComponents/AdminProfile';
import { AdminStudentDashboard } from './components/adminComponents/AdminStudentDashboard';
import InterviewStudentList from './components/adminComponents/interview-student-list';
import Studentlist from './components/adminComponents/Student-list';
import { ViewStudent } from './components/adminComponents/ViewStudent';
import LandingPage from './components/LandingPage'; // Import LandingPage
import { LoginPageComponent } from './components/Login';
import { Header } from './components/shared/Header';
import LoadingSkillSage from './components/shared/LoadingSkillSage';
import { PageNotFound } from './components/shared/PageNotFound';
import { ViewAnalysis } from './components/shared/ViewAnalysis';
import { CompletedInterviews } from './components/studentComponents/completed-interviews';
import { InterviewComponent } from './components/studentComponents/InterviewComponent';
import { ProfileSection } from './components/studentComponents/Profile';
import { StudentInterviews } from './components/studentComponents/Student-Interviews';
import { StudentPerformance } from './components/studentComponents/Student-Performance';
import { useAuth } from './Context/AuthContext';
import GodPage from './components/godComponents/godPage';


axios.defaults.baseURL = "http://localhost:5000/api/v1";
axios.defaults.withCredentials = true;

function App() {
  const { isLoggedIn, user, loading } = useAuth(); // Destructure loading
  console.log("opened app");

  if (loading) {
    return <LoadingSkillSage />; // Use OwlLoading component
  }

  return (
    <>
      {isLoggedIn && user?.role && <Header role={user.role as 'admin' | 'student'} />}
      <Routes>
        <Route path="/skillsage/god" element={<GodPage/>} />
        <Route path="/landing-page" element={<LandingPage />} />
        {!isLoggedIn ? (
          <>
            <Route path="/login" element={<LoginPageComponent />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Navigate to="/" replace />} />
            {user?.role === 'admin' ? (
              <>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<InterviewDashboard />} />
                <Route path="/admin/students" element={<AdminStudentDashboard />} />
                <Route path="/admin/student-list" element={<Studentlist />} />
                <Route path="/admin/student-list/:year" element={<Studentlist />} />
                <Route path="/admin/interview-student-list/" element={<InterviewStudentList interviewName={''} />} />
                <Route path="/admin/view-student/:rollNumber" element={<ViewStudent />} />
                <Route path="/admin/adminpanel" element={<AdminPanel />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/student/*" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/view-analysis" element={<ViewAnalysis />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to="/student/interviews" replace />} />
                <Route path="/student/interviews" element={<StudentInterviews />} />
                <Route path="/student/completed-interviews" element={<CompletedInterviews />} />
                <Route path="/student/performance" element={<StudentPerformance />} />
                <Route path="/student/interview/:interviewId" element={<InterviewComponent />} />
                <Route path="/student/profile" element={<ProfileSection />} />
                <Route path="/admin/*" element={<Navigate to="/student/interviews" replace />} />
                <Route path="/view-analysis" element={<ViewAnalysis />} />
              </>
            )}
            <Route path="*" element={<PageNotFound />} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;