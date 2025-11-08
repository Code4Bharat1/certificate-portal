'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  Code2, 
  Rocket, 
  GraduationCap, 
  Zap, 
  Users,
  AlertCircle,
  FileText,
  ArrowRight
} from 'lucide-react';

export default function CategoryOverview() {
  const router = useRouter();
  const [stats, setStats] = useState({
    'marketing-junction': {
      total: 0,
      downloaded: 0,
      pending: 0
    },
    'code4bharat': {
      total: 0,
      downloaded: 0,
      pending: 0
    },
    'BootCamp': {
      total: 0,
      downloaded: 0,
      pending: 0
    },
    'Bvoc': {
      total: 0,
      downloaded: 0,
      pending: 0
    },
    'FSD': {
      total: 0,
      downloaded: 0,
      pending: 0
    },
    'HR': {
      total: 0,
      downloaded: 0,
      pending: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      setLoading(true);
      const response = await axios.get(`${API_URL}/api/stats/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        setStats(response.data.data.categories);
        console.log(response.data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

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
      key: 'BootCamp',
      gradient: 'from-orange-500 via-red-500 to-pink-600',
      buttonTextColor: 'text-orange-600',
      route: '/certificates/bootcamp',
      icon: Rocket
    },
    {
      title: 'BVOC',
      key: 'Bvoc',
      gradient: 'from-violet-500 via-purple-600 to-indigo-600',
      buttonTextColor: 'text-violet-600',
      route: '/certificates/bvoc',
      icon: GraduationCap
    },
    {
      title: 'FSD',
      key: 'FSD',
      gradient: 'from-amber-500 via-yellow-600 to-orange-500',
      buttonTextColor: 'text-amber-600',
      route: '/certificates/fsd',
      icon: Zap
    },
    {
      title: 'HR',
      key: 'HR',
      gradient: 'from-rose-500 via-pink-600 to-fuchsia-600',
      buttonTextColor: 'text-rose-600',
      route: '/certificates/hr',
      icon: Users
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse rounded-3xl h-72 shadow-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-red-700 shadow-md">
        <div className="flex items-center gap-3">
          <AlertCircle size={28} />
          <div>
            <h3 className="font-bold text-lg">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Templates Management Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/templates')}
          className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 group"
        >
          <FileText size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          <span>Manage Templates</span>
          <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform duration-300" />
        </motion.button>
      </motion.div>

      {/* Category Cards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
      >
        {categories.map((category, index) => {
          const IconComponent = category.icon;
          
          return (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${category.gradient} rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden group`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Header with Icon */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">{category.title}</h3>
                  <IconComponent 
                    size={48} 
                    className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" 
                  />
                </div>

                {/* Stats */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all duration-300">
                    <span className="text-sm font-medium">Total Certificates</span>
                    <span className="text-2xl font-bold">{stats[category.key]?.total || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all duration-300">
                    <span className="text-sm font-medium">Downloaded</span>
                    <span className="text-2xl font-bold text-green-200">{stats[category.key]?.downloaded || 0}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/20 transition-all duration-300">
                    <span className="text-sm font-medium">Pending</span>
                    <span className="text-2xl font-bold text-yellow-200">{stats[category.key]?.pending || 0}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2 opacity-90">
                    <span>Progress</span>
                    <span>
                      {stats[category.key]?.total > 0 
                        ? Math.round((stats[category.key]?.downloaded / stats[category.key]?.total) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: stats[category.key]?.total > 0 
                          ? `${(stats[category.key]?.downloaded / stats[category.key]?.total) * 100}%` 
                          : '0%' 
                      }}
                      transition={{ delay: 0.5 + (0.1 * index), duration: 0.8, ease: "easeOut" }}
                      className="bg-white h-full rounded-full shadow-lg"
                    />
                  </div>
                </div>

                {/* Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(category.route)}
                  className={`w-full bg-white ${category.buttonTextColor} font-bold py-3 rounded-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 group/button`}
                >
                  <span>View All Details</span>
                  <ArrowRight size={20} className="group-hover/button:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}