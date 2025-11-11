"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  ChevronDown, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Settings
} from 'lucide-react';

export default function OperationsPage() {
  const router = useRouter();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [processingItem, setProcessingItem] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');

  useEffect(() => {
    // Simulate data fetch
    setTimeout(() => {
      setCertificates([
        {
          _id: '1',
          name: 'Sarah Johnson',
          course: 'Operations Management',
          certificateId: 'OPS2024001',
          issueDate: '2024-03-10',
          status: 'downloaded',
          type: 'certificate'
        },
        {
          _id: '2',
          name: 'Michael Brown',
          course: 'Supply Chain Basics',
          certificateId: 'OPS2024002',
          issueDate: '2024-03-25',
          status: 'pending',
          type: 'certificate'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const sortedItems = [...certificates].sort((a, b) => {
    switch(sortBy) {
      case 'name-asc':
        return a.name?.localeCompare(b.name || '') || 0;
      case 'name-desc':
        return (b.name?.localeCompare(a.name || '') || 0);
      case 'date-asc':
        return new Date(a.issueDate) - new Date(b.issueDate);
      case 'date-desc':
      default:
        return new Date(b.issueDate) - new Date(a.issueDate);
    }
  });

  const filteredCertificates = sortedItems.filter(cert => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch = !search || 
      (cert.name?.toLowerCase().includes(search)) ||
      (cert.certificateId?.toLowerCase().includes(search)) ||
      (cert.course?.toLowerCase().includes(search));
    const matchesStatus = statusFilter === 'all' || cert.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('date-desc');
  };

  const stats = {
    total: certificates.length,
    certificates: certificates.filter(item => item.type === 'certificate').length,
    letters: certificates.filter(item => item.type === 'letter').length,
    pending: certificates.filter(item => item.status === 'pending').length,
    downloaded: certificates.filter(item => item.status === 'downloaded').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with Gray/Slate gradient */}
      <div className="bg-gradient-to-r from-gray-500 via-slate-600 to-gray-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>
              <div className="flex items-center gap-3">
                <Settings className="w-8 h-8" />
                <div>
                  <h1 className="text-3xl font-bold">Operations Department</h1>
                  <p className="text-gray-100">Manage all operations certificates & letters</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3 w-full md:w-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex flex-col items-center justify-center">
                <span className="text-sm text-gray-100">Total</span>
                <span className="text-xl font-bold">{stats.total}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex flex-col items-center justify-center">
                <span className="text-sm text-gray-100">Certificates</span>
                <span className="text-xl font-bold">{stats.certificates}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 flex flex-col items-center justify-center">
                <span className="text-sm text-gray-100">Letters</span>
                <span className="text-xl font-bold">{stats.letters}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 text-black border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none bg-white shadow-sm"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </motion.button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none w-full pl-4 pr-10 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 outline-none text-black"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                <div className="flex flex-wrap gap-2 mb-4">
                  {['all', 'downloaded', 'pending'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        statusFilter === status
                          ? status === 'downloaded'
                            ? 'bg-green-500 text-white'
                            : status === 'pending'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gradient-to-r from-gray-600 to-slate-700 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button onClick={clearFilters} className="text-gray-600 hover:text-gray-800 text-sm font-medium">
                    Clear all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-gray-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-800">Loading...</h3>
          </div>
        )}

        {/* Certificates Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert, index) => (
              <motion.div
                key={cert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white rounded-2xl shadow-md hover:shadow-lg border border-gray-100 p-6 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="text-lg font-bold text-gray-800 truncate">{cert.name}</h3>
                    <p className="text-sm text-gray-600 truncate">{cert.course}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${
                    cert.status === 'downloaded'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {cert.status === 'downloaded' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {cert.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Certificate ID:</span>
                    <span className="font-semibold text-gray-800">{cert.certificateId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-semibold text-gray-800">
                      {new Date(cert.issueDate).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white py-2.5 rounded-lg hover:bg-gray-700 transition text-sm font-semibold">
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white py-2.5 rounded-lg hover:bg-slate-700 transition text-sm font-semibold">
                    <Download className="w-4 h-4" />
                    JPG
                  </button>
                  <button className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCertificates.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your filters or search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}