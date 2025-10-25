'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

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
    },'FSD': {
      total: 0,
      downloaded: 0,
      pending: 0
    },'HR': {
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
      // Get auth token from sessionStorage
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-64"></div>
        ))}
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
    >
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Marketing Junction</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Total Certificates:</span>
            <span className="font-bold">{stats['marketing-junction'].total}</span>
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">{stats['marketing-junction'].downloaded}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">{stats['marketing-junction'].pending}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/certificates/marketing-junction')}
          className="w-full bg-white text-blue-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
        >
          View All
        </motion.button>
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">C4B</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Total Certificates:</span>
            <span className="font-bold">{stats['code4bharat'].total}</span>
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">{stats['code4bharat'].downloaded}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">{stats['code4bharat'].pending}</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/certificates/code4bharat')}
          className="w-full bg-white text-pink-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
        >
          View All
        </motion.button>
      </div>
      <div className="bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">BootCamp</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Total Certificates:</span>
            <span className="font-bold">1234</span>
            {/* <span className="font-bold">{stats['BootCamp'].total}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">1234</span>
            {/* <span className="font-bold">{stats['BootCamp'].downloaded}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">124</span>
            {/* <span className="font-bold">{stats['BootCamp'].pending}</span> */}
            
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/certificates/bootchamp')}
          className="w-full bg-white text-pink-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
        >
          View All
        </motion.button>
      </div>
      <div className="bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">BVOC</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Total Certificates:</span>
            <span className="font-bold">12345</span>
            {/* <span className="font-bold">{stats['Bvoc'].total}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">213</span>
            {/* <span className="font-bold">{stats['Bvoc'].downloaded}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">21345</span>
            {/* <span className="font-bold">{stats['Bvoc'].pending}</span> */}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/certificates/bvoc')}
          className="w-full bg-white text-pink-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
        >
          View All
        </motion.button>
      </div>
      <div className="bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">FSD</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Total Certificates:</span>
            <span className="font-bold">12345</span>
            {/* <span className="font-bold">{stats['FSD'].total}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">123456</span>
            {/* <span className="font-bold">{stats['FSD'].downloaded}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">123io</span>
            {/* <span className="font-bold">{stats['FSD'].pending}</span> */}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/certificates/fsd')}
          className="w-full bg-white text-pink-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
        >
          View All
        </motion.button>
      </div>
      <div className="bg-gradient-to-br from-indigo-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">HR</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Total Certificates:</span>
            <span className="font-bold">12345</span>
            {/* <span className="font-bold">{stats['FSD'].total}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">123456</span>
            {/* <span className="font-bold">{stats['FSD'].downloaded}</span> */}
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">123io</span>
            {/* <span className="font-bold">{stats['FSD'].pending}</span> */}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/certificates/hr')}
          className="w-full bg-white text-pink-600 font-semibold py-2 rounded-lg hover:bg-gray-100 transition"
        >
          View All
        </motion.button>
      </div>

    </motion.div>
  );
}