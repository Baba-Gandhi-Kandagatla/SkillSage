import { getAllDepartments } from "@/Communicators/apiCommunications";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import {
    Download
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.2 } },
};

const bounceVariants = {
  hover: { y: -5, transition: { yoyo: Infinity, duration: 0.4 } },
};

const AnimatedButton = motion(Button);

export const DataExport = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const deptData = await getAllDepartments();
        setDepartments(deptData.map((dept) => dept.name));
      } catch (error) {
        toast.error("Failed to fetch departments.");
      }
    };
    fetchDepartments();
  }, []);

  const handleDownloadAllUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      // Implement download logic here
    } catch (error) {
      // Handle error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownloadFilteredUsers = useCallback(async () => {
    if (selectedDepartment) {
      setIsLoading(true);
      try {
        // Implement download logic here
      } catch (error) {
        // Handle error
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error("Please select a department.");
    }
  }, [selectedDepartment]);

  return (
    <TabsContent value="data-export">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
          <CardDescription>
            Download user data in CSV format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <AnimatedButton
              onClick={handleDownloadAllUsers}
              variants={buttonVariants}
              whileHover={["hover", "bounce"]}
              whileTap="tap"
              className="bg-gray-800 text-white hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download All Users CSV
            </AnimatedButton>
            <div className="space-y-2">
              <Label>Filtered Download</Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <AnimatedButton
                onClick={handleDownloadFilteredUsers}
                variants={{ ...buttonVariants, ...bounceVariants }}
                whileHover={["hover", "bounce"]}
                whileTap="tap"
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Filtered Users CSV
              </AnimatedButton>
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};