import React from 'react';
import { AdminNavbar } from './adminComponents/AdminNavbar';
import { InterviewDashboard } from './adminComponents/AdminInterviewDashboard';

const Tempo: React.FC = () => {
    return (
        <>
        <AdminNavbar/>
        <InterviewDashboard/>
        </>
    );
};

export default Tempo;