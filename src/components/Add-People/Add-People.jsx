'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios'; // <-- Axios import

export default function AddPeople() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    batch: '',
    phone: '',
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value, batch: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!formData.name || !formData.category || !formData.phone) {
      toast.error('Please fill all required fields');
      return;
    }

    const categoryNeedsBatch = ['FSD', 'BVOC'].includes(formData.category);
    if (categoryNeedsBatch && !formData.batch) {
      toast.error('Please select a batch');
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/people`,
        formData,
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      console.log(res);
      

      if (res.data.success || res.status === 201) {
        toast.success('Person added successfully!');
        setFormData({ name: '', category: '', batch: '', phone: '' });
      } else {
        toast.error(res.data.message || 'Failed to add person');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const getBatchOptions = () => {
    if (formData.category === 'FSD') return ['B-1', 'B-2', 'B-3', 'B-4'];
    if (formData.category === 'BVOC') return ['B-1', 'B-2'];
    return [];
  };

  return (
    <div className="min-h-screen text-black flex items-center justify-center bg-gradient-to-br from-white to-gray-100 p-6">
      <Toaster />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-800">Add People</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Enter name"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Select category</option>
              <option value="code4bharat">Code4Bharat</option>
              <option value="marketing-junction">Marketing Junction</option>
              <option value="FSD">FSD</option>
              <option value="BVOC">BVOC</option>
              <option value="HR">HR</option>
            </select>
          </div>

          {/* Batch */}
          {getBatchOptions().length > 0 && (
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Batch</label>
              <select
                name="batch"
                value={formData.batch}
                onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="">Select batch</option>
                {getBatchOptions().map((batch, idx) => (
                  <option key={idx} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
              placeholder="Enter phone number"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <CheckCircle className="w-6 h-6" />
            Add Person
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
