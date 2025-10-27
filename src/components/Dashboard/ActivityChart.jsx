'use client';

import { motion } from 'framer-motion';
import { Activity, FileCheck, Layers, Download, Edit, Trash2, Plus, Package } from 'lucide-react';
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
    // case 'updated':
    //   return <Edit className="w-4 h-4" />;
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
        bg: 'from-cyan-50 to-cyan-100',
        dot: 'bg-cyan-500 shadow-cyan-500/50',
        icon: 'bg-cyan-100 text-cyan-600',
        badge: 'bg-cyan-100 text-cyan-700'
      };
    case 'bulk_downloaded':
      return {
        bg: 'from-emerald-50 to-emerald-100',
        dot: 'bg-emerald-500 shadow-emerald-500/50',
        icon: 'bg-emerald-100 text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700'
      };
    case 'created':
      return {
        bg: 'from-blue-50 to-blue-100',
        dot: 'bg-blue-500 shadow-blue-500/50',
        icon: 'bg-blue-100 text-blue-600',
        badge: 'bg-blue-100 text-blue-700'
      };
    case 'downloaded':
      return {
        bg: 'from-purple-50 to-purple-100',
        dot: 'bg-purple-500 shadow-purple-500/50',
        icon: 'bg-purple-100 text-purple-600',
        badge: 'bg-purple-100 text-purple-700'
      };
    // case 'updated':
    //   return {
    //     bg: 'from-amber-50 to-amber-100',
    //     dot: 'bg-amber-500 shadow-amber-500/50',
    //     icon: 'bg-amber-100 text-amber-600',
    //     badge: 'bg-amber-100 text-amber-700'
    //   };
    case 'deleted':
      return {
        bg: 'from-red-50 to-red-100',
        dot: 'bg-red-500 shadow-red-500/50',
        icon: 'bg-red-100 text-red-600',
        badge: 'bg-red-100 text-red-700'
      };
    default:
      return {
        bg: 'from-gray-50 to-gray-100',
        dot: 'bg-gray-500 shadow-gray-500/50',
        icon: 'bg-gray-100 text-gray-600',
        badge: 'bg-gray-100 text-gray-700'
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
      setLoading(true);
      
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

      if (activityResponse.data.success) {
        setActivityLog(activityResponse.data.data);
      }

      if (statsResponse.data.success) {
        const data = statsResponse.data.data;
        const categories = data.categories;
        const mjTotal = categories['marketing-junction']?.total || 0;
        const c4bTotal = categories['code4bharat']?.total || 0;
        setTotalCertificates(mjTotal + c4bTotal);

        // Calculate total bulk stats
        if (data.bulk) {
          const totalBulkOps = data.bulk.lastMonth.operations + data.bulk.downloads.operations;
          const totalBulkCerts = data.bulk.lastMonth.certificates + data.bulk.downloads.certificates;
          setBulkStats({
            operations: totalBulkOps,
            certificates: totalBulkCerts
          });
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load activity data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="bg-gray-200 animate-pulse rounded-2xl h-96"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
          </div>
          
          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            {/* Total Certificates */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md"
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
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-md"
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
          <div className="text-center py-12 text-gray-500">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 opacity-30" />
            </div>
            <p className="text-lg font-medium">No recent activity</p>
            <p className="text-sm mt-2">Activity will appear here once certificates are created</p>
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
                  className={`flex items-start gap-4 p-4 bg-gradient-to-r ${colors.bg} rounded-xl hover:shadow-md transition-all duration-200 border border-gray-200 hover:scale-[1.01]`}
                >
                  {/* Icon */}
                  <div className={`${colors.icon} p-2 rounded-lg flex-shrink-0`}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                      {isBulk && log.count && (
                        <span className={`${colors.badge} text-xs font-medium px-2 py-0.5 rounded-full`}>
                          {log.count} certificates
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {log.user || log.id}
                      {log.admin && log.admin !== 'System' && (
                        <span className="ml-2 text-gray-500">• by {log.admin}</span>
                      )}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{log.time}</span>
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
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="text-gray-600">
              Showing <span className="font-semibold text-gray-800">{activityLog.length}</span> recent activities
            </span>
            <button 
              onClick={fetchData}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors flex items-center gap-1"
            >
              <Activity className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Activity Legend */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
              <span>Bulk Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Bulk Downloaded</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Created</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span>Downloaded</span>
            </div>
            {/* <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <span>Updated</span>
            </div> */}
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
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
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}