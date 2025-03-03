import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { useAuth } from './../../Context/AuthContext';

const navItems = [
  { name: 'Dashboard', href: '/student/interviews' },
  { name: 'Completed Interviews', href: '/student/completed-interviews' },
  { name: 'Performance', href: '/student/performance' },
];

export function StudentNavbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // Initialize useLocation

  if (!isLoggedIn || user?.role !== 'student') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isHoveringProfile, setIsHoveringProfile] = useState(false);
  // const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Error logging out");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-md bg-gradient-to-b from-grey-900/10 to-grey-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link to="/">
                <img className="h-14 w-auto" src="/Logo.png" alt="Logo" />
              </Link>
            </div>
            <div className="hidden md:flex flex-grow justify-center">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <motion.div
                    key={item.name}
                    className={`text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      location.pathname === item.href ? 'font-bold shadow-md' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link to={item.href}>{item.name}</Link>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full object-contain"
                      src='/OWL.png'
                      alt="Profile"
                    />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Name: {user.username}</DropdownMenuItem>
                  <DropdownMenuItem>Roll Number: {user.rollnumber}</DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      to="/student/profile" 
                      className="flex items-center justify-between w-full"
                      onMouseEnter={() => setIsHoveringProfile(true)}
                      onMouseLeave={() => setIsHoveringProfile(false)}
                    >
                      View Profile
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: isHoveringProfile ? 1 : 0, x: isHoveringProfile ? 0 : -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="-mr-2 flex md:hidden">
              <Button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? <X className="block h-6 w-6" aria-hidden="true" /> : <Menu className="block h-6 w-6" aria-hidden="true" />}
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden"
              id="mobile-menu"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navItems.map((item) => (
                  <motion.div
                    key={item.name}
                    className={`text-gray-800 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.href ? 'font-bold shadow-md' : ''
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    <Link to={item.href}>{item.name}</Link>
                  </motion.div>
                ))}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full object-contain"
                      src="/OWL.png"
                      alt="Profile"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.username}</div>
                    <div className="text-sm font-medium text-gray-500">{user.rollnumber}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
                  <Link 
                    to="/student/profile" 
                    className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-900 hover:bg-gray-100"
                    onMouseEnter={() => setIsHoveringProfile(true)}
                    onMouseLeave={() => setIsHoveringProfile(false)}
                  >
                    View Profile
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: isHoveringProfile ? 1 : 0, x: isHoveringProfile ? 0 : -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-900 hover:bg-gray-100 w-full"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <Outlet />
    </>
  );
}