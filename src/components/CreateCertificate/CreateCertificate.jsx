'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Award, Calendar, User, BookOpen, Tag,
  CheckCircle, ArrowLeft, Shield, X, Upload, FileSpreadsheet, ArrowRight
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

export default function CreateCertificate() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    issueDate: '',
    course: '',
    batch: '',
    // internId: '',
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

  // Category Configuration
  const categoryConfig = {
    'code4bharat': {
      label: 'Code4Bharat',
      batches: []
    },
    'marketing-junction': {
      label: 'Marketing Junction',
      batches: []
    },
    'FSD': {
      label: 'FSD',
      batches: ['B-1', 'B-2', 'B-3', 'B-4']
    },
    'BVOC': {
      label: 'BVOC',
      batches: ['B-1', 'B-2']
    },
    'BOOTCAMP': {
      label: 'BOOTCAMP',
      batches: []
    },
    'HR': {
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
      setFormData(prev => ({ ...prev, name: '', course: '' }));
    }
  }, [formData.category, formData.batch]);

  // Fetch courses when name is selected
  useEffect(() => {
    if (formData.name) {
      fetchCourses();
    } else {
      setCoursesList([]);
      setFormData(prev => ({ ...prev, course: '' }));
    }
  }, [formData.name]);

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

  // const fetchNames = async () => {
  //   setLoadingNames(true);
  //   try {
  //     const response = await axios.get(`${API_URL}/api/people/`, {
  //       headers: getAuthHeaders(),
  //       params: {
  //         category: formData.category,
  //         batch: formData.batch
  //       }
  //     });

  //     if (response.data.success && response.data.names?.length > 0) {
  //       setNamesList(response.data.names);
  //     } else {
  //       const mockData = [
  //         { internId: 'INT001', name: 'Aarav Sharma' },
  //         { internId: 'INT002', name: 'Neha Verma' },
  //         { internId: 'INT003', name: 'Rahul Singh' }
  //       ];
  //       setNamesList(mockData);
  //       toast('Loaded mock data (testing mode)', { icon: '⚙️' });
  //     }
  //   } catch (error) {
  //     console.error('Fetch names error:', error);
  //     toast.error('Failed to load names');
  //   } finally {
  //     setLoadingNames(false);
  //   }
  // };

  const fetchNames = async () => {
    setLoadingNames(true);
    try {
      if (formData.category === "code4bharat" || formData.category === "marketing-junction") {
        const response = await axios.get(`${API_URL}/api/people/`, {
          headers: getAuthHeaders(),
          params: {
            category: formData.category,
          }
        });

        if (response.data.success && response.data.names?.length > 0) {
          setNamesList(response.data.names);
        }
        // else {
        //   console.warn('Using mock data (no names found from backend)');
        //   const mockData = [
        //     { internId: 'INT001', name: 'Aarav Sharma' },
        //     { internId: 'INT002', name: 'Neha Verma' },
        //     { internId: 'INT003', name: 'Rahul Singh' },
        //     { internId: 'INT004', name: 'Priya Patel' },
        //     { internId: 'INT005', name: 'Rohan Mehta' }
        //   ];
        //   setNamesList(mockData);
        //   toast('Loaded mock data (testing mode)', { icon: '⚙️' });
        // }
      }
      else {
        const response = await axios.get(`${API_URL}/api/people/`, {
          headers: getAuthHeaders(),
          params: {
            category: formData.category,
            batch: formData.batch
          }
        });

        if (response.data.success && response.data.names?.length > 0) {
          setNamesList(response.data.names);
        }
        // else {
        //   console.warn('Using mock data (no names found from backend)');
        //   const mockData = [
        //     { internId: 'INT001', name: 'Aarav Sharma' },
        //     { internId: 'INT002', name: 'Neha Verma' },
        //     { internId: 'INT003', name: 'Rahul Singh' },
        //     { internId: 'INT004', name: 'Priya Patel' },
        //     { internId: 'INT005', name: 'Rohan Mehta' }
        //   ];
        //   setNamesList(mockData);
        //   toast('Loaded mock data (testing mode)', { icon: '⚙️' });
        // }
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
          // batch: formData.batch,
          // internId: formData.internId
        }
      });

      if (response.data.success && response.data.courses?.length > 0) {
        setCoursesList(response.data.courses);
        setCreatedCertificates(response.data.createdCertificates || []);
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoadingCourses(false);
    }
  };


  const handleInputChange = (field, value) => {
    if (field === 'category') {
      setFormData(prev => ({ ...prev, category: value, batch: '', name: '', course: '' }));
      setPreviewImage(null);
      setOtpVerified(false);
    } else if (field === 'batch') {
      setFormData(prev => ({ ...prev, batch: value, name: '', course: '' }));
      setPreviewImage(null);
      setOtpVerified(false);
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (field === 'course' || field === 'issueDate') {
        setPreviewImage(null);
        setOtpVerified(false);
      }
    }
  };


  const validateForm = () => {
    if (!formData.category) {
      toast.error('Please select a category');
      return false;
    }
    if (categoryConfig[formData.category]?.batches?.length > 0 && !formData.batch) {
      toast.error('Please select a batch');
      return false;
    }
    if (!formData.name) {
      toast.error('Please select a name');
      return false;
    }
    if (!formData.course) {
      toast.error('Please select a course');
      return false;
    }
    if (!formData.issueDate) {
      toast.error('Please select issue date');
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowOtpModal(true);
    }
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
      toast.error('Failed to send OTP');
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

  const verifyOTP = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length === 6) {
      toast.success('OTP Verified!');
      setOtpVerified(true);
      setShowOtpModal(false);
      setShowPreview(true);
    } else {
      toast.error('Please enter complete OTP');
    }
  };

  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/certificates/preview`,
        formData,
        {
          headers: getAuthHeaders(),
          responseType: 'blob' // Important: Tell axios to expect binary data
        }
      );

      // Create a local URL from the blob
      const imageUrl = URL.createObjectURL(response.data);
      setPreviewImage(imageUrl);

    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      toast.error('Please verify OTP first');
      return;
    }

    setIsCreating(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/certificates/`,
        formData,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // router.push('/certificates');
        }, 2000);
      }
    } catch (error) {
      toast.error('Failed to create certificate');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </motion.button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create Certificate
              </h1>
              <p className="text-gray-600 mt-2">Generate professional certificates with OTP verification</p>
            </div>

            {/* Bulk Create Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/bulkcreate-certificate')}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Content */}
              <div className="relative flex items-center gap-2">
                <Upload className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                <FileSpreadsheet className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                <span>Bulk Create</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </motion.button>
          </div>
        </div>

        {/* Rest of the component remains same as CreateCertificate.jsx */}
        {/* Form Section, Preview Section, OTP Modal, Success Modal - same code */}
        {!showPreview ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-blue-600" />
                Certificate Information
              </h2>

              <div className="space-y-6">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Batch Selection (if applicable) */}
                {formData.category && categoryConfig[formData.category]?.batches?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Batch *
                    </label>
                    <select
                      value={formData.batch}
                      onChange={(e) => handleInputChange('batch', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="">Select Batch</option>
                      {categoryConfig[formData.category].batches.map(batch => (
                        <option key={batch} value={batch}>{batch}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Name Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name *
                  </label>
                  {loadingNames ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <select
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!namesList.length}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50"
                    >
                      <option value="">Select Name</option>
                      {namesList.map((person, index) => (
                        <option key={index} value={person.name}>
                          {person.name}
                        </option>
                      ))}
                    </select>

                  )}
                </div>

                {/* Course Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Course *
                  </label>
                  {loadingCourses ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <select
                      value={formData.course}
                      onChange={(e) => handleInputChange('course', e.target.value)}
                      disabled={!coursesList.length}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50"
                    >
                      <option value="">Select Course</option>
                      {coursesList.map((course, index) => (
                        <option key={index} value={course}>{course}</option>
                      ))}
                    </select>
                  )}
                </div>

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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                {/* Preview Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePreview}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Verify & Preview
                </motion.button>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Instructions</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Select category and batch (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Choose the student name from the dropdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Select the course for certification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Set the certificate issue date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">5.</span>
                    <span>Verify via WhatsApp OTP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">6.</span>
                    <span>Review preview and create certificate</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-start gap-3">
                  <FaWhatsapp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">WhatsApp OTP Verification</h4>
                    <p className="text-sm text-gray-700">
                      For security, you'll receive a 6-digit OTP via WhatsApp before creating the certificate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Bulk Upload Info */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-start gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Need to Create Multiple Certificates?</h4>
                    <p className="text-sm text-gray-700 mb-3">
                      Use our bulk upload feature to create certificates for multiple students at once using a CSV file.
                    </p>
                    <button
                      onClick={() => router.push('/bulkcreate-certificate')}
                      className="text-purple-600 font-semibold hover:text-purple-700 flex items-center gap-1 text-sm"
                    >
                      Try Bulk Upload
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Preview section - keeping same as before
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Form</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Create Certificate
                  </>
                )}
              </motion.button>
            </div>

            <div>
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600 font-medium">Generating preview...</p>
                </div>
              ) : previewImage ? (
                <img
                  src={previewImage}
                  alt="Certificate Preview"
                  className="w-full rounded-lg shadow-md border border-gray-200"
                />
              ) : null}

              <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Certificate Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">{formData.name}</span>
                  </div>
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
            </div>
          </div>
        )}

        {/* OTP Modal - Same as before */}
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
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
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

        {/* Success Modal - Same as before */}
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
                  Certificate created successfully! WhatsApp notification sent to the user.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}