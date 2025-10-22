'use client';

import { motion } from 'framer-motion';
import { Activity, BarChart3 } from 'lucide-react';

const activityLog = [
  { action: 'Certificate Created', user: 'John Doe', time: '2 mins ago', type: 'create' },
  { action: 'Certificate Verified', id: 'CERT-1234', time: '15 mins ago', type: 'verify' },
  { action: 'Certificate Downloaded', user: 'Jane Smith', time: '1 hour ago', type: 'download' },
  { action: 'Certificate Created', user: 'Mike Wilson', time: '2 hours ago', type: 'create' },
  { action: 'Certificate Verified', id: 'CERT-5678', time: '3 hours ago', type: 'verify' }
];

export default function ActivityChart() {
  const chartData = { mj: 12, c4b: 16 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
        </div>
        <div className="space-y-3">
          {activityLog.map((log, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${
                log.type === 'create' ? 'bg-blue-500' :
                log.type === 'verify' ? 'bg-green-500' :
                'bg-purple-500'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{log.action}</p>
                <p className="text-xs text-gray-600">{log.user || log.id}</p>
              </div>
              <span className="text-xs text-gray-500">{log.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Category Distribution</h3>
        </div>
        <div className="h-48 flex items-end justify-around gap-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(chartData.mj / 28) * 100}%` }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg flex items-end justify-center pb-2"
            >
              <span className="text-white font-bold">{chartData.mj}</span>
            </motion.div>
            <span className="text-sm font-medium text-gray-700">Marketing Junction</span>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(chartData.c4b / 28) * 100}%` }}
              transition={{ delay: 1, duration: 0.8 }}
              className="w-full bg-gradient-to-t from-indigo-500 to-pink-500 rounded-t-lg flex items-end justify-center pb-2"
            >
              <span className="text-white font-bold">{chartData.c4b}</span>
            </motion.div>
            <span className="text-sm font-medium text-gray-700">C4B</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}