import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import axios from 'axios';
interface PasswordPromptProps {
  onPasswordSubmit: (isValid: boolean) => void;
}

const PasswordPrompt: React.FC<PasswordPromptProps> = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post('/god/godLogin',{"godPassword":password});
      console.log(response.data)
      const data = response.data; 
      if(data.error){
        toast.error("You are not worthy of being a GOD");
        onPasswordSubmit(false);
        return;
      }
      if (data.isHeGod) {
        onPasswordSubmit(true);
      } else {
        toast.error("Incorrect password");
        onPasswordSubmit(false);
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      toast.error("You are not worthy of being a GOD");
      onPasswordSubmit(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Enter Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordPrompt;
