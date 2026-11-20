import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminNavbar } from '../adminComponents/AdminNavbar';
import { StudentNavbar } from '../studentComponents/StudentNavbar';

interface HeaderProps {
  role: 'admin' | 'student';
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ role, children }) => {
  return (
    <header className="header">
      {role === 'admin' ? 
        <AdminNavbar>{children}</AdminNavbar> : 
        <StudentNavbar>{children}</StudentNavbar>
      }
      <Outlet />
    </header>
  );
};

export default Header;