import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, Menu, X, ChevronsUpDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../Context/AuthContext"
import { getAllDepartments } from "@/Communicators/apiCommunications"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard' },
  {
    name: "Students",
    href: "#",
    subItems: [
      { name: '2nd Year', href: '/admin/student-list/2' },
      { name: '3rd Year', href: '/admin/student-list/3' },
      { name: '4th Year', href: '/admin/student-list/4' },
    ],
  },
  { name: 'Admin Panel', href: '/admin/adminpanel' },
  { name: 'College Metrics', href: '/admin/show-metrics' },
]

const MotionLink = motion(Link)

interface AdminNavbarProps {
  children?: React.ReactNode;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ children }) => {
  const { isLoggedIn, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isLoggedIn || user?.role !== 'admin') {
    return null
  }

  const [isOpen, setIsOpen] = useState(false)
  const [isHoveringProfile, setIsHoveringProfile] = useState(false)
  const [isHoveringStudents, setIsHoveringStudents] = useState(false)
  const [isDeptOpen, setIsDeptOpen] = useState(false)
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([])
  const [selectedDepartment, setSelectedDepartment] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsData = await getAllDepartments()
        setDepartments(
          departmentsData.map(dept => ({
            id: Number(dept.id),
            name: dept.name,
          }))
        )
      } catch (error) {
        console.error("Error fetching departments:", error)
      }
    }
    fetchDepartments()
  }, [])

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsHoveringStudents(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHoveringStudents(false)
    }, 300)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

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
                {navItems.map((item) =>
                  item.subItems ? (
                    <Popover open={isDeptOpen} onOpenChange={setIsDeptOpen} key={item.name}>
                      <PopoverTrigger asChild>
                        <motion.button
                          className={`flex items-center text-gray-800 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            location.pathname.startsWith(item.href) ? 'font-bold shadow-md' : ''
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Students
                          <ChevronDown className="ml-1 h-4 w-4" />
                        </motion.button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search batch..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No batch found.</CommandEmpty>
                            <CommandGroup>
                              {departments.map((dept) => (
                                <CommandItem
                                  key={dept.id}
                                  value={dept.name}
                                  onSelect={(currentValue) => {
                                    setSelectedDepartment(dept)
                                    setIsDeptOpen(false)
                                    navigate(`/admin/student-list/${dept.id}`)
                                  }}
                                >
                                  {dept.name}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      selectedDepartment?.id === dept.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
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
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {children} {/* Dark mode toggle */}
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <motion.button
                      className="bg-gray-800 flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="sr-only">Open user menu</span>
                      <img className="h-8 w-8 rounded-full object-contain" src="/OWL.png" alt="" />
                    </motion.button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Name: {user.username}</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>Log Out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                {navItems.map((item) =>
                  item.subItems ? (
                    <div key={item.name}>
                      <motion.button
                        className={`text-gray-800 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                          location.pathname.startsWith(item.href) ? 'font-bold shadow-md' : ''
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsDeptOpen(!isDeptOpen)}
                      >
                        {selectedDepartment ? selectedDepartment.name : "Students"}
                      </motion.button>
                      {isDeptOpen && (
                        <div className="pl-4">
                          {departments.map((dept) => (
                            <MotionLink
                              key={dept.id}
                              to={`/admin/student-list/${dept.id}`}
                              className={`text-gray-800 hover:text-gray-900 block px-3 py-2 rounded-md text-sm font-medium ${
                                location.pathname === `/admin/student-list/${dept.id}` ? 'font-bold' : ''
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setIsOpen(false)}
                            >
                              {dept.name}
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
                )}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-700">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full object-contain" src="/OWL.png" alt="" />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.username}</div>
                  </div>
                </div>
                <div className="mt-3 px-2 space-y-1">
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
