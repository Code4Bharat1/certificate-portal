'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CategoryOverview() {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Marketing Junction</h3>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span>Total Certificates:</span>
            <span className="font-bold">19</span>
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">12</span>
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">3</span>
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
            <span className="font-bold">32</span>
          </div>
          <div className="flex justify-between">
            <span>Downloaded:</span>
            <span className="font-bold">16</span>
          </div>
          <div className="flex justify-between">
            <span>Pending:</span>
            <span className="font-bold">4</span>
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
    </motion.div>
  );
}