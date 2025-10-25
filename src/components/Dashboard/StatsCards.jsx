'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, Download, Clock, RefreshCw, Layers, Package } from 'lucide-react';
import axios from 'axios';

const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(value * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};

const StatCard = ({ title, icon: Icon, total, mj, c4b, gradient, bg, iconBg, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`${bg} rounded-2xl shadow-lg p-6 border border-gray-200`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`${iconBg} p-3 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-gray-700 relative z-10`} />
      </div>
    </div>

    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

    <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
      <AnimatedCounter value={total} />
    </div>

    <div className="space-y-1 text-sm text-gray-600">
      <div className="flex justify-between">
        <span>• Marketing Junction:</span>
        <span className="font-semibold">{mj}</span>
      </div>
      <div className="flex justify-between">
        <span>• C4B:</span>
        <span className="font-semibold">{c4b}</span>
      </div>
    </div>
  </motion.div>
);

const BulkStatCard = ({ title, icon: Icon, operations, certificates, gradient, bg, iconBg, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`${bg} rounded-2xl shadow-lg p-6 border border-gray-200`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`${iconBg} p-3 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-gray-700 relative z-10`} />
      </div>
    </div>

    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>

    <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
      <AnimatedCounter value={operations} />
      <span className="text-sm text-gray-500 ml-2">ops</span>
    </div>

    <div className="space-y-1 text-sm text-gray-600">
      <div className="flex justify-between">
        <span>• Total Certificates:</span>
        <span className="font-semibold">{certificates}</span>
      </div>
      <div className="flex justify-between">
        <span>• Avg per operation:</span>
        <span className="font-semibold">
          {operations > 0 ? Math.round(certificates / operations) : 0}
        </span>
      </div>
    </div>
  </motion.div>
);

const CreationRatioCard = ({ individual, bulk, total, index }) => {
  const bulkPercentage = total > 0 ? Math.round((bulk / total) * 100) : 0;
  const individualPercentage = total > 0 ? Math.round((individual / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-indigo-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-indigo-100 p-3 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-gray-700 relative z-10" />
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-600 mb-2">Creation Ratio</h3>

      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-600 bg-clip-text text-transparent mb-3">
        <AnimatedCounter value={total} />
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Individual ({individualPercentage}%)</span>
            <span className="font-semibold">{individual}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${individualPercentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Bulk ({bulkPercentage}%)</span>
            <span className="font-semibold">{bulk}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${bulkPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function StatsCards() {
  const [stats, setStats] = useState([
    {
      title: 'Last 7 Days',
      icon: Calendar,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Last Month',
      icon: TrendingUp,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
    },
    {
      title: 'Downloaded',
      icon: Download,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Pending',
      icon: Clock,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-amber-500 to-red-500',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-100',
    },
  ]);

  const [bulkStats, setBulkStats] = useState({
    last7Days: { operations: 0, certificates: 0 },
    lastMonth: { operations: 0, certificates: 0 },
    downloads: { operations: 0, certificates: 0 },
  });

  const [creationRatio, setCreationRatio] = useState({
    individual: 0,
    bulk: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.get(`${API_URL}/api/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data.data;

      setStats([
        {
          title: 'Last 7 Days',
          icon: Calendar,
          total: data.last7Days?.total || 0,
          mj: data.last7Days?.marketingJunction || 0,
          c4b: data.last7Days?.code4bharat || 0,
          gradient: 'from-blue-500 to-blue-600',
          bg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
        },
        {
          title: 'Last Month',
          icon: TrendingUp,
          total: data.lastMonth?.total || 0,
          mj: data.lastMonth?.marketingJunction || 0,
          c4b: data.lastMonth?.code4bharat || 0,
          gradient: 'from-purple-500 to-purple-600',
          bg: 'bg-purple-50',
          iconBg: 'bg-purple-100',
        },
        {
          title: 'Downloaded',
          icon: Download,
          total: data.downloaded?.total || 0,
          mj: data.downloaded?.marketingJunction || 0,
          c4b: data.downloaded?.code4bharat || 0,
          gradient: 'from-green-500 to-green-600',
          bg: 'bg-green-50',
          iconBg: 'bg-green-100',
        },
        {
          title: 'Pending',
          icon: Clock,
          total: data.pending?.total || 0,
          mj: data.pending?.marketingJunction || 0,
          c4b: data.pending?.code4bharat || 0,
          gradient: 'from-amber-500 to-red-500',
          bg: 'bg-amber-50',
          iconBg: 'bg-amber-100',
        },
      ]);

      if (data.bulk) {
        setBulkStats(data.bulk);
      }

      if (data.creationRatio) {
        setCreationRatio(data.creationRatio);
      }

    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-2xl shadow-lg p-6 border border-gray-200 animate-pulse"
            >
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`bulk-${i}`}
              className="bg-gray-100 rounded-2xl shadow-lg p-6 border border-gray-200 animate-pulse"
            >
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Regular Stats - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Bulk Stats - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <BulkStatCard
          title="Bulk Generated (7D)"
          icon={Layers}
          operations={bulkStats.last7Days.operations}
          certificates={bulkStats.last7Days.certificates}
          gradient="from-cyan-500 to-cyan-600"
          bg="bg-cyan-50"
          iconBg="bg-cyan-100"
          index={0}
        />
        <BulkStatCard
          title="Bulk Generated (30D)"
          icon={Layers}
          operations={bulkStats.lastMonth.operations}
          certificates={bulkStats.lastMonth.certificates}
          gradient="from-teal-500 to-teal-600"
          bg="bg-teal-50"
          iconBg="bg-teal-100"
          index={1}
        />
        <BulkStatCard
          title="Bulk Downloads"
          icon={Download}
          operations={bulkStats.downloads.operations}
          certificates={bulkStats.downloads.certificates}
          gradient="from-emerald-500 to-emerald-600"
          bg="bg-emerald-50"
          iconBg="bg-emerald-100"
          index={2}
        />
        <CreationRatioCard
          individual={creationRatio.individual}
          bulk={creationRatio.bulk}
          total={creationRatio.total}
          index={3}
        />
      </div>
    </>
  );
}