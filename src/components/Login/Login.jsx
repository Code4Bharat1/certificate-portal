'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async () => {
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      // Replace with your actual backend API endpoint
      // console.log(API_URL);
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Handle successful login
      if (response.data.success) {
        toast.success('Login successful!');
        
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('isAuthenticated', 'true');
          // Optionally store token if your backend returns one
          if (response.data.token) {
            sessionStorage.setItem('authToken', response.data.token);
          }
        }

        setTimeout(() => router.push('/dashboard'), 500);
      } else {
        toast.error(response.data.message || 'Invalid credentials!');
      }
    } catch (error) {
      // Handle different error types
      if (error.response) {
        // Server responded with error status
        toast.error(error.response.data.message || 'Invalid credentials!');
      } else if (error.request) {
        // Request made but no response received
        toast.error('Server not responding. Please try again.');
      } else {
        // Something else happened
        toast.error('An error occurred. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center"
          >
            <FileText className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to the Certificate Admin Portal</h1>
          <p className="text-gray-600">Sign in to access dashboard</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter admin username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter password"
            />
          </div>
          <motion.button
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </motion.button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          Admin access only • No signup available
        </p>
      </motion.div>
    </div>
  );
}