'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Award, Calendar, User, BookOpen, Tag, Sparkles, 
  CheckCircle, ArrowLeft, Upload, Filter, Search, X, Mail,
  FileSpreadsheet, Download, Users, TrendingUp, Shield
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

export default function CreateCertificateEnhanced() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'
  const [isCreating, setIsCreating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [interns, setInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    internId: '',
    category: '',
    batch: ''
  });

  // Bulk Upload States
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkData, setBulkData] = useState([]);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkFilters, setBulkFilters] = useState({
    category: '',
    batch: ''
  });

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Certificate Tracking
  const [certStats, setCertStats] = useState({
    created: 0,
    remaining: 0,
    total: 0
  });

  const [certForm, setCertForm] = useState({
    name: '',
    category: '',
    course: '',
    date: '',
    internId: '',
    batch: ''
  });

  // UPDATED: Available batches per category
  const categoryBatches = {
    'internship': {
      'c4b': ['C4B Batch 1', 'C4B Batch 2', 'C4B Batch 3'],
      'mj': ['MJ Batch 1', 'MJ Batch 2', 'MJ Batch 3']
    },
    'fsd': ['FSD1', 'FSD2', 'FSD3', 'FSD4'],
    'bvoc': ['Batch 1', 'Batch 2'],
    'bootcamp': ['Bootcamp Batch 1', 'Bootcamp Batch 2', 'Bootcamp Batch 3']
  };

  // Get batches based on category and subcategory
  const getBatchesForCategory = (category, subCategory = null) => {
    if (category === 'internship' && subCategory) {
      return categoryBatches.internship[subCategory] || [];
    }
    return categoryBatches[category] || [];
  };

  // OTP Timer Effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Fetch courses when category changes
  useEffect(() => {
    if (certForm.category) {
      fetchCourses(certForm.category);
    } else {
      setCourses([]);
      setCertForm(prev => ({ ...prev, course: '' }));
    }
  }, [certForm.category]);

  // Generate preview
  useEffect(() => {
    if (certForm.name && certForm.category && certForm.course && certForm.date) {
      generatePreview();
    } else {
      setPreviewImage(null);
    }
  }, [certForm.name, certForm.category, certForm.course, certForm.date]);

  // Fetch interns based on filters
  useEffect(() => {
    if (filters.category && filters.batch) {
      fetchInterns();
    }
  }, [filters.category, filters.batch]);

  // Filter interns based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = interns.filter(intern => 
        intern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.internId.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInterns(filtered);
    } else {
      setFilteredInterns(interns);
    }
  }, [searchTerm, interns]);

  const fetchCourses = async (category) => {
    setLoadingCourses(true);
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.get(`${API_URL}/api/certificates/courses/${category}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setCourses(response.data.courses);
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to load courses');
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const fetchInterns = async () => {
    setLoadingInterns(true);
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.get(`${API_URL}/api/interns`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: {
          category: filters.category,
          batch: filters.batch
        }
      });

      if (response.data.success) {
        setInterns(response.data.interns);
        setFilteredInterns(response.data.interns);
      }
    } catch (error) {
      console.error('Fetch interns error:', error);
      toast.error('Failed to load interns');
    } finally {
      setLoadingInterns(false);
    }
  };

  const fetchCertStats = async (internId) => {
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.get(`${API_URL}/api/certificates/stats/${internId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setCertStats(response.data.stats);
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
  };

  const handleInternSelect = (intern) => {
    setSelectedIntern(intern);
    setCertForm({
      ...certForm,
      name: intern.name,
      internId: intern.internId,
      batch: intern.batch
    });
    fetchCertStats(intern.internId);
    setShowFilters(false);
  };

  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.post(`${API_URL}/api/certificates/preview`, {
        name: certForm.name,
        category: certForm.category,
        course: certForm.course,
        issueDate: certForm.date,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      });

      const imageUrl = URL.createObjectURL(response.data);
      setPreviewImage(imageUrl);
    } catch (error) {
      console.error('Preview generation error:', error);
      setPreviewImage(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  // OTP Functions
  const sendOTP = async () => {
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.post(`${API_URL}/api/otp/send`, {
        email: sessionStorage.getItem('userEmail')
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setOtpSent(true);
        setResendTimer(60);
        toast.success('OTP sent to your email');
      }
    } catch (error) {
      toast.error('Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('Please enter 6-digit OTP');
      return;
    }

    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.post(`${API_URL}/api/otp/verify`, {
        otp: otpCode,
        email: sessionStorage.getItem('userEmail')
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setOtpVerified(true);
        toast.success('OTP verified successfully');
        setShowOtpModal(false);
        
        // Create certificate or process bulk
        if (activeTab === 'single') {
          await createCertificate();
        } else {
          await processBulkCreate();
        }
      }
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleCreateCertificate = async () => {
    if (!certForm.name || !certForm.category || !certForm.course || !certForm.date) {
      toast.error('Please fill all fields');
      return;
    }

    setShowOtpModal(true);
    if (!otpSent) {
      await sendOTP();
    }
  };

  const createCertificate = async () => {
    setIsCreating(true);

    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.post(`${API_URL}/api/certificates`, {
        name: certForm.name,
        category: certForm.category,
        course: certForm.course,
        issueDate: certForm.date,
        internId: certForm.internId,
        batch: certForm.batch
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success(`Certificate created successfully! ID: ${response.data.data.certificateId}`);
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setCertForm({ name: '', category: '', course: '', date: '', internId: '', batch: '' });
          setSelectedIntern(null);
          setOtpVerified(false);
          setOtp(['', '', '', '', '', '']);
        }, 3000);
      }
    } catch (error) {
      console.error('Creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create certificate');
    } finally {
      setIsCreating(false);
    }
  };

  // Bulk Upload Functions
  const handleBulkFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBulkFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        setBulkData(data);
        toast.success(`${data.length} records loaded from Excel`);
      } catch (error) {
        toast.error('Failed to read Excel file');
      }
    };

    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Name': 'John Doe',
        'Intern ID': 'INT001',
        'Category': 'internship',
        'Sub-Category': 'c4b',
        'Batch': 'C4B Batch 1',
        'Course': 'Full Stack Development',
        'Issue Date': '2025-01-15'
      },
      {
        'Name': 'Jane Smith',
        'Intern ID': 'INT002',
        'Category': 'fsd',
        'Sub-Category': '',
        'Batch': 'FSD1',
        'Course': 'React Development',
        'Issue Date': '2025-01-15'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'certificate_bulk_template.xlsx');
    toast.success('Template downloaded');
  };

  const handleBulkCreate = async () => {
    if (bulkData.length === 0) {
      toast.error('Please upload a file first');
      return;
    }

    setShowOtpModal(true);
    if (!otpSent) {
      await sendOTP();
    }
  };

  const processBulkCreate = async () => {
    setIsCreating(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      for (let i = 0; i < bulkData.length; i++) {
        try {
          const record = bulkData[i];
          await axios.post(`${API_URL}/api/certificates`, {
            name: record.Name,
            internId: record['Intern ID'],
            category: record.Category,
            subCategory: record['Sub-Category'] || null,
            batch: record.Batch,
            course: record.Course,
            issueDate: record['Issue Date']
          }, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          successCount++;
          setBulkProgress(Math.round(((i + 1) / bulkData.length) * 100));
        } catch (error) {
          failCount++;
          console.error('Bulk create error:', error);
        }
      }

      toast.success(`Bulk upload complete! Success: ${successCount}, Failed: ${failCount}`);
      setBulkData([]);
      setBulkFile(null);
      setBulkProgress(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      toast.error('Bulk upload failed');
    } finally {
      setIsCreating(false);
      setShowOtpModal(false);
      setOtpVerified(false);
    }
  };

  const handleCategoryChange = (category) => {
    setCertForm({
      ...certForm,
      category: category,
      course: '',
      batch: '',
      subCategory: ''
    });
    setFilters({
      ...filters,
      category: category,
      batch: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Back Button */}
        <motion.button
          whileHover={{ scale: 1.05, x: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/dashboard')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </motion.button>

        {/* Tab Switcher */}
        <div className="mb-6 flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('single')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'single'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 shadow-md'
            }`}
          >
            <User className="inline-block w-5 h-5 mr-2" />
            Single Certificate
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('bulk')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
              activeTab === 'bulk'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                : 'bg-white text-gray-700 shadow-md'
            }`}
          >
            <Users className="inline-block w-5 h-5 mr-2" />
            Bulk Upload
          </motion.button>
        </div>

        {activeTab === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 overflow-hidden border-2 border-gray-100">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-0" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-3xl font-bold text-gray-800">Create Certificate</h1>
                  </div>
                </div>
                {/* MOVED: Filter Panel - Now Below Form */}
                <div className="mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-100 rounded-xl hover:bg-indigo-200 transition-colors"
                  >
                    <Filter className="w-5 h-5 text-indigo-600" />
                    <span className="font-semibold text-indigo-700">
                      {showFilters ? 'Hide Filters' : 'Show Intern Filters'}
                    </span>
                  </motion.button>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-800">Filter Interns</h3>
                          <button onClick={() => setShowFilters(false)}>
                            <X className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>

                        {/* Certificate Stats */}
                        {selectedIntern && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-200"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <TrendingUp className="w-5 h-5 text-indigo-600" />
                              <h3 className="font-semibold text-gray-800">Certificate Statistics</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-600">{certStats.created}</p>
                                <p className="text-xs text-gray-600">Created</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">{certStats.remaining}</p>
                                <p className="text-xs text-gray-600">Remaining</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-indigo-600">{certStats.total}</p>
                                <p className="text-xs text-gray-600">Total</p>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                            <select
                              value={filters.category}
                              onChange={(e) => setFilters({ ...filters, category: e.target.value, batch: '' })}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="">Select Category</option>
                              <option value="internship">INTERNSHIP (C4B, MJ)</option>
                              <option value="fsd">FSD (FSD1-4)</option>
                              <option value="bvoc">BVOC</option>
                              <option value="bootcamp">BOOTCAMP</option>
                            </select>
                          </div>

                          {/* Sub-category for Internship in Filters */}
                          {filters.category === 'internship' && (
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">Internship Type</label>
                              <select
                                value={filters.subCategory}
                                onChange={(e) => setFilters({ ...filters, subCategory: e.target.value, batch: '' })}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select Type</option>
                                <option value="c4b">Code4Bharat (C4B)</option>
                                <option value="mj">Marketing Junction (MJ)</option>
                              </select>
                            </div>
                          )}

                          {filters.category && (filters.category !== 'internship' || filters.subCategory) && (
                            <div>
                              <label className="text-sm font-medium text-gray-700 mb-1 block">Batch</label>
                              <select
                                value={filters.batch}
                                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="">Select Batch</option>
                                {getBatchesForCategory(filters.category, filters.subCategory).map((batch, index) => (
                                  <option key={index} value={batch}>{batch}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {filters.category && filters.batch && (
                            <>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search by name or ID..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>

                              {loadingInterns ? (
                                <div className="text-center py-4">
                                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
                                </div>
                              ) : (
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                  {filteredInterns.map((intern, index) => (
                                    <motion.div
                                      key={index}
                                      whileHover={{ scale: 1.02 }}
                                      onClick={() => handleInternSelect(intern)}
                                      className="p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-indigo-400 cursor-pointer transition-all"
                                    >
                                      <p className="font-semibold text-gray-800">{intern.name}</p>
                                      <p className="text-sm text-gray-600">ID: {intern.internId}</p>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Intern Name
                    </label>
                    <input
                      type="text"
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      disabled={isCreating}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      Category
                    </label>
                    <select
                      value={certForm.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      disabled={isCreating}
                      className="w-full px-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="internship">INTERNSHIP</option>
                      <option value="fsd">FSD</option>
                      <option value="bvoc">BVOC</option>
                      <option value="bootcamp">BOOTCAMP</option>
                    </select>
                  </div>

                  {/* Sub-category for Internship */}
                  {certForm.category === 'internship' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Tag className="w-4 h-4 text-pink-600" />
                        Internship Type
                      </label>
                      <select
                        value={certForm.subCategory}
                        onChange={(e) => setCertForm({ ...certForm, subCategory: e.target.value, batch: '' })}
                        disabled={isCreating}
                        className="w-full px-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                      >
                        <option value="">Select Type</option>
                        <option value="c4b">Code4Bharat (C4B)</option>
                        <option value="mj">Marketing Junction (MJ)</option>
                      </select>
                    </motion.div>
                  )}

                  {/* Batch Selection */}
                  {certForm.category && (certForm.category !== 'internship' || certForm.subCategory) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Users className="w-4 h-4 text-green-600" />
                        Batch
                      </label>
                      <select
                        value={certForm.batch}
                        onChange={(e) => setCertForm({ ...certForm, batch: e.target.value })}
                        disabled={isCreating}
                        className="w-full px-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                      >
                        <option value="">Select Batch</option>
                        {getBatchesForCategory(certForm.category, certForm.subCategory).map((batch, index) => (
                          <option key={index} value={batch}>{batch}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {/* Course Selection */}
                  <AnimatePresence>
                    {certForm.category && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                          <BookOpen className="w-4 h-4 text-green-600" />
                          Course
                        </label>
                        {loadingCourses ? (
                          <div className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                            <span className="ml-2 text-gray-600">Loading courses...</span>
                          </div>
                        ) : (
                          <select
                            value={certForm.course}
                            onChange={(e) => setCertForm({ ...certForm, course: e.target.value })}
                            disabled={isCreating || loadingCourses}
                            className="w-full px-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                          >
                            <option value="">Select Course</option>
                            {courses.map((course, index) => (
                              <option key={index} value={course}>{course}</option>
                            ))}
                          </select>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={certForm.date}
                      onChange={(e) => setCertForm({ ...certForm, date: e.target.value })}
                      disabled={isCreating}
                      className="w-full px-4 py-3 text-gray-800 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateCertificate}
                    disabled={isCreating || !certForm.name || !certForm.category || !certForm.course || !certForm.date}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Shield className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">Create with OTP Verification</span>
                  </motion.button>
                </div>

                
              </div>
            </div>

            {/* Preview Section */}
            <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 overflow-hidden border-2 border-gray-100">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full blur-3xl -z-0" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-gray-800">Preview</h2>
                </div>

                {certForm.name && certForm.category && certForm.course && certForm.date ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {loadingPreview ? (
                      <div className="w-full aspect-[1.414/1] bg-gray-100 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-3" />
                          <p className="text-gray-600">Generating preview...</p>
                        </div>
                      </div>
                    ) : previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Certificate Preview" 
                        className="w-full rounded-xl shadow-lg border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center border-2 border-dashed border-indigo-300">
                        <p className="text-indigo-600 font-medium">Preview will appear here</p>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 text-sm text-gray-700 space-y-2">
                      <p><b>Name:</b> {certForm.name}</p>
                      {certForm.internId && <p><b>Intern ID:</b> {certForm.internId}</p>}
                      <p><b>Category:</b> {certForm.category.toUpperCase()}</p>
                      {certForm.subCategory && <p><b>Type:</b> {certForm.subCategory.toUpperCase()}</p>}
                      {certForm.batch && <p><b>Batch:</b> {certForm.batch}</p>}
                      <p><b>Course:</b> {certForm.course}</p>
                      <p><b>Issue Date:</b> {new Date(certForm.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <Award className="w-16 h-16 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">Fill all fields to see preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Bulk Upload Section */
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">Bulk Certificate Upload</h1>
              </div>

             

              <div className="space-y-6">
                {/* Download Template */}
                

                {/* Template Guide */}
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">Template Guide:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <b>INTERNSHIP</b>: Use "internship" as Category, then add Sub-Category as "c4b" or "mj"</li>
                    <li>• <b>FSD</b>: Use "fsd" as Category, Batch should be "FSD1", "FSD2", "FSD3", or "FSD4"</li>
                    <li>• <b>BVOC</b>: Use "bvoc" as Category, Batch should be "Batch 1" or "Batch 2"</li>
                    <li>• <b>BOOTCAMP</b>: Use "bootcamp" as Category</li>
                  </ul>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-all">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleBulkFileUpload}
                    className="hidden"
                    id="bulk-upload"
                  />
                  <label
                    htmlFor="bulk-upload"
                    className="cursor-pointer"
                  >
                    <Upload className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      {bulkFile ? bulkFile.name : 'Click to upload Excel file'}
                    </p>
                    <p className="text-sm text-gray-500">Supports .xlsx and .xls files</p>
                  </label>
                </div>

                {/* Data Preview */}
                {bulkData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <p className="font-semibold text-blue-800">
                        {bulkData.length} records ready to upload
                      </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Intern ID</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Batch</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Course</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkData.slice(0, 10).map((record, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700">{record.Name}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record['Intern ID']}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.Category}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.Batch}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{record.Course}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {bulkData.length > 10 && (
                        <p className="text-center py-3 text-sm text-gray-500">
                          ...and {bulkData.length - 10} more records
                        </p>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {isCreating && (
                      <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${bulkProgress}%` }}
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                          />
                        </div>
                        <p className="text-center text-sm text-gray-600">
                          Processing: {bulkProgress}%
                        </p>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBulkCreate}
                      disabled={isCreating}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5" />
                          <span>Create All Certificates with OTP</span>
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OTP Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowOtpModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full"
              >
                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                    <Mail className="w-12 h-12 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">OTP Verification</h2>
                  <p className="text-gray-600">
                    {otpSent 
                      ? 'Enter the 6-digit code sent to your email'
                      : 'We will send an OTP to verify this action'}
                  </p>
                </div>

                {otpSent ? (
                  <>
                    <div className="flex gap-2 justify-center mb-6">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        />
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={verifyOTP}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold mb-3"
                    >
                      Verify & Create Certificate{activeTab === 'bulk' ? 's' : ''}
                    </motion.button>

                    <button
                      onClick={resendTimer === 0 ? sendOTP : null}
                      disabled={resendTimer > 0}
                      className="w-full text-indigo-600 py-2 font-medium disabled:text-gray-400"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendOTP}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold"
                  >
                    Send OTP
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Overlay */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-3xl p-8 shadow-2xl text-center max-w-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl mb-4">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">Certificate{activeTab === 'bulk' ? 's' : ''} Created Successfully!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}