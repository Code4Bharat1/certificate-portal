'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Megaphone,
  Settings,
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
  dm,
  operations,
  monthlyReport,
  gradient,
  bg,
  iconBg,
  glowColor,
  index,
  router,
  categories
}) => {
  const getCategory = (key) => categories.find(cat => cat.key.toLowerCase() === key.toLowerCase());
  
  const createCategoryRow = (label, value, key, categoryGradient) => {
    const category = getCategory(key);
    return (
      <div 
        className="flex justify-between items-center p-2.5 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm"
        onClick={() => category && router.push(category.route)}
      >
        <span className="text-gray-700 dark:text-gray-300 font-medium">{label}:</span>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-lg ${value > 0 ? `bg-gradient-to-r ${categoryGradient} bg-clip-text text-transparent` : 'text-gray-400'}`}>
            {value}
          </span>
          {value > 0 && (
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-500 dark:text-orange-500" />
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
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`${bg} rounded-2xl shadow-lg p-6 border-2 ${glowColor} relative overflow-hidden group`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`${iconBg} p-3.5 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`}></div>
            <Icon className="w-6 h-6 text-gray-800 dark:text-white relative z-10" />
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">{title}</h3>

        <div className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-6 drop-shadow-sm`}>
          <AnimatedCounter value={total} />
        </div>

        <div className="space-y-2">
          {createCategoryRow("MJ", mj, "marketing-junction", "from-blue-600 to-cyan-500")}
          {createCategoryRow("C4B", c4b, "code4bharat", "from-orange-500 to-amber-500")}
          {createCategoryRow("FSD", fsd, "fsd", "from-blue-500 to-indigo-600")}
          {createCategoryRow("HR", hr, "hr", "from-orange-600 to-red-500")}
          {createCategoryRow("BOOTCAMP", bc, "bootcamp", "from-blue-600 to-purple-600")}
          {createCategoryRow("BVOC", bvoc, "bvoc", "from-orange-500 to-pink-600")}
          {createCategoryRow("DM", dm, "dm", "from-cyan-500 to-blue-600")}
          {createCategoryRow("Operations", operations, "operations", "from-gray-600 to-gray-800")}
        </div>
      </div>
    </motion.div>
  );
};

const BulkStatCard = ({ title, icon: Icon, operations, certificates, gradient, bg, iconBg, glowColor, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    className={`${bg} rounded-2xl shadow-lg p-6 border-2 ${glowColor} relative overflow-hidden group`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
    
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} p-3.5 rounded-xl flex items-center justify-center shadow-md relative overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`}></div>
          <Icon className="w-6 h-6 text-gray-800 dark:text-white relative z-10" />
        </div>
      </div>

      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">{title}</h3>

      <div className={`text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2 drop-shadow-sm`}>
        <AnimatedCounter value={operations} />
        <span className="text-lg text-gray-500 dark:text-gray-400 ml-2 font-medium">ops</span>
      </div>

      <div className="space-y-3 mt-4">
        <div className="flex justify-between items-center p-2.5 bg-white/50 dark:bg-gray-700/40 rounded-xl">
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Total Certificates</span>
          <span className={`font-bold text-xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {certificates}
          </span>
        </div>
        <div className="flex justify-between items-center p-2.5 bg-white/50 dark:bg-gray-700/40 rounded-xl">
          <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">Avg per operation</span>
          <span className={`font-bold text-xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {operations > 0 ? Math.round(certificates / operations) : 0}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

const CreationRatioCard = ({ individual, bulk, total, index }) => {
  let bulkPercentage = total > 0 ? Math.round((bulk / total) * 100) : 0;
  let individualPercentage = total > 0 ? Math.round((individual / total) * 100) : 0;

  if (bulkPercentage + individualPercentage > 100) {
    const sum = bulkPercentage + individualPercentage;
    bulkPercentage = Math.round((bulkPercentage / sum) * 100);
    individualPercentage = Math.round((individualPercentage / sum) * 100);
  }

  bulkPercentage = Math.max(0, Math.min(100, bulkPercentage));
  individualPercentage = Math.max(0, Math.min(100, individualPercentage));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 dark:from-slate-900 dark:via-blue-950 dark:to-orange-950 rounded-2xl shadow-lg p-6 border-2 border-blue-200 dark:border-blue-800 relative overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-orange-400 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gradient-to-br from-blue-500 to-orange-500 p-3.5 rounded-xl flex items-center justify-center shadow-md">
            <Package className="w-6 h-6 text-white relative z-10" />
          </div>
        </div>

        <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Creation Ratio</h3>

        <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent mb-6 drop-shadow-sm">
          <AnimatedCounter value={total} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Individual</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{individual}</span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {individualPercentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${individualPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full shadow-md relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bulk</span>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">{bulk}</span>
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 px-3 py-1 rounded-full">
                  {bulkPercentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700/50 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bulkPercentage}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full shadow-md relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </motion.div>
            </div>
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
      gradient: 'from-blue-600 via-blue-500 to-cyan-500',
      bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      glowColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Last Month',
      icon: TrendingUp,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-orange-600 via-orange-500 to-amber-500',
      bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      glowColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      title: 'Downloaded',
      icon: Download,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-blue-600 via-indigo-600 to-purple-600',
      bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-900',
      iconBg: 'bg-blue-100 dark:bg-blue-900/50',
      glowColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Pending',
      icon: Clock,
      total: 0,
      mj: 0,
      c4b: 0,
      gradient: 'from-orange-600 via-red-600 to-pink-600',
      bg: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 dark:from-orange-950 dark:via-red-950 dark:to-pink-900',
      iconBg: 'bg-orange-100 dark:bg-orange-900/50',
      glowColor: 'border-orange-200 dark:border-orange-800',
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
  
  const categories = [
    {
      title: 'Marketing Junction',
      key: 'marketing-junction',
      gradient: 'from-blue-600 to-cyan-500',
      buttonTextColor: 'text-blue-600',
      route: '/certificates/marketing-junction',
      icon: BarChart3
    },
    {
      title: 'Code4Bharat',
      key: 'code4bharat',
      gradient: 'from-orange-500 to-amber-500',
      buttonTextColor: 'text-orange-600',
      route: '/certificates/code4bharat',
      icon: Code2
    },
    {
      title: 'BootCamp',
      key: 'BootCamp',
      gradient: 'from-blue-600 to-purple-600',
      buttonTextColor: 'text-blue-600',
      route: '/certificates/bootcamp',
      icon: Rocket
    },
    {
      title: 'BVOC',
      key: 'BVOC',
      gradient: 'from-orange-500 to-pink-600',
      buttonTextColor: 'text-orange-600',
      route: '/certificates/bvoc',
      icon: GraduationCap
    },
    {
      title: 'FSD',
      key: 'FSD',
      gradient: 'from-blue-500 to-indigo-600',
      buttonTextColor: 'text-blue-600',
      route: '/certificates/fsd',
      icon: Zap
    },
    {
      title: 'HR',
      key: 'HR',
      gradient: 'from-orange-600 to-red-500',
      buttonTextColor: 'text-orange-600',
      route: '/certificates/hr',
      icon: Users
    },
    {
      title: 'Digital Marketing',
      key: 'DM',
      gradient: 'from-cyan-500 to-blue-600',
      buttonTextColor: 'text-cyan-600',
      route: '/certificates/dm',
      icon: Megaphone
    },
    {
      title: 'Operations Department',
      key: 'Operations',
      gradient: 'from-gray-600 to-gray-800',
      buttonTextColor: 'text-gray-600',
      route: '/certificates/operations',
      icon: Settings
    },
    {
      title: 'Monthly Report',
      key: 'MonthlyReport',
      gradient: 'from-teal-500 to-emerald-600',
      buttonTextColor: 'text-teal-600',
      route: '/certificates/monthly-report',
      icon: Calendar
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
          bc: data.last7Days?.BOOTCAMP || 0,
          bvoc: data.last7Days?.BVOC || 0,
          dm: data.last7Days?.DM || 0,
          operations: data.last7Days?.OD || 0,
          monthlyReport: data.last7Days?.MonthlyReport || 0,
          gradient: 'from-blue-600 via-blue-500 to-cyan-500',
          bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          glowColor: 'border-blue-200 dark:border-blue-800',
        },
        {
          title: 'Last Month',
          icon: TrendingUp,
          total: data.lastMonth?.total || 0,
          mj: data.lastMonth?.marketingJunction || 0,
          c4b: data.lastMonth?.code4bharat || 0,
          fsd: data.lastMonth?.FSD || 0,
          hr: data.lastMonth?.HR || 0,
          bc: data.lastMonth?.BOOTCAMP || 0,
          bvoc: data.lastMonth?.BVOC || 0,
          dm: data.lastMonth?.DM || 0,
          operations: data.lastMonth?.OD || 0,
          monthlyReport: data.lastMonth?.MonthlyReport || 0,
          gradient: 'from-orange-600 via-orange-500 to-amber-500',
          bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900',
          iconBg: 'bg-orange-100 dark:bg-orange-900/50',
          glowColor: 'border-orange-200 dark:border-orange-800',
        },
        {
          title: 'Downloaded',
          icon: Download,
          total: data.downloaded?.total || 0,
          mj: data.downloaded?.marketingJunction || 0,
          c4b: data.downloaded?.code4bharat || 0,
          fsd: data.downloaded?.FSD || 0,
          hr: data.downloaded?.HR || 0,
          bc: data.downloaded?.BOOTCAMP || 0,
          bvoc: data.downloaded?.BVOC || 0,
          dm: data.downloaded?.DM || 0,
          operations: data.downloaded?.OD || 0,
          monthlyReport: data.downloaded?.MonthlyReport || 0,
          gradient: 'from-blue-600 via-indigo-600 to-purple-600',
          bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-900',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          glowColor: 'border-blue-200 dark:border-blue-800',
        },
        {
          title: 'Pending',
          icon: Clock,
          total: data.pending?.total || 0,
          mj: data.pending?.marketingJunction || 0,
          c4b: data.pending?.code4bharat || 0,
          fsd: data.pending?.FSD || 0,
          hr: data.pending?.HR || 0,
          bc: data.pending?.BOOTCAMP || 0,
          bvoc: data.pending?.BVOC || 0,
          dm: data.pending?.DM || 0,
          operations: data.pending?.OD || 0,
          monthlyReport: data.pending?.MonthlyReport || 0,
          gradient: 'from-orange-600 via-red-600 to-pink-600',
          bg: 'bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 dark:from-orange-950 dark:via-red-950 dark:to-pink-900',
          iconBg: 'bg-orange-100 dark:bg-orange-900/50',
          glowColor: 'border-orange-200 dark:border-orange-800',
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
              className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border-2 border-gray-300 dark:border-gray-700 animate-pulse"
            >
              <div className="h-14 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-1/2"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={`bulk-${i}`}
              className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 border-2 border-gray-300 dark:border-gray-700 animate-pulse"
            >
              <div className="h-14 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-3 w-1/2"></div>
              <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-2 border-red-300 dark:border-red-700 rounded-2xl p-8 text-center shadow-lg">
        <div className="bg-red-100 dark:bg-red-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-red-700 dark:text-red-300 mb-6 text-lg font-semibold">{error}</p>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <RefreshCw className="w-5 h-5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <BulkStatCard
          title="Bulk Generated (7D)"
          icon={Layers}
          operations={bulkStats.last7Days.operations}
          certificates={bulkStats.last7Days.certificates}
          gradient="from-cyan-500 to-blue-600"
          bg="bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 dark:from-cyan-950 dark:via-blue-950 dark:to-cyan-900"
          iconBg="bg-cyan-100 dark:bg-cyan-900/50"
          glowColor="border-cyan-200 dark:border-cyan-800"
          index={0}
        />
        <BulkStatCard
          title="Bulk Generated (30D)"
          icon={Layers}
          operations={bulkStats.lastMonth.operations}
          certificates={bulkStats.lastMonth.certificates}
          gradient="from-orange-500 to-amber-600"
          bg="bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900"
          iconBg="bg-orange-100 dark:bg-orange-900/50"
          glowColor="border-orange-200 dark:border-orange-800"
          index={1}
        />
        <BulkStatCard
          title="Bulk Downloads"
          icon={Download}
          operations={bulkStats.downloads.operations}
          certificates={bulkStats.downloads.certificates}
          gradient="from-blue-600 to-indigo-600"
          bg="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 dark:from-blue-950 dark:via-indigo-950 dark:to-blue-900"
          iconBg="bg-blue-100 dark:bg-blue-900/50"
          glowColor="border-blue-200 dark:border-blue-800"
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