'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Download, 
  Clock, 
  RefreshCw, 
  Layers, 
  Package,
  BarChart3,
  Code2,
  Rocket,
  GraduationCap,
  Zap,
  Users,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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

const StatCard = ({
  title,
  icon: Icon,
  total,
  mj,
  c4b,
  fsd,
  hr,
  bc,
  bvoc,
  gradient,
  bg,
  iconBg,
  index,
  router,
  categories
}) => {
  // Find the category data that matches this card
  const getCategory = (key) => categories.find(cat => cat.key.toLowerCase() === key.toLowerCase());
  
  // Create clickable sections for each category
  const createCategoryRow = (label, value, key) => {
    const category = getCategory(key);
    return (
      <div 
        className="flex justify-between items-center p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors group"
        onClick={() => category && router.push(category.route)}
      >
        <span>{label}:</span>
        <div className="flex items-center">
          <span className={`font-semibold ${value > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
            {value}
          </span>
          {value > 0 && (
            <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500" />
          )}
        </div>
      </div>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`${bg} rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} p-3 rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-gray-700 dark:text-gray-200 relative z-10" />
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</h3>

      <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-4`}>
        <AnimatedCounter value={total} />
      </div>

      {/* Category Stats Grid with Clickable Rows */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
        {createCategoryRow("MJ", mj, "marketing-junction")}
        {createCategoryRow("C4B", c4b, "code4bharat")}
        {createCategoryRow("FSD", fsd, "fsd")}
        {createCategoryRow("HR", hr, "hr")}
        {createCategoryRow("BOOTCAMP", bc, "bootcamp")}
        {createCategoryRow("BVOC", bvoc, "bvoc")}
      </div>
    </motion.div>
  );
};

const BulkStatCard = ({ title, icon: Icon, operations, certificates, gradient, bg, iconBg, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`${bg} rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`${iconBg} p-3 rounded-xl flex items-center justify-center`}>
        <Icon className={`w-6 h-6 text-gray-700 dark:text-gray-200 relative z-10`} />
      </div>
    </div>

    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</h3>

    <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-3`}>
      <AnimatedCounter value={operations} />
      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">ops</span>
    </div>

    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
  let bulkPercentage = total > 0 ? Math.round((bulk / total) * 100) : 0;
  let individualPercentage = total > 0 ? Math.round((individual / total) * 100) : 0;

  // ✅ Ensure total ratio never exceeds 100%
  if (bulkPercentage + individualPercentage > 100) {
    const sum = bulkPercentage + individualPercentage;
    bulkPercentage = Math.round((bulkPercentage / sum) * 100);
    individualPercentage = Math.round((individualPercentage / sum) * 100);
  }

  // ✅ Ensure no negative or weird values
  bulkPercentage = Math.max(0, Math.min(100, bulkPercentage));
  individualPercentage = Math.max(0, Math.min(100, individualPercentage));


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-indigo-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl flex items-center justify-center">
          <Package className="w-6 h-6 text-gray-700 dark:text-gray-200 relative z-10" />
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Creation Ratio</h3>

      <div className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-pink-600 bg-clip-text text-transparent mb-3">
        <AnimatedCounter value={total} />
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Individual ({individualPercentage}%)</span>
            <span className="font-semibold">{individual}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${individualPercentage}%` }}
            ></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
            <span>Bulk ({bulkPercentage}%)</span>
            <span className="font-semibold">{bulk}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
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
  const router = useRouter();
  const [stats, setStats] = useState([
    {
      title: 'Last 7 Days',
      icon: Calendar,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    },
    {
      title: 'Last Month',
      icon: TrendingUp,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-900/50',
    },
    {
      title: 'Downloaded',
      icon: Download,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-100 dark:bg-green-900/50',
    },
    {
      title: 'Pending',
      icon: Clock,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-amber-500 to-red-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50',
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
  
  // Categories configuration
  const categories = [
    {
      title: 'Marketing Junction',
      key: 'marketing-junction',
      gradient: 'from-blue-500 via-blue-600 to-purple-600',
      buttonTextColor: 'text-blue-600',
      route: '/certificates/marketing-junction',
      icon: BarChart3
    },
    {
      title: 'Code4Bharat',
      key: 'code4bharat',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      buttonTextColor: 'text-emerald-600',
      route: '/certificates/code4bharat',
      icon: Code2
    },
    {
      title: 'BootCamp',
      key: 'bootcamp',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      buttonTextColor: 'text-orange-600',
      route: '/certificates/bootcamp',
      icon: Rocket
    },
    {
      title: 'BVOC',
      key: 'bvoc',
      gradient: 'from-violet-500 via-purple-600 to-indigo-600',
      buttonTextColor: 'text-violet-600',
      route: '/certificates/bvoc',
      icon: GraduationCap
    },
    {
      title: 'FSD',
      key: 'fsd',
      gradient: 'from-amber-500 via-yellow-600 to-orange-500',
      buttonTextColor: 'text-amber-600',
      route: '/certificates/fsd',
      icon: Zap
    },
    {
      title: 'HR',
      key: 'hr',
      gradient: 'from-rose-500 via-pink-600 to-fuchsia-600',
      buttonTextColor: 'text-rose-600',
      route: '/certificates/hr',
      icon: Users
    }
  ];

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
          fsd: data.last7Days?.FSD || 0,
          hr: data.last7Days?.HR || 0,
          bootcamp: data.last7Days?.BOOTCAMP || 0,
          bvoc: data.last7Days?.BVOC || 0,
          gradient: 'from-blue-500 to-blue-600',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        },
        {
          title: 'Last Month',
          icon: TrendingUp,
          total: data.lastMonth?.total || 0,
          mj: data.lastMonth?.marketingJunction || 0,
          c4b: data.lastMonth?.code4bharat || 0,
          fsd: data.lastMonth?.FSD || 0,
          hr: data.lastMonth?.HR || 0,
          bootcamp: data.lastMonth?.BOOTCAMP || 0,
          bvoc: data.lastMonth?.BVOC || 0,
          gradient: 'from-purple-500 to-purple-600',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          iconBg: 'bg-purple-100 dark:bg-purple-900/50',
        },
        {
          title: 'Downloaded',
          icon: Download,
          total: data.downloaded?.total || 0,
          mj: data.downloaded?.marketingJunction || 0,
          c4b: data.downloaded?.code4bharat || 0,
          fsd: data.downloaded?.FSD || 0,
          hr: data.downloaded?.HR || 0,
          bootcamp: data.downloaded?.BOOTCAMP || 0,
          bvoc: data.downloaded?.BVOC || 0,
          gradient: 'from-green-500 to-green-600',
          bg: 'bg-green-50 dark:bg-green-900/20',
          iconBg: 'bg-green-100 dark:bg-green-900/50',
        },
        {
          title: 'Pending',
          icon: Clock,
          total: data.pending?.total || 0,
          mj: data.pending?.marketingJunction || 0,
          c4b: data.pending?.code4bharat || 0,
          fsd: data.pending?.FSD || 0,
          hr: data.pending?.HR || 0,
          bootcamp: data.pending?.BOOTCAMP || 0,
          bvoc: data.pending?.BVOC || 0,
          gradient: 'from-amber-500 to-red-500',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          iconBg: 'bg-amber-100 dark:bg-amber-900/50',
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
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`bulk-${i}`}
              className="bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
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
          <StatCard 
            key={stat.title} 
            {...stat} 
            index={index} 
            router={router}
            categories={categories}
          />
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
          bg="bg-cyan-50 dark:bg-cyan-900/20"
          iconBg="bg-cyan-100 dark:bg-cyan-900/50"
          index={0}
        />
        <BulkStatCard
          title="Bulk Generated (30D)"
          icon={Layers}
          operations={bulkStats.lastMonth.operations}
          certificates={bulkStats.lastMonth.certificates}
          gradient="from-teal-500 to-teal-600"
          bg="bg-teal-50 dark:bg-teal-900/20"
          iconBg="bg-teal-100 dark:bg-teal-900/50"
          index={1}
        />
        <BulkStatCard
          title="Bulk Downloads"
          icon={Download}
          operations={bulkStats.downloads.operations}
          certificates={bulkStats.downloads.certificates}
          gradient="from-emerald-500 to-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-900/20"
          iconBg="bg-emerald-100 dark:bg-emerald-900/50"
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