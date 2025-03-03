import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  
  
   DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
  import { useAuth } from '../../Context/AuthContext'
  
  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    // { name: 'Completed Interviews', href: '/completed-interviews' },
    // { name: 'Performance', href: '/student-performance' },
    {
      name: "Students",
      href: "#",
      subItems: [
        { name: '2nd Year', href: '/admin/student-list/2' },
        { name: '3rd Year', href: '/admin/student-list/3' },
        { name: '4th Year', href: '/admin/student-list/4' },
      ]
    },
    { name: 'Admin Panel', href: '/admin/adminpanel' },
  ]
  
  const MotionLink = motion(Link);

  export function AdminNavbar() {
    const { isLoggedIn, user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Initialize useLocation
  
    if (!isLoggedIn || user?.role !== 'admin') {
      return null;
    }
  
    const [isOpen, setIsOpen] = useState(false)
    const [isHoveringProfile, setIsHoveringProfile] = useState(false)
    const [isHoveringStudents, setIsHoveringStudents] = useState(false)
    const [isStudentsDropdownOpen, setIsStudentsDropdownOpen] = useState(false); // Add this state
    const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
    const handleMouseEnter = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      setIsHoveringStudents(true)
    }
  
    const handleMouseLeave = () => {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHoveringStudents(false)
      }, 300) // Delay to allow moving to submenu
    }
  
    const handleLogout = async () => {
      try {
        await logout();
        
        navigate('/login'); // Redirect to login page
      } catch (error) {
        console.error("Error logging out here:", error);
        
      }
    }

    const handleStudentsClick = () => {
      setIsStudentsDropdownOpen(!isStudentsDropdownOpen);
    };
  
    return (
      <>
        <nav className="fixed top-0 left-0 right-0 z-40 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg shadow-md bg-gradient-to-b from-grey-900/10 to-grey-200/90">
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
                    item.subItems ? (
                      <div
                        key={item.name}
                        className="relative"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                      >
                        <motion.button
                          className={`text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center ${
                            location.pathname.startsWith(item.href) ? 'font-bold shadow-md' : ''
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.name}
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </motion.button>
                        <AnimatePresence>
                          {isHoveringStudents && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                            >
                              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                {item.subItems.map((subItem) => (
                                  <Link
                                    key={subItem.name}
                                    to={subItem.href}
                                    className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 ${
                                      location.pathname === subItem.href ? 'font-medium' : ''
                                    }`}
                                    role="menuitem"
                                  >
                                    {subItem.name}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <MotionLink
                        key={item.name}
                        to={item.href}
                        className={`text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                          location.pathname === item.href ? 'font-bold shadow-md' : ''
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {item.name}
                      </MotionLink>
                    )
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
                        src="/OWL.png"
                        alt=""
                      />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem>Name: {user.username}</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
                    {/* <DropdownMenuItem>Roll Number: 22BD1A1661Z</DropdownMenuItem> */}
                    <DropdownMenuItem asChild>
                      <Link 
                        to="/admin/profile" 
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
                    item.subItems ? (
                      <div key={item.name}>
                        <motion.button
                          className={`text-gray-800 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                            location.pathname.startsWith(item.href) ? 'font-bold shadow-md' : ''
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleStudentsClick} // Add this onClick handler
                        >
                          {item.name}
                        </motion.button>
                        {isStudentsDropdownOpen && ( // Add this conditional rendering
                          <div className="pl-4">
                            {item.subItems.map((subItem) => (
                              <MotionLink
                                key={subItem.name}
                                to={subItem.href}
                                className={`text-gray-800 hover:text-gray-900 block px-3 py-2 rounded-md text-sm font-medium ${
                                  location.pathname === subItem.href ? 'font-bold' : ''
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsOpen(false)}
                              >
                                {subItem.name}
                              </MotionLink>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <MotionLink
                        key={item.name}
                        to={item.href}
                        className={`text-gray-800 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium ${
                          location.pathname === item.href ? 'font-bold shadow-md' : ''
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </MotionLink>
                    )
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full object-contain"
                        src="/OWL.png"
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user.username}</div>
                      {/* <div className="text-sm font-medium text-gray-500">22BD1A1661Z</div> */}
                    </div>
                  </div>
                  <div className="mt-3 px-2 space-y-1">
                    <Link 
                      to="/admin/profile" 
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
                      className="flex items-center w-full justify-between px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-900 hover:bg-gray-100"
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
    )
  }