'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, FileText, Trash2, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Mock data for Marketing Junction certificates
const mockCertificates = [
  { id: 'MJ-001', name: 'John Doe', course: 'Digital Marketing', date: '2025-10-15', status: 'downloaded' },
  { id: 'MJ-002', name: 'Jane Smith', course: 'Social Media Marketing', date: '2025-10-14', status: 'pending' },
  { id: 'MJ-003', name: 'Mike Johnson', course: 'SEO Fundamentals', date: '2025-10-13', status: 'downloaded' },
  { id: 'MJ-004', name: 'Sarah Williams', course: 'Content Marketing', date: '2025-10-12', status: 'downloaded' },
  { id: 'MJ-005', name: 'David Brown', course: 'Email Marketing', date: '2025-10-11', status: 'pending' },
  { id: 'MJ-006', name: 'Emily Davis', course: 'Marketing Analytics', date: '2025-10-10', status: 'downloaded' },
  { id: 'MJ-007', name: 'Chris Wilson', course: 'Brand Management', date: '2025-10-09', status: 'pending' },
  { id: 'MJ-008', name: 'Lisa Anderson', course: 'Influencer Marketing', date: '2025-10-08', status: 'downloaded' },
];

export default function MarketingJunctionPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState(mockCertificates);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuthenticated = sessionStorage.getItem('isAuthenticated');
      if (!isAuthenticated) {
        router.push('/login');
      }
    }
  }, [router]);

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPDF = (cert) => {
    toast.success(`Downloading ${cert.name}.pdf`);
    console.log(`Downloading PDF for ${cert.name}`);
  };

  const handleDownloadJPG = (cert) => {
    toast.success(`Downloading ${cert.name}.jpg`);
    console.log(`Downloading JPG for ${cert.name}`);
  };

  const handleDelete = (id) => {
    setCertificates(certificates.filter(cert => cert.id !== id));
    toast.success('Certificate deleted successfully');
    setDeleteConfirm(null);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return certificates.length;
    return certificates.filter(cert => cert.status === status).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold">Marketing Junction</h1>
                <p className="text-blue-100 text-sm">Manage all marketing certificates</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">{certificates.length} Certificates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white shadow-sm"
            />
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex gap-3 flex-wrap"
        >
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All ({getStatusCount('all')})
          </button>
          <button
            onClick={() => setStatusFilter('downloaded')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${
              statusFilter === 'downloaded'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Downloaded ({getStatusCount('downloaded')})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${
              statusFilter === 'pending'
                ? 'bg-amber-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending ({getStatusCount('pending')})
          </button>
        </motion.div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCertificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.course}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  cert.status === 'downloaded' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {cert.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Certificate ID:</span>
                  <span className="font-semibold text-gray-800">{cert.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-semibold text-gray-800">{cert.date}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadPDF(cert)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadJPG(cert)}
                  className="flex-1 flex items-center justify-center gap-2 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  JPG
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(cert.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No certificates found</h3>
            <p className="text-gray-600">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Delete Certificate?</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this certificate? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}