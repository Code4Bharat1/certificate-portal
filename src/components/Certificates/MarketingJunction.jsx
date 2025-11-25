'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  FileText,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle,
  
  Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function MarketingJunctionPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [processingItem, setProcessingItem] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

  // ✅ Fetch certificates from backend
  useEffect(() => {
    const fetchCertificates = async () => {
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
              params: { category: 'marketing-junction' },
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

            setCertificates(combined);
          } else {
            toast.error('Failed to fetch certificates');
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Error fetching certificates');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [router]);

  // Sort items
  const sortedItems = [...certificates].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name?.localeCompare(b.name || '') || 0;
      case 'name-desc':
        return (b.name?.localeCompare(a.name || '') || 0);
      case 'date-asc':
        return new Date(a.createdAt || a.issueDate) - new Date(b.createdAt || b.issueDate);
      case 'date-desc':
      default:
        return new Date(b.createdAt || b.issueDate) - new Date(a.createdAt || a.issueDate);
    }
  });

  // ✅ Filtering logic (search + status)
  const filteredCertificates = sortedItems.filter(cert => {
    const search = searchTerm.trim().toLowerCase();

    const matchesSearch = !search ||
      (cert.name?.toLowerCase().includes(search)) ||
      (cert.certificateId?.toLowerCase().includes(search)) ||
      (cert.letterId?.toLowerCase().includes(search)) ||
      (cert.course?.toLowerCase().includes(search));

    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date-desc');
  };

  const handleDownloadPDF = async (cert) => {
    setProcessingItem(cert._id);
    console.log(cert);
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      let url = `${API_URL}/api/certificates/${cert._id}/download/pdf`;

      // Handle different endpoint for letters if needed
      if (cert.type === 'letter') {
        url = `${API_URL}/api/letters/${cert._id}/download.pdf`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${cert.name}_${cert.type || 'certificate'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Update status to 'downloaded' if it's not already
      if (cert.status !== 'downloaded') {
        await updateItemStatus(cert._id, 'downloaded', cert.type);
      }

      toast.success(`${cert.name}.pdf downloaded successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download PDF');
    } finally {
      setProcessingItem(null);
    }
  };

  const handleDownloadJPG = async (cert) => {
    setProcessingItem(cert._id);
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Skip if it's a letter
      if (cert.type === 'letter') {
        toast.error("JPG download is only available for certificates");
        setProcessingItem(null);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/certificates/${cert._id}/download/jpg`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'image/jpeg' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${cert.name}_certificate.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Update status to 'downloaded' if it's not already
      if (cert.status !== 'downloaded') {
        await updateItemStatus(cert._id, 'downloaded', cert.type);
      }

      toast.success(`${cert.name}.jpg downloaded successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to download JPG');
    } finally {
      setProcessingItem(null);
    }
  };

  // Update item status
  const updateItemStatus = async (id, status, type) => {
    try {
      const token = sessionStorage.getItem('authToken');

      let endpoint = '';
      if (type === 'letter') {
        endpoint = `${API_URL}/api/letters/${id}/status`;
      } else {
        endpoint = `${API_URL}/api/certificates/${id}/status`;
      }

      await axios.put(
        endpoint,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCertificates(
        certificates.map((item) => (item._id === id ? { ...item, status } : item))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const cert = certificates.find((item) => item._id === id);
      if (!cert) return;

      let endpoint = '';
      if (cert.type === 'letter') {
        endpoint = `${API_URL}/api/letters/${id}`;
      } else {
        endpoint = `${API_URL}/api/certificates/${id}`;
      }

      const response = await axios.delete(`${API_URL}/api/certificates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCertificates(certificates.filter(item => item._id !== id));
        // toast.success(`${item.type.charAt(0).toUpperCase() + item.type.slice(1)} deleted`);
        toast.success('Letter deleted successfully');
      } else {
        toast.error('Delete failed');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Stats
  const stats = {
    total: certificates.length,
    certificates: certificates.filter(item => item.type === 'certificate').length,
    letters: certificates.filter(item => item.type === 'letter').length,
    pending: certificates.filter(item => item.status === 'pending').length,
    downloaded: certificates.filter(item => item.status === 'downloaded').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
                aria-label="Go back to dashboard"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              <div>
                <h1 className="text-3xl font-bold">Marketing Junction</h1>
                <p className="text-blue-100">
                  Manage all marketing certificates & letters
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex flex-col items-center justify-center">
                <span className="text-sm text-blue-100">Total</span>
                <span className="text-xl font-bold">{stats.total}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex flex-col items-center justify-center">
                <span className="text-sm text-blue-100">Certificates</span>
                <span className="text-xl font-bold">{stats.certificates}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex flex-col items-center justify-center">
                <span className="text-sm text-blue-100">Letters</span>
                <span className="text-xl font-bold">{stats.letters}</span>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Row */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition md:w-auto"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </motion.button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black dark:text-white"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'downloaded', 'pending'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${statusFilter === status
                              ? status === 'downloaded'
                                ? 'bg-green-500 text-white'
                                : status === 'pending'
                                  ? 'bg-amber-500 text-white'
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                          <span className="ml-1 text-xs">
                            ({status === 'all'
                              ? certificates.length
                              : certificates.filter(it => it.status === status).length})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Loading...</h3>
            <p className="text-gray-600 dark:text-gray-400">Fetching all certificates and letters</p>
          </div>
        )}

        {/* Bottom Pagination/Summary */}
        {!loading && filteredCertificates.length > 0 && (
          <div className="mt-8 flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Showing <span className="font-semibold text-gray-800 dark:text-white">{filteredCertificates.length}</span> of {certificates.length} items
            </p>
            {filteredCertificates.length !== certificates.length && (
              <button
                onClick={clearFilters}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Certificates Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {filteredCertificates.map((cert, index) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 backdrop-blur-sm p-6 transition-all duration-300 flex flex-col"
              >
                {/* Card Header with Type Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">
                        {cert.name}
                      </h3>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cert.type === 'letter'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300'
                        }`}>
                        {cert.type === 'letter' ? 'Letter' : 'Certificate'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{cert.course}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${cert.status === 'downloaded'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400'
                      }`}
                  >
                    {cert.status === 'downloaded' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {cert.status || 'pending'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="space-y-3 mb-4 text-sm flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">{cert.type === 'letter' ? 'Letter ID:' : 'Certificate ID:'}</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-right break-all">
                      {cert.certificateId || cert.letterId || cert._id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      }) : '—'}
                    </span>
                  </div>
                  {it.type === 'letter' && it.letterType && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-gray-400">Type:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">
                        {it.letterType}
                        {it.letterSubType && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400 font-normal">
                            {it.letterSubType}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Signature Status (only for letters) */}
                  {it.type === 'letter' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Signature:</span>

                      {it.signedUploaded ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold">
                          <CheckCircle className="w-3 h-3" />
                          Uploaded
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-md text-xs font-semibold">
                          <AlertCircle className="w-3 h-3" />
                          Missing
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={processingItem === cert._id}
                    onClick={() => handleDownloadPDF(cert)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 dark:bg-blue-700 text-white py-2.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {processingItem === cert._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    PDF
                  </motion.button>

                  {cert.type !== 'letter' && (
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={processingItem === cert._id}
                      onClick={() => handleDownloadJPG(cert)}
                      className="flex-1 flex items-center justify-center gap-2 bg-purple-600 dark:bg-purple-700 text-white py-2.5 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {processingItem === cert._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      JPG
                    </motion.button>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDeleteConfirm(cert._id)}
                    className="p-2.5 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition flex items-center justify-center"
                    aria-label="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCertificates.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'all' ?
                "Try adjusting your filters or search criteria" :
                "No certificates or letters have been created yet"}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition inline-flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </motion.div>
        )}


      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  {(() => {
                    const item = certificates.find((x) => x._id === deleteConfirm);
                    return `${item?.type === 'letter' ? 'Delete Letter?' : 'Delete Certificate?'}`;
                  })()}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this {certificates.find((x) => x._id === deleteConfirm)?.type || 'item'}? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-red-500 dark:bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-600 dark:hover:bg-red-700 transition"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}