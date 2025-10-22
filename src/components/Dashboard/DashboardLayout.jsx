'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }) {
  const currentTime = new Date();
  const router = useRouter();

  // useEffect(() => {
  //   const timer = setInterval(() => setCurrentTime(new Date()), 1000);
  //   return () => clearInterval(timer);
  // }, []);

  const handleLogout = () => {
    toast.success('Logged out successfully!');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAuthenticated');
    }
    setTimeout(() => router.push('/login'), 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-6">
              {/* <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-700">Admin C4B</span>
                <span className="text-xs text-gray-500">
                  {currentTime.toLocaleDateString()}
                </span>
              </div> */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}