import { getAllColleges, addCollege, deleteCollege, getCollegeAdmins, addAdmin } from "@/Communicators/godCommunications";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Plus, Trash, Eye, EyeOff } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from "react-hot-toast";

// Types
type College = {
  id: number;
  name: string;
};

type Admin = {
  id: number;
  username: string;
  roll_number: string;
  password: string;
  collegeId: number;
};

// Main component
const GodPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<string>('addCollege');
  const [colleges, setColleges] = useState<College[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newCollege, setNewCollege] = useState({ name: '', defaultPassword: '' });
  const [collegeSearch, setCollegeSearch] = useState('');
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [newAdmin, setNewAdmin] = useState({ username: '', rollNumber: '' });
  const [adminSearch, setAdminSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showCollegePassword, setShowCollegePassword] = useState(false);
  const [showEditingAdminPassword, setShowEditingAdminPassword] = useState(false);

  // Effects
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getAllColleges();
        const mappedColleges = data.map((c: any) => ({
          id: parseInt(c.id, 10),
          name: c.name,
        }));
        setColleges(mappedColleges);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const savedTab = sessionStorage.getItem("activeTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    sessionStorage.setItem("activeTab", tab);
  };

  // Handlers
  const handleAddCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollege.name || !newCollege.defaultPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await addCollege(newCollege);
      if (response) {
        toast.success("College added successfully!");
        setNewCollege({ name: '', defaultPassword: '' });
        const data = await getAllColleges();
        setColleges(data);
      } else {
        toast.error("Error adding college");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollege || !newAdmin.username || !newAdmin.rollNumber) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      // console.log(selectedCollege.id, newAdmin);
      const payload = {"name":newAdmin.username,"rollNumber":newAdmin.rollNumber}; 
      const response = await addAdmin(selectedCollege.id, payload);
      if (response) {
        toast.success("Admin added successfully!");
        setNewAdmin({ username: '', rollNumber: '' });
        await fetchAdminsForCollege(selectedCollege.id);
      } else {
        toast.error("Error adding admin");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = (adminId: number) => {
    setAdmins(admins.filter(admin => admin.id !== adminId));
  };

  const handleUpdateAdmin = () => {
    if (!editingAdmin) return;
    setLoading(true);
    setTimeout(() => {
      setAdmins(admins.map(admin => admin.id === editingAdmin.id ? editingAdmin : admin));
      setEditingAdmin(null);
      setLoading(false);
    }, 2000);
  };

  const handleEditAdmin = (admin: Admin) => {
    setEditingAdmin(admin);
  };

  const handleDeleteCollege = async (id: number) => {
    setLoading(true);
    try {
      const response = await deleteCollege(id);
      if (response) {
        toast.success("College deleted successfully!");
        const data = await getAllColleges();
        setColleges(data);
      } else {
        toast.error("Error deleting college");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the college");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Add a helper function to fetch admins for the selected college
  const fetchAdminsForCollege = async (collegeId: number) => {
    setLoading(true);
    try {
      const data = await getCollegeAdmins(collegeId);
      const mappedAdmins = data.map((a: any, index: number) => ({
        id: index + 1,
        username: a.username || "",
        roll_number: a.roll_number || "",
        password: a.password || "",
        collegeId: parseInt(a.college_id, 10),
      }));
      setAdmins(mappedAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  // Render functions
  const renderSidebar = () => (
    <Sidebar  className="w-64 shrink-0">
      <SidebarHeader>
        <CardTitle className="text-sm font-medium group-data-[collapsible=icon]:hidden">Dashboard</CardTitle>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleTabChange('addCollege')}
              isActive={activeTab === 'addCollege'}
              className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Plus className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Add College</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => handleTabChange('addAdmin')}
              isActive={activeTab === 'addAdmin'}
              className="w-full justify-start group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <Edit className="h-4 w-4 group-data-[collapsible=icon]:mr-0 mr-2" />
              <span className="group-data-[collapsible=icon]:hidden">Add Admin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
      </SidebarFooter>
    </Sidebar>
  );

  const filteredColleges = colleges.filter(college =>
    college.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const renderAddCollegeSection = () => (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add College</CardTitle>
          <CardDescription>Create a new college and set its default password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddCollege} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="collegeName">College Name</Label>
              <Input
                id="collegeName"
                placeholder="Enter college name"
                value={newCollege.name}
                onChange={(e) => setNewCollege({ ...newCollege, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultPassword">Default Password</Label>
              <div className="flex items-center">
                <Input
                  id="defaultPassword"
                  type={showCollegePassword ? "text" : "password"}
                  placeholder="Enter default password"
                  value={newCollege.defaultPassword}
                  onChange={(e) => setNewCollege({ ...newCollege, defaultPassword: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCollegePassword(!showCollegePassword)}
                >
                  {showCollegePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button type="submit">Add College</Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col items-start">
          <div className="w-full space-y-2">
            <Label htmlFor="collegeSearch">Search Colleges</Label>
            <div className="relative">
              <Input
                id="collegeSearch"
                placeholder="Search colleges..."
                value={collegeSearch}
                onChange={(e) => setCollegeSearch(e.target.value)}
              />
              {collegeSearch && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  {filteredColleges.map((college) => (
                    <div
                      key={college.id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedCollege(college);
                        setCollegeSearch(college.name);
                      }}
                    >
                      {college.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <ScrollArea className="h-[200px] w-full mt-4">
            <Table>
              <TableHeader >
                <TableRow className="flex justify-between">
                  <TableHead className="pl-5">College Name</TableHead>
                  <TableHead className="pr-5">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColleges.map(college => (
                  <TableRow key={college.id} className="flex justify-between">
                    <TableCell className="pl-5">{college.name}</TableCell>
                    <TableCell className="pr-5">
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteCollege(college.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardFooter>
      </Card>
    </div>
  );

  const renderAddAdminSection = () => (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Admin</CardTitle>
          <CardDescription>Search for a college and manage its admins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminSearch">Search College</Label>
              <div>
                <Input
                  id="adminSearch"
                  placeholder="Search college..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                />
                {adminSearch && (
                  <div>
                    {colleges
                      .filter((college) =>
                        college.name.toLowerCase().includes(adminSearch.toLowerCase())
                      )
                      .map((college) => (
                        <div
                          key={college.id}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedCollege(college);
                            fetchAdminsForCollege(college.id);
                            setAdminSearch(college.name);
                          }}
                        >
                          {college.name}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
            {selectedCollege && (
              <>
                <h3 className="text-lg font-semibold">Admins for {selectedCollege.name}</h3>
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead> User Name(Roll Number)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.filter(admin => admin.collegeId === selectedCollege.id).map(admin => (
                        <TableRow key={admin.id}>
                          <TableCell>{admin.username}</TableCell>
                          <TableCell>{admin.roll_number}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="icon" onClick={() => handleEditAdmin(admin)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Admin</DialogTitle>
                                    <DialogDescription>Make changes to the admin account here.</DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="username" className="text-right">Username</Label>
                                      <Input
                                        id="username"
                                        value={editingAdmin?.username || ''}
                                        onChange={(e) => setEditingAdmin(prev => prev ? {...prev, username: e.target.value} : null)}
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="rollNumber" className="text-right">Roll Number</Label>
                                      <Input
                                        id="rollNumber"
                                        value={editingAdmin?.roll_number || ''}
                                        onChange={(e) => setEditingAdmin(prev => prev ? {...prev, rollNumber: e.target.value} : null)}
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="password" className="text-right">Password</Label>
                                      <div className="flex items-center col-span-3">
                                        <Input
                                          id="password"
                                          type={showEditingAdminPassword ? "text" : "password"}
                                          value={editingAdmin?.password || ''}
                                          onChange={(e) => setEditingAdmin(prev => prev ? {...prev, password: e.target.value} : null)}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          onClick={() => setShowEditingAdminPassword(!showEditingAdminPassword)}
                                        >
                                          {showEditingAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button onClick={handleUpdateAdmin}>Save changes</Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button variant="destructive" size="icon" onClick={() => handleDeleteAdmin(admin.id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <form onSubmit={handleAddAdmin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adminUsername">Name</Label>
                    <Input
                      id="adminUsername"
                      placeholder="Enter Admin Name"
                      value={newAdmin.username}
                      onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminRollNumber">Username(Roll Number)</Label>
                    <Input
                      id="adminRollNumber"
                      placeholder="Enter Admin Username"
                      value={newAdmin.rollNumber}
                      onChange={(e) => setNewAdmin({ ...newAdmin, rollNumber: e.target.value })}
                    />
                  </div>
                  <Button type="submit">Add Admin</Button>
                </form>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        {renderSidebar()}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === 'addCollege' && renderAddCollegeSection()}
          {activeTab === 'addAdmin' && renderAddAdminSection()}
        </main>
        {loading && (
          <Dialog open={loading}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Processing</DialogTitle>
                <DialogDescription>
                  Please wait while we process your request...
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SidebarProvider>
  );
};

export default GodPage;

