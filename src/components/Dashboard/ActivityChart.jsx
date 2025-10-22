'use client';

import { motion } from 'framer-motion';
import { Activity, FileCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ActivityChart() {
  const [activityLog, setActivityLog] = useState([]);
  const [totalCertificates, setTotalCertificates] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get auth token from sessionStorage
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;
      setLoading(true);
      
      // Fetch both activity log and statistics
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
        const categories = statsResponse.data.data.categories;
        const mjTotal = categories['marketing-junction']?.total || 0;
        const c4bTotal = categories['code4bharat']?.total || 0;
        setTotalCertificates(mjTotal + c4bTotal);
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
          </div>
          
          {/* Total Certificates Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-lg shadow-md"
          >
            <FileCheck className="w-5 h-5" />
            <div className="text-left">
              <div className="text-xs font-medium opacity-90">Total Generated</div>
              <div className="text-lg font-bold">{totalCertificates}</div>
            </div>
          </motion.div>
        </div>
        
        {activityLog.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {activityLog.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition-shadow border border-gray-200"
              >
                <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                  log.type === 'created' ? 'bg-blue-500 shadow-lg shadow-blue-500/50' :
                  log.type === 'verified' ? 'bg-green-500 shadow-lg shadow-green-500/50' :
                  log.type === 'downloaded' ? 'bg-purple-500 shadow-lg shadow-purple-500/50' :
                  'bg-gray-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{log.action}</p>
                  <p className="text-xs text-gray-600 truncate">{log.user || log.id}</p>
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{log.time}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600"
        >
          <span>Showing {activityLog.length} recent activities</span>
          <button 
            onClick={fetchData}
            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
          >
            Refresh
          </button>
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