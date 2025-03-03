import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/Context/AuthContext'; // Import useAuth
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { checkAuthStatus } from '@/Communicators/apiCommunications';

export function LoginPageComponent() {
  console.log("In Login");
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth(); // Use the login function from AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      await login(username, password); // Call the login function
      console.log('Login successful');
      // await checkAuthStatus();
      // window.location.reload();
      navigate('/');
    } catch (error) {
      console.error('Login failed: mowa');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <button onClick={()=>{navigate("/skillsage/god")}}
        className="absolute bottom-4 right-4 bg-gray-100 text-gray-100 px-4 py-2 rounded z-50"
      >
        GOD
      </button>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-20 w-1/2 h-full bg-gray-100 rounded-full transform -translate-y-1/2 translate-x-1/2"></div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative max-w-md w-full space-y-8"
      >
        <div>
          <img
            className="mx-auto h-20 w-auto"
            src="Logo.png"
            alt="Tesseract Logo"
          />
        </div>
        <div className="bg-white p-10 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                // onChange={(e) => setUsername(e.target.value.toUpperCase())}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="Username"
              />
            </div>
            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}