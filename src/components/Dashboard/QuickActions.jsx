'use client';

import { motion } from 'framer-motion';
import { PlusCircle, Search, Sparkles, Users, FileText, ScrollText, FolderOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActions() {
  const router = useRouter();

  const handleCreateClick = () => router.push('/create-certificate');
  const handleVerifyClick = () => router.push('/verify-certificate');
  const handleManagePeopleClick = () => router.push('/manage-people');
  const handleCreateLetterClick = () => router.push('/create-letter');
  const handleViewTCClick = () => router.push('/verify-t&c');
  const handleViewDocumentsClick = () => router.push('/view-documents');

  const actions = [
    {
      title: 'Create Certificate',
      description: 'Generate new certificates for completed courses',
      icon: PlusCircle,
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: handleCreateClick,
      iconAnimation: 'group-hover:scale-110 group-hover:rotate-90',
    },
    {
      title: 'Verify Certificate',
      description: 'Verify the authenticity of issued certificates',
      icon: Search,
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: handleVerifyClick,
      iconAnimation: 'group-hover:rotate-12 group-hover:scale-110',
    },
    {
      title: 'Manage People',
      description: 'Add, edit, view, and remove participants',
      icon: Users,
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: handleManagePeopleClick,
      iconAnimation: 'group-hover:scale-110',
    },
    {
      title: 'Create Letter',
      description: 'Design and generate official letters with ease',
      icon: FileText,
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: handleCreateLetterClick,
      iconAnimation: 'group-hover:rotate-6 group-hover:scale-110',
    },
    {
      title: 'View T&C',
      description: 'Review the terms and conditions for certificate issuance',
      icon: ScrollText,
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: handleViewTCClick,
      iconAnimation: 'group-hover:scale-110 group-hover:rotate-90',
    },
    {
      title: 'View Documents',
      description: 'Access and review all user submitted documents',
      icon: FolderOpen,
      iconColor: 'text-blue-600 dark:text-blue-400',
      onClick: handleViewDocumentsClick,
      iconAnimation: 'group-hover:scale-110 group-hover:-rotate-12',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative bg-gradient-to-br from-white via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 overflow-hidden border-2 border-blue-100 dark:border-gray-700 mb-10 mt-10"
    >
      {/* Background glows - White/Blue theme */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-blue-200/40 dark:from-gray-800/30 dark:to-gray-700/30 rounded-full blur-3xl -z-0 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-50/40 to-blue-100/40 dark:from-gray-700/30 dark:to-gray-800/30 rounded-full blur-3xl -z-0 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-bl from-blue-100/30 to-gray-100/30 dark:from-gray-700/20 dark:to-gray-800/20 rounded-full blur-3xl -z-0 animate-pulse" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-2"
          >
            <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-300 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
            Quick Actions
          </h2>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={action.onClick}
                className="group relative overflow-hidden flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 py-10 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 dark:border-gray-600"
              >
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Icon Container */}
                <div className="relative z-10 bg-blue-100 dark:bg-gray-700 rounded-full p-3">
                  <Icon
                    className={`w-8 h-8 transition-transform duration-300 ${action.iconAnimation} ${action.iconColor}`}
                  />
                </div>

                {/* Title */}
                <span className="relative z-10 text-center leading-tight font-bold text-gray-800 dark:text-gray-100">
                  {action.title}
                </span>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Descriptions aligned below cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-6"
        >
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
              className="text-center"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed px-2 font-medium">
                {action.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}