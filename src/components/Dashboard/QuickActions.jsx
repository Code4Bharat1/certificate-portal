'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuickActions() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verifyId, setVerifyId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [certForm, setCertForm] = useState({
    name: '',
    category: '',
    date: '',
  });

  const handleVerify = () => {
    if (!verifyId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    const isValid = Math.random() > 0.3;
    setVerificationResult({
      valid: isValid,
      id: verifyId,
      name: isValid ? 'John Doe' : null,
      date: isValid ? '2025-10-15' : null,
      category: isValid ? 'Marketing Junction' : null
    });

    if (isValid) {
      toast.success('Certificate verified successfully!');
    } else {
      toast.error('Invalid certificate!');
    }
  };

  const handleCreateCertificate = () => {
    if (!certForm.name || !certForm.category || !certForm.date) {
      toast.error('Please fill all fields');
      return;
    }
    toast.success('Certificate created successfully!');
    setShowCreateModal(false);
    setCertForm({ name: '', category: '', date: ''});
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition"
          >
            <PlusCircle className="w-6 h-6" />
            Create Certificate
          </motion.button>

          <div className="flex gap-2">
            <input
              type="text"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Enter Certificate ID"
              className="flex-1 px-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVerify}
              className="px-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Verify
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`${verificationResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border-2 rounded-xl p-6`}
            >
              <div className="flex items-start gap-4">
                {verificationResult.valid ? (
                  <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${verificationResult.valid ? 'text-green-800' : 'text-red-800'} mb-2`}>
                    {verificationResult.valid ? 'Valid Certificate' : 'Invalid Certificate'}
                  </h3>
                  {verificationResult.valid && (
                    <div className="space-y-1 text-sm text-gray-700">
                      <p><strong>ID:</strong> {verificationResult.id}</p>
                      <p><strong>Name:</strong> {verificationResult.name}</p>
                      <p><strong>Date:</strong> {verificationResult.date}</p>
                      <p><strong>Category:</strong> {verificationResult.category}</p>
                    </div>
                  )}
                  {!verificationResult.valid && (
                    <p className="text-sm text-red-700">Certificate ID not found in the system.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Certificate</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={certForm.name}
                    onChange={(e) => setCertForm({...certForm, name: e.target.value})}
                    className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <input 
                    type="text" 
                    value={certForm.course}
                    onChange={(e) => setCertForm({...certForm, course: e.target.value})}
                    className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div> */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    value={certForm.category}
                    onChange={(e) => setCertForm({...certForm, category: e.target.value})}
                    className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="mj">Marketing Junction</option>
                    <option value="c4b">Code4Bharat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={certForm.date}
                    onChange={(e) => setCertForm({...certForm, date: e.target.value})}
                    className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certificate ID</label>
                  <input 
                    type="text" 
                    value={certForm.id}
                    onChange={(e) => setCertForm({...certForm, id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div> */}
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleCreateCertificate}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition"
                  >
                    Create
                  </button>
                  <button 
                    onClick={() => setShowCreateModal(false)} 
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}