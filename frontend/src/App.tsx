import axios from 'axios';
import { lazy, Suspense, useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { useAuth } from './Context/AuthContext';

// Loading fallback component
import LoadingSkillSage from './components/shared/LoadingSkillSage';
import Dashboard from './components/adminComponents/Dashboard';

// Lazy-loaded components
const InterviewDashboard = lazy(() => import('./components/adminComponents/AdminInterviewDashboard').then((module) => ({ default: module.InterviewDashboard })));
const AdminPanel = lazy(() => import('./components/adminComponents/AdminPanel'));
const AdminProfile = lazy(() => import('./components/adminComponents/AdminProfile'));
const AdminStudentDashboard = lazy(() => import('./components/adminComponents/AdminStudentDashboard').then((module) => ({ default: module.AdminStudentDashboard })));
const InterviewStudentList = lazy(() => import('./components/adminComponents/interview-student-list').then((module) => ({ default: module.default })));

// const InterviewStudentList = lazy(() => import('./components/adminComponents/interview-student-list').then((module) => ({ default: module.InterviewStudentList })));
const Studentlist = lazy(() => import('./components/adminComponents/Student-list').then((module) => ({ default: module.default })));
const ViewStudent = lazy(() => import('./components/adminComponents/ViewStudent').then((module) => ({ default: module.ViewStudent })));
const LandingPage = lazy(() => import('./components/LandingPage'));
const LoginPageComponent = lazy(() => import('./components/Login').then((module) => ({ default: module.LoginPageComponent })));
const Header = lazy(() => import('./components/shared/Header'));
const PageNotFound = lazy(() => import('./components/shared/PageNotFound').then((module) => ({ default: module.PageNotFound })));
const ViewAnalysis = lazy(() => import('./components/shared/ViewAnalysis').then((module) => ({ default: module.ViewAnalysis })));
const CompletedInterviews = lazy(() => import('./components/studentComponents/completed-interviews').then((module) => ({ default: module.CompletedInterviews })));
const InterviewComponent = lazy(() => import('./components/studentComponents/InterviewComponent').then((module) => ({ default: module.InterviewComponent })));
const ProfileSection = lazy(() => import('./components/studentComponents/Profile').then((module) => ({ default: module.ProfileSection })));
const StudentInterviews = lazy(() => import('./components/studentComponents/Student-Interviews').then((module) => ({ default: module.StudentInterviews })));
const StudentPerformance = lazy(() => import('./components/studentComponents/Student-Performance').then((module) => ({ default: module.StudentPerformance })));
const GodPage = lazy(() => import('./components/godComponents/godPage'));
// Axios configuration
// axios.defaults.baseURL = import.meta.env.VITE_API_URL as string;

axios.defaults.baseURL = (window as any).env.API_URL;
// axios.defaults.baseURL = "http://skillsage.api/api/v1";  // used this for kubernetes deployment comment this and 
                                                         // uncomment the above line for local deployment

axios.defaults.baseURL = "http://localhost:5000/api/v1";
// axios.defaults.baseURL = "http://192.168.31.58:5000/api/v1";
axios.defaults.withCredentials = true;

function App() {
  const { isLoggedIn, user, loading } = useAuth();
  
  // Removing dark mode state and effects
  
  if (loading) {
    return <LoadingSkillSage />;
  }

  return (
    <>
      <Suspense fallback={<LoadingSkillSage />}>
        {isLoggedIn && user?.role && (
          <Header role={user.role as 'admin' | 'student'} />
        )}
      </Suspense>
      
      <Routes>
        <Route path="/skillsage/god" element={<Suspense fallback={<LoadingSkillSage />}><GodPage /></Suspense>} />
        <Route path="/landing-page" element={<Suspense fallback={<LoadingSkillSage />}><LandingPage /></Suspense>} />
        
        {!isLoggedIn ? (
          <>
            <Route path="/login" element={<Suspense fallback={<LoadingSkillSage />}><LoginPageComponent /></Suspense>} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Navigate to="/" replace />} />
            {user?.role === 'admin' ? (
              <>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<Suspense fallback={<LoadingSkillSage />}><InterviewDashboard /></Suspense>} />
                <Route path="/admin/show-metrics" element={<Suspense fallback={<LoadingSkillSage />}><Dashboard /></Suspense>} />
                <Route path="/admin/students" element={<Suspense fallback={<LoadingSkillSage />}><AdminStudentDashboard /></Suspense>} />
                <Route path="/admin/student-list" element={<Suspense fallback={<LoadingSkillSage />}><Studentlist /></Suspense>} />
                <Route path="/admin/student-list/:department_id" element={<Suspense fallback={<LoadingSkillSage />}><Studentlist /></Suspense>} />
                <Route path="/admin/interview-student-list/" element={<Suspense fallback={<LoadingSkillSage />}><InterviewStudentList interviewName={''} /></Suspense>} />
                <Route path="/admin/view-student/:rollNumber" element={<Suspense fallback={<LoadingSkillSage />}><ViewStudent /></Suspense>} />
                <Route path="/admin/adminpanel" element={<Suspense fallback={<LoadingSkillSage />}><AdminPanel /></Suspense>} />
                <Route path="/admin/profile" element={<Suspense fallback={<LoadingSkillSage />}><AdminProfile /></Suspense>} />
                <Route path="/student/*" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/view-analysis" element={<Suspense fallback={<LoadingSkillSage />}><ViewAnalysis /></Suspense>} />
                <Route path="/viewanalysis/:id" element={<Suspense fallback={<LoadingSkillSage />}><ViewAnalysis /></Suspense>} />
              </>
            ) : (
              <>
                <Route path="/" element={<Navigate to="/student/interviews" replace />} />
                <Route path="/student/interviews" element={<Suspense fallback={<LoadingSkillSage />}><StudentInterviews /></Suspense>} />
                <Route path="/student/completed-interviews" element={<Suspense fallback={<LoadingSkillSage />}><CompletedInterviews /></Suspense>} />
                <Route path="/student/performance" element={<Suspense fallback={<LoadingSkillSage />}><StudentPerformance /></Suspense>} />
                <Route path="/student/interview/:interviewId" element={<Suspense fallback={<LoadingSkillSage />}><InterviewComponent /></Suspense>} />
                <Route path="/student/profile" element={<Suspense fallback={<LoadingSkillSage />}><ProfileSection /></Suspense>} />
                <Route path="/admin/*" element={<Navigate to="/student/interviews" replace />} />
                <Route path="/student/interview-result/:id" element={<Suspense fallback={<LoadingSkillSage />}><ViewAnalysis /></Suspense>} />
              </>
            )}
            <Route path="*" element={<Suspense fallback={<LoadingSkillSage />}><PageNotFound /></Suspense>} />
          </>
        )}
      </Routes>
    </>
  );
}

export default App;
