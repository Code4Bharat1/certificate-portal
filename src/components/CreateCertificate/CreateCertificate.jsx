'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, Award, Calendar, User, BookOpen, Tag, 
  CheckCircle, ArrowLeft, Mail, Shield, AlertCircle, 
  Upload, FileText, X, Download
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

export default function CreateCertificateProfessional() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  
  // Bulk Upload States
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  
  // Form States
  const [formData, setFormData] = useState({
    category: '',
    batch: '',
    internId: '',
    name: '',
    course: '',
    issueDate: ''
  });

  // Data Lists
  const [namesList, setNamesList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [createdCertificates, setCreatedCertificates] = useState([]);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  // Success State
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Category Configuration (Internship removed)
  const categoryConfig = {
    'code4bharat': {
      label: 'Code4Bharat',
      batches: []
    },
    'marketing-junction': {
      label: 'Marketing Junction',
      batches: []
    },
    'fsd': {
      label: 'FSD',
      batches: ['FSD1', 'FSD2', 'FSD3', 'FSD4']
    },
    'bvoc': {
      label: 'BVOC',
      batches: ['Batch 1', 'Batch 2']
    },
    'bootcamp': {
      label: 'BOOTCAMP',
      batches: []
    },
    'hr': {
      label: 'HR',
      batches: []
    }
  };

  // OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Fetch names when category/batch is selected
  useEffect(() => {
    const shouldFetchNames = formData.category && (
      categoryConfig[formData.category]?.batches?.length === 0 || 
      formData.batch
    );

    if (shouldFetchNames) {
      fetchNames();
    } else {
      setNamesList([]);
      setFormData(prev => ({ ...prev, internId: '', name: '', course: '' }));
    }
  }, [formData.category, formData.batch]);

  // Fetch courses when name is selected
  useEffect(() => {
    if (formData.internId) {
      fetchCourses();
    } else {
      setCoursesList([]);
      setFormData(prev => ({ ...prev, course: '' }));
    }
  }, [formData.internId]);

  // Generate preview after OTP verification
  useEffect(() => {
    if (otpVerified && formData.name && formData.category && formData.course && formData.issueDate) {
      generatePreview();
    }
  }, [otpVerified]);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchNames = async () => {
    setLoadingNames(true);
    try {
      const response = await axios.get(`${API_URL}/api/certificates/names`, {
        headers: getAuthHeaders(),
        params: {
          category: formData.category,
          batch: formData.batch
        }
      });

      if (response.data.success && response.data.names?.length > 0) {
        setNamesList(response.data.names);
      } else {
        console.warn('Using mock data (no names found from backend)');
        const mockData = [
          { internId: 'INT001', name: 'Aarav Sharma' },
          { internId: 'INT002', name: 'Neha Verma' },
          { internId: 'INT003', name: 'Rahul Singh' },
          { internId: 'INT004', name: 'Priya Patel' },
          { internId: 'INT005', name: 'Rohan Mehta' }
        ];
        setNamesList(mockData);
        toast('Loaded mock data (testing mode)', { icon: '⚙️' });
      }
    } catch (error) {
      console.error('Fetch names error:', error);
      toast.error('Failed to load names (using mock data)');
      const mockData = [
        { internId: 'INT001', name: 'Aarav Sharma' },
        { internId: 'INT002', name: 'Neha Verma' },
        { internId: 'INT003', name: 'Rahul Singh' },
        { internId: 'INT004', name: 'Priya Patel' },
        { internId: 'INT005', name: 'Rohan Mehta' }
      ];
      setNamesList(mockData);
    } finally {
      setLoadingNames(false);
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const response = await axios.get(`${API_URL}/api/certificates/available-courses`, {
        headers: getAuthHeaders(),
        params: {
          category: formData.category,
          batch: formData.batch,
          internId: formData.internId
        }
      });

      if (response.data.success && response.data.courses?.length > 0) {
        setCoursesList(response.data.courses);
        setCreatedCertificates(response.data.createdCertificates || []);
      } else {
        console.warn('Using mock course data (no courses found from backend)');
        const mockCourses = [
          'Full Stack Certificate (MERN Stack)',
          'Digital Marketing Specialist Certificate',
          'Web Development Fundamentals',
          'Full Stack Development',
          'Digital Marketing Basics',
          'Python Programming Essentials',
          'Data Analytics Workshop'
        ];
        setCoursesList(mockCourses);
        setCreatedCertificates(['Web Development Fundamentals']);
        toast('Loaded mock courses (testing mode)', { icon: '⚙️' });
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to load courses (using mock data)');
      const mockCourses = [
        'Full Stack Certificate (MERN Stack)',
        'Digital Marketing Specialist Certificate',
        'Web Development Fundamentals',
        'Full Stack Development',
        'Digital Marketing Basics',
        'Python Programming Essentials',
        'Data Analytics Workshop'
      ];
      setCoursesList(mockCourses);
      setCreatedCertificates([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      if (field === 'category') {
        newData.batch = '';
        newData.internId = '';
        newData.name = '';
        newData.course = '';
      }

      if (field === 'batch') {
        newData.internId = '';
        newData.name = '';
        newData.course = '';
      }

      if (field === 'internId') {
        const selectedIntern = namesList.find(n => n.internId === value);
        if (selectedIntern) {
          newData.name = selectedIntern.name;
        }
      }

      return newData;
    });
  };

  const sendOTP = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/certificates/otp/send`,
        { phone: "919321488422", name: 'HR-NEXCORE ALLIANCE' },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('OTP sent to your WhatsApp! 📱');
        setOtpSent(true);
        setResendTimer(60);
      } else {
        toast.error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOTP = async () => {
    try {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        toast.error('Please enter complete OTP');
        return;
      }

      const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}');
      
      const response = await axios.post(
        `${API_URL}/api/certificates/otp/verify`,
        { 
          phone: "919321488422",
          otp: otpCode 
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('OTP Verified Successfully! ✅');
        setOtpVerified(true);
        setShowOtpModal(false);
        setShowPreview(true);
      } else {
        toast.error(response.data.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error(error.response?.data?.message || 'OTP verification failed');
      setOtp(['', '', '', '', '', '']);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/certificates/preview`,
        {
          ...formData,
          certificateType: formData.category
        },
        {
          headers: getAuthHeaders(),
          responseType: 'arraybuffer'
        }
      );

      const blob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(blob);
      setPreviewImage(imageUrl);
    } catch (error) {
      console.error('Preview generation error:', error);
      toast.error('Failed to generate preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleFormSubmit = async () => {
    if (!otpVerified) {
      setShowOtpModal(true);
      return;
    }

    setIsCreating(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/certificates/`,
        {
          ...formData,
          certificateType: formData.category
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetForm();
        }, 2000);
      }
    } catch (error) {
      console.error('Certificate creation error:', error);
      toast.error(error.response?.data?.message || 'Certificate creation failed');
    } finally {
      setIsCreating(false);
    }
  };

  // ==================== BULK UPLOAD FUNCTIONS ====================

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setCsvFile(file);
    parseCSV(file);
  };

  const parseCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split('\n').filter(line => line.trim());
      
      const dataLines = lines.slice(1);
      
      const parsed = dataLines.map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        
        return {
          rowNumber: index + 2,
          name: values[0] || '',
          phone: values[1] || '',
          course: values[2] || '',
          category: values[3] || '',
          batch: values[4] || '',
          issueDate: values[5] || new Date().toISOString().split('T')[0]
        };
      }).filter(row => row.name && row.phone);

      setCsvData(parsed);
      toast.success(`${parsed.length} records loaded from CSV`);
    };
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const csvContent = `Name,Phone,Course,Category,Batch,IssueDate
Aarav Sharma,919876543210,Web Development Fundamentals,code4bharat,,2025-01-15
Neha Verma,919876543211,Full Stack Development,fsd,FSD1,2025-01-15
Rahul Singh,919876543212,Digital Marketing Basics,marketing-junction,,2025-01-15
Priya Patel,919876543213,Python Programming,bvoc,Batch 1,2025-01-15`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleBulkCreate = async () => {
    if (csvData.length === 0) {
      toast.error('Please upload a CSV file first');
      return;
    }

    if (!otpVerified) {
      setShowOtpModal(true);
      return;
    }

    setIsBulkCreating(true);
    setBulkProgress({ current: 0, total: csvData.length });

    try {
      const adminData = JSON.parse(sessionStorage.getItem('adminData') || '{}');

      const response = await axios.post(
        `${API_URL}/api/certificates/bulk-create`,
        {
          certificates: csvData,
          adminPhone: adminData.whatsappNumber,
          adminName: adminData.name || 'Admin'
        },
        { 
          headers: getAuthHeaders(),
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setBulkProgress(prev => ({ ...prev, current: Math.floor(csvData.length * progress / 100) }));
          }
        }
      );

      if (response.data.success) {
        const { stats } = response.data;
        toast.success(
          `Bulk creation completed!\n✅ Success: ${stats.successful}\n❌ Failed: ${stats.failed}`,
          { duration: 5000 }
        );
        
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          resetBulkForm();
        }, 3000);
      }
    } catch (error) {
      console.error('Bulk creation error:', error);
      toast.error(error.response?.data?.message || 'Bulk creation failed');
    } finally {
      setIsBulkCreating(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const resetBulkForm = () => {
    setCsvFile(null);
    setCsvData([]);
    setOtpVerified(false);
    setOtp(['', '', '', '', '', '']);
  };

  const resetForm = () => {
    setFormData({
      category: '',
      batch: '',
      internId: '',
      name: '',
      course: '',
      issueDate: ''
    });
    setPreviewImage(null);
    setOtpVerified(false);
    setShowPreview(false);
    setOtp(['', '', '', '', '', '']);
  };

  const isFormValid = () => {
    if (!formData.category || !formData.name || !formData.course || !formData.issueDate) {
      return false;
    }

    // Check if batch is required for this category
    const hasBatches = categoryConfig[formData.category]?.batches?.length > 0;
    if (hasBatches && !formData.batch) {
      return false;
    }

    return true;
  };

  const needsBatchSelection = () => {
    return formData.category && categoryConfig[formData.category]?.batches?.length > 0;
  };

  const canShowNameSelection = () => {
    if (!formData.category) return false;
    
    // If category has batches, batch must be selected
    if (needsBatchSelection()) {
      return formData.batch !== '';
    }
    
    // Otherwise, just category is enough
    return true;
  };

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-6">
      <Toaster position="top-center" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header with Mode Toggle */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Create Certificate
              </h1>
              <p className="text-gray-600 mt-1">
                {isBulkMode ? 'Bulk Upload Mode' : 'Single Certificate Mode'}
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setIsBulkMode(false)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                !isBulkMode
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setIsBulkMode(true)}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                isBulkMode
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Bulk Upload
            </button>
          </div>
        </div>

        {/* Conditional Rendering: Single vs Bulk */}
        {isBulkMode ? (
          // ==================== BULK UPLOAD MODE ====================
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="text-center mb-8">
              <Upload className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Bulk Certificate Upload</h2>
              <p className="text-gray-600">Upload a CSV file to create multiple certificates at once</p>
            </div>

            {/* Download Sample CSV */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    CSV Format Required
                  </p>
                  <p className="text-xs text-blue-700 mb-3">
                    Columns: Name, Phone, Course, Category, Batch, IssueDate
                  </p>
                  <button
                    onClick={downloadSampleCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download Sample CSV
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block w-full">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCSVUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-500 hover:bg-indigo-50/50 transition-all cursor-pointer">
                  {csvFile ? (
                    <div>
                      <FileText className="w-12 h-12 mx-auto mb-3 text-green-600" />
                      <p className="text-gray-900 font-semibold">{csvFile.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{csvData.length} records loaded</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-gray-700 font-medium">Click to upload CSV file</p>
                      <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* CSV Preview Table */}
            {csvData.length > 0 && (
              <div className="mb-6 overflow-x-auto">
                <h3 className="font-semibold text-gray-900 mb-3">Preview ({csvData.length} records)</h3>
                <div className="border rounded-lg max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Phone</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Course</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Category</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">Batch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2">{row.name}</td>
                          <td className="px-4 py-2">{row.phone}</td>
                          <td className="px-4 py-2">{row.course}</td>
                          <td className="px-4 py-2">{row.category}</td>
                          <td className="px-4 py-2">{row.batch || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 10 && (
                    <div className="p-3 text-center text-sm text-gray-600 bg-gray-50 border-t">
                      ... and {csvData.length - 10} more records
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bulk Progress */}
            {isBulkCreating && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Creating certificates...</span>
                  <span>{bulkProgress.current} / {bulkProgress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleBulkCreate}
                disabled={csvData.length === 0 || isBulkCreating}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isBulkCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Certificates...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create {csvData.length} Certificates
                  </>
                )}
              </button>

              {csvFile && (
                <button
                  onClick={resetBulkForm}
                  className="px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          // ==================== SINGLE CERTIFICATE MODE ====================
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Certificate Information</h2>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>

              {/* Batch Selection (conditional) */}
              {needsBatchSelection() && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Batch *
                  </label>
                  <select
                    value={formData.batch}
                    onChange={(e) => handleInputChange('batch', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                  >
                    <option value="">Select Batch</option>
                    {categoryConfig[formData.category]?.batches?.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Name Selection */}
              {canShowNameSelection() && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Select Intern/Student *
                  </label>
                  <select
                    value={formData.internId}
                    onChange={(e) => handleInputChange('internId', e.target.value)}
                    disabled={loadingNames}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:bg-gray-50"
                  >
                    <option value="">
                      {loadingNames ? 'Loading names...' : 'Select Name'}
                    </option>
                    {namesList.map(intern => (
                      <option key={intern.internId} value={intern.internId}>
                        {intern.name} ({intern.internId})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Course Selection */}
              {formData.internId && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Select Course *
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    disabled={loadingCourses}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all disabled:bg-gray-50"
                  >
                    <option value="">
                      {loadingCourses ? 'Loading courses...' : 'Select Course'}
                    </option>
                    {coursesList.map(course => {
                      const isCreated = createdCertificates.includes(course);
                      return (
                        <option 
                          key={course} 
                          value={course}
                          disabled={isCreated}
                          className={isCreated ? 'text-gray-400' : ''}
                        >
                          {course} {isCreated ? '(Already Created)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Issue Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Issue Date *
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => handleInputChange('issueDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleFormSubmit}
                disabled={!isFormValid() || isCreating}
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Certificate...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    Create Certificate
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preview</h2>

                {showPreview ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {loadingPreview ? (
                      <div className="w-full aspect-[1.414/1] bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                        <div className="text-center">
                          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-3" />
                          <p className="text-gray-600 font-medium">Generating preview...</p>
                        </div>
                      </div>
                    ) : previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Certificate Preview" 
                        className="w-full rounded-lg shadow-md border border-gray-200"
                      />
                    ) : null}

                    {/* Certificate Details */}
                    <div className="p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                      <h3 className="font-semibold text-gray-900 mb-3 text-lg">Certificate Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold text-gray-900">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">ID:</span>
                          <span className="font-semibold text-gray-900">{formData.internId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-semibold text-gray-900">{categoryConfig[formData.category]?.label}</span>
                        </div>
                        {formData.batch && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Batch:</span>
                            <span className="font-semibold text-gray-900">{formData.batch}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Course:</span>
                          <span className="font-semibold text-gray-900">{formData.course}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Issue Date:</span>
                          <span className="font-semibold text-gray-900">
                            {new Date(formData.issueDate).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <Award className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 font-medium">Complete the form and verify OTP</p>
                      <p className="text-gray-400 text-sm mt-1">to view certificate preview</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OTP Modal with WhatsApp Icon */}
        <AnimatePresence>
          {showOtpModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                  {/* WhatsApp Icon */}
                  <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                    <FaWhatsapp className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp OTP Verification</h2>
                  <p className="text-gray-600">
                    {otpSent 
                      ? 'Enter the 6-digit code sent to your WhatsApp'
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
                          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={verifyOTP}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg mb-3 flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      Verify OTP
                    </motion.button>

                    <button
                      onClick={resendTimer === 0 ? sendOTP : null}
                      disabled={resendTimer > 0}
                      className="w-full text-green-600 py-2 font-medium disabled:text-gray-400 transition-colors"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>

                    <p className="text-xs text-gray-500 text-center mt-4">
                      ⏰ OTP will expire in 5 minutes
                    </p>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendOTP}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Send OTP via WhatsApp
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">
                  {isBulkMode 
                    ? 'Bulk certificates created successfully! WhatsApp notifications sent to all users.'
                    : 'Certificate created successfully! WhatsApp notification sent to the user.'}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}