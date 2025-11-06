'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, FileText, Trash2, Search } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function Code4BharatPage() {
  const router = useRouter();
  const [items, setItems] = useState([]); // contains both certificates & letters
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

  // Fetch certificates + letters from backend
  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = sessionStorage.getItem('authToken');
          if (!token) {
            router.push('/login');
            return;
          }

          const res = await axios.get(
            `${API_URL}/api/certificates`,
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { category: 'code4bharat' },
            }
          );

          if (res.data.success) {
            // defend against missing arrays
            const certificates = Array.isArray(res.data.data) ? res.data.data : [];
            const letters = Array.isArray(res.data.letters) ? res.data.letters : [];

            const combined = [
              ...certificates.map((c) => ({ ...c, type: 'certificate' })),
              ...letters.map((l) => ({ ...l, type: 'letter' })),
            ];

            // keep newest first (api already sorts but safe)
            combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setItems(combined);
          } else {
            toast.error('Failed to fetch certificates and letters');
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Error fetching certificates and letters');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [router, API_URL]);

  // Filter logic (search + status)
  const filteredItems = items.filter((it) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !search ||
      (it.name && it.name.toLowerCase().includes(search)) ||
      (it.certificateId && it.certificateId.toLowerCase().includes(search)) ||
      (it.letterId && it.letterId.toLowerCase().includes(search)) ||
      (it.course && it.course.toLowerCase().includes(search));

    const matchesStatus = statusFilter === 'all' || it.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Helper: base path depending on type
  const apiBaseFor = (it) => (it.type === 'letter' ? 'letters' : 'certificates');

  // Download PDF (works for both)
  const handleDownloadPDF = async (it) => {
    try {
      toast.success(`Downloading ${it.name}.pdf`);
      const token = sessionStorage.getItem('authToken');
      let response;
      console.log(it.type);

      if (it.type === "certificate") {
        response = await axios.get(
          `${API_URL}/api/certificates/${it._id}/download/pdf`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          }
        );
      }
      else {
        response = await axios.get(
          `${API_URL}/api/letters/${it._id}/download.pdf`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          }
        );
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // include type in filename to avoid collisions
      a.download = `${it.name}-${it.type}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF');
    }
  };

  // Download JPG (works for both)
  const handleDownloadJPG = async (it) => {
    try {
      toast.success(`Downloading ${it.name}.jpg`);
      const token = sessionStorage.getItem('authToken');
      let response;
      if (it.type === "certificate") {
        response = await axios.get(
          `${API_URL}/api/certificates/${it._id}/download/jpg`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          }
        );
      }
      else {
        response = await axios.get(
          `${API_URL}/api/letters/${it._id}/download.jpg`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          }
        );
      }

      const blob = new Blob([response.data], { type: 'image/jpeg' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${it.name}-${it.type}.jpg`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download JPG');
    }
  };

  // Delete (works for both)
  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem('authToken');
      // find item to know its type
      const it = items.find((x) => x._id === id);
      // const base = it ? apiBaseFor(it) : 'certificates';
      await axios.delete(`${API_URL}/api/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.filter((x) => x._id !== id));
      toast.success(`${it?.type === 'letter' ? 'Letter' : 'Certificate'} deleted successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete');
    }
    setDeleteConfirm(null);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return items.length;
    return items.filter((it) => it.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading certificates & letters...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg">
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
                <h1 className="text-3xl font-bold">Code4Bharat</h1>
                <p className="text-indigo-100 text-sm">Manage all Code4Bharat certificates & letters</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <FileText className="w-5 h-5" />
              <span className="font-semibold">{items.length} Items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, ID, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${statusFilter === 'all'
              ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            All ({getStatusCount('all')})
          </button>
          <button
            onClick={() => setStatusFilter('downloaded')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${statusFilter === 'downloaded'
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Downloaded ({getStatusCount('downloaded')})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${statusFilter === 'pending'
              ? 'bg-amber-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            Pending ({getStatusCount('pending')})
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((it, index) => (
            <motion.div
              key={it._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">{it.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-semibold">
                      {/* {it.type === 'letter' ? 'Letter' : 'Certificate'} */}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{it.course}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 ${it.status === 'downloaded'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                    }`}
                >
                  {it.status || 'pending'}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-sm flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{it.type === 'letter' ? 'Letter ID:' : 'Certificate ID:'}</span>
                  <span className="font-semibold text-gray-800 text-right break-all">
                    {it.type === 'letter' ? (it.letterId || it.lettertId || it.certificateId || it._id) : (it.certificateId || it.letterId || it._id)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-semibold text-gray-800">
                    {it.issueDate ? new Date(it.issueDate).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDownloadPDF(it)}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-500 text-white py-2.5 rounded-lg hover:bg-indigo-600 transition text-sm font-semibold"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </motion.button>

                {it.type !== 'letter' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownloadJPG(it)}
                    className="flex-1 flex items-center justify-center gap-2 bg-pink-500 text-white py-2.5 rounded-lg hover:bg-pink-600 transition text-sm font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    JPG
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDeleteConfirm(it._id)}
                  className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>

            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
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
                {/* find the item being deleted to show proper text */}
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {(() => {
                    const it = items.find((x) => x._id === deleteConfirm);
                    return `${it?.type === 'letter' ? 'Delete Letter?' : 'Delete Certificate?'}`;
                  })()}
                </h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this {items.find((x) => x._id === deleteConfirm)?.type || 'item'}? This action cannot be undone.
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
