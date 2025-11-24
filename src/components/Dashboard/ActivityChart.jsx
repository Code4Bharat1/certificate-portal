'use client';

import { motion } from 'framer-motion';
import { Activity, FileCheck, Layers, Download, Edit, Trash2, Plus, Package, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

const getActivityIcon = (type) => {
  switch (type) {
    case 'bulk_created':
      return <Layers className="w-4 h-4" />;
    case 'bulk_downloaded':
      return <Package className="w-4 h-4" />;
    case 'created':
      return <Plus className="w-4 h-4" />;
    case 'downloaded':
      return <Download className="w-4 h-4" />;
    case 'deleted':
      return <Trash2 className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

const getActivityColor = (type) => {
  switch (type) {
    case 'bulk_created':
      return {
        bg: 'from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-900',
        dot: 'bg-blue-500 shadow-blue-500/50',
        icon: 'bg-blue-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-blue-300'
      };
    case 'bulk_downloaded':
      return {
        bg: 'from-indigo-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900',
        dot: 'bg-indigo-500 shadow-indigo-500/50',
        icon: 'bg-indigo-100 text-indigo-600 dark:bg-gray-700 dark:text-indigo-400',
        badge: 'bg-indigo-100 text-indigo-700 dark:bg-gray-700 dark:text-indigo-300'
      };
    case 'created':
      return {
        bg: 'from-blue-50 to-cyan-100 dark:from-gray-800 dark:to-gray-900',
        dot: 'bg-blue-600 shadow-blue-600/50',
        icon: 'bg-blue-100 text-blue-700 dark:bg-gray-700 dark:text-blue-400',
        badge: 'bg-blue-100 text-blue-800 dark:bg-gray-700 dark:text-blue-300'
      };
    case 'downloaded':
      return {
        bg: 'from-cyan-50 to-blue-100 dark:from-gray-800 dark:to-gray-900',
        dot: 'bg-cyan-600 shadow-cyan-600/50',
        icon: 'bg-cyan-100 text-cyan-700 dark:bg-gray-700 dark:text-cyan-400',
        badge: 'bg-cyan-100 text-cyan-800 dark:bg-gray-700 dark:text-cyan-300'
      };
    case 'deleted':
      return {
        bg: 'from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-900',
        dot: 'bg-red-500 shadow-red-500/50',
        icon: 'bg-red-100 text-red-600 dark:bg-gray-700 dark:text-red-400',
        badge: 'bg-red-100 text-red-700 dark:bg-gray-700 dark:text-red-300'
      };
    default:
      return {
        bg: 'from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800',
        dot: 'bg-gray-500 shadow-gray-500/50',
        icon: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      };
  }
};

export default function ActivityChart() {
  const [activityLog, setActivityLog] = useState([]);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [bulkStats, setBulkStats] = useState({
    operations: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      console.log('🔑 Auth Token:', token ? 'Present' : 'Missing');
      console.log('🌐 API URL:', API_URL);
      
      setLoading(true);
      setError(null);
      
      const [activityResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/stats/activity`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.get(`${API_URL}/api/stats/dashboard`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      console.log('📊 Activity Response:', activityResponse.data);
      console.log('📈 Stats Response:', statsResponse.data);

      if (activityResponse.data.success) {
        const activities = activityResponse.data.data;
        console.log('✅ Activity Data:', activities);
        console.log('📝 Activity Count:', Array.isArray(activities) ? activities.length : 0);
        setActivityLog(Array.isArray(activities) ? activities : []);
      } else {
        console.warn('⚠️ Activity API returned success: false');
        setActivityLog([]);
      }

      if (statsResponse.data.success) {
        const data = statsResponse.data.data;
        const categories = data.categories;
        
        console.log('📦 Categories:', categories);
        
        // ✅ Calculate total from ALL categories
        const totalCerts = 
          (categories['marketing-junction']?.total || 0) +
          (categories['code4bharat']?.total || 0) +
          (categories['BootCamp']?.total || 0) +
          (categories['BVOC']?.total || 0) +
          (categories['FSD']?.total || 0) +
          (categories['HR']?.total || 0) +
          (categories['DM']?.total || 0) +
          (categories['Operations']?.total || 0);
        
        console.log('🎯 Total Certificates:', totalCerts);
        setTotalCertificates(totalCerts);

        // Calculate total bulk stats
        if (data.bulk) {
          const totalBulkOps = data.bulk.lastMonth.operations + data.bulk.downloads.operations;
          const totalBulkCerts = data.bulk.lastMonth.certificates + data.bulk.downloads.certificates;
          setBulkStats({
            operations: totalBulkOps,
            certificates: totalBulkCerts
          });
          console.log('📦 Bulk Stats:', { operations: totalBulkOps, certificates: totalBulkCerts });
        }
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      console.error('❌ Error Response:', err.response?.data);
      console.error('❌ Error Status:', err.response?.status);
      setError(err.response?.data?.message || 'Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900 animate-pulse rounded-2xl h-96"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <div className="bg-red-100 dark:bg-red-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-red-700 dark:text-red-300 font-semibold mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:shadow-lg transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border-2 border-blue-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2.5 rounded-xl shadow-md">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
              Recent Activity
            </h3>
          </div>
          
          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            {/* Total Certificates */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white px-4 py-2 rounded-xl shadow-md"
            >
              <FileCheck className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-medium opacity-90">Total Generated</div>
                <div className="text-lg font-bold">{totalCertificates}</div>
              </div>
            </motion.div>

            {/* Bulk Operations */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-700 dark:to-indigo-800 text-white px-4 py-2 rounded-xl shadow-md"
            >
              <Layers className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-medium opacity-90">Bulk Operations</div>
                <div className="text-lg font-bold">{bulkStats.operations}</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {activityLog.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-800 dark:to-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg font-medium">No recent activity</p>
            <p className="text-sm mt-2">Activity will appear here once certificates are created</p>
            <button
              onClick={fetchData}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {activityLog.map((log, index) => {
              const colors = getActivityColor(log.type);
              const icon = getActivityIcon(log.type);
              const isBulk = log.type.includes('bulk');

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className={`flex items-start gap-4 p-4 bg-gradient-to-r ${colors.bg} rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:scale-[1.01]`}
                >
                  {/* Icon */}
                  <div className={`${colors.icon} p-2 rounded-lg flex-shrink-0 shadow-sm`}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{log.action}</p>
                      {isBulk && log.count && (
                        <span className={`${colors.badge} text-xs font-medium px-2 py-0.5 rounded-full`}>
                          {log.count} certificates
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {log.user || log.id}
                      {log.admin && log.admin !== 'System' && (
                        <span className="ml-2 text-gray-500 dark:text-gray-500">• by {log.admin}</span>
                      )}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{log.time}</span>
                    <div className={`w-2 h-2 rounded-full ${colors.dot} shadow-lg`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Summary Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{activityLog.length}</span> recent activities
            </span>
            <button 
              onClick={fetchData}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Activity Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
              <span>Bulk Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm"></div>
              <span>Bulk Downloaded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>
              <span>Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-600 shadow-sm"></div>
              <span>Downloaded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
              <span>Deleted</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #6366f1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #4f46e5);
        }
        
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1e293b;
          }
        }
      `}</style>
    </div>
  );
}