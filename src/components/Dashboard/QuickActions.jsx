'use client';

import { motion } from 'framer-motion';
import { PlusCircle, Search, Sparkles, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const handleCreateClick = () => router.push('/create-certificate');
  const handleVerifyClick = () => router.push('/verify-certificate');
  const handleAddPeopleClick = () => router.push('/add-people');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 overflow-hidden border border-gray-100 mb-10"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/50 to-teal-100/50 rounded-full blur-3xl -z-0" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Sparkles className="w-8 h-8 text-purple-600" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Create Certificate */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateClick}
            className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-8 rounded-2xl font-semibold text-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <PlusCircle className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Create Certificate</span>
          </motion.button>

          {/* Verify Certificate */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVerifyClick}
            className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-8 rounded-2xl font-semibold text-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Search className="w-7 h-7 relative z-10 group-hover:rotate-12 transition-transform" />
            <span className="relative z-10">Verify Certificate</span>
          </motion.button>

          {/* Add People */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddPeopleClick}
            className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white py-8 rounded-2xl font-semibold text-xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <UserPlus className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Add People</span>
          </motion.button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 text-center">
          <p>Generate new certificates for completed courses</p>
          <p>Verify the authenticity of issued certificates</p>
          <p>Add new participants to your database</p>
        </div>
      </div>
    </motion.div>
  );
}
