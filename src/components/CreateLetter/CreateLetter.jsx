'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, ArrowLeft, Award, Tag, User, BookOpen, Calendar,
  Shield, CheckCircle, X, FileText, Upload, ArrowRight
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

export default function CreateLetter() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [batches, setBatches] = useState({ FSD: [], BVOC: [] });

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    issueDate: '',
    course: '', // 'Appreciation Letter' or 'Experience Certificate'
    description: '',
  });

  // Data Lists
  const [namesList, setNamesList] = useState([]);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  // Success & preview
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const categoryConfig = {
    'code4bharat': { label: 'Code4Bharat', batches: [] },
    'marketing-junction': { label: 'Marketing Junction', batches: [] },
    'FSD': { label: 'FSD', batches: batches.FSD || [] },
    'HR': { label: 'HR', batches: [] },
  };

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/batches`);
        if (response.data.success) {
          setBatches(response.data.batches);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
        toast.error('Failed to load batches');
      }
    };
    fetchBatches();
  }, []);

  // OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Fetch names when category / batch change
  useEffect(() => {
    const shouldFetchNames = formData.category && (
      categoryConfig[formData.category]?.batches?.length === 0 ||
      formData.batch
    );

    if (shouldFetchNames) {
      fetchNames();
    } else {
      setNamesList([]);
      setFormData(prev => ({ ...prev, name: '' }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category, formData.batch]);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchNames = async () => {
    setLoadingNames(true);
    try {
      let response;
      if (formData.category === "code4bharat" || formData.category === "marketing-junction") {
        response = await axios.get(`${API_URL}/api/people/`, {
          headers: getAuthHeaders(),
          params: { category: formData.category }
        });
      } else {
        response = await axios.get(`${API_URL}/api/people/`, {
          headers: getAuthHeaders(),
          params: { category: formData.category, batch: formData.batch }
        });
      }

      if (response.data.success && Array.isArray(response.data.names)) {
        // Filter out disabled people
        const enabled = response.data.names.filter(person => !person.disabled);
        setNamesList(enabled);
      } else {
        setNamesList([]);
      }
    } catch (error) {
      console.error('Fetch names error:', error);
      toast.error('Failed to load names');
    } finally {
      setLoadingNames(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'category') {
      setFormData(prev => ({ ...prev, category: value, batch: '', name: '' }));
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
    if (!formData.name) {
      toast.error('Please select a name');
      return false;
    }
    if (!formData.course) {
      toast.error('Please select letter type');
      return false;
    }
    if (formData.course === 'Appreciation Letter' && !formData.description.trim()) {
      toast.error('Please enter the description for Appreciation Letter');
      return false;
    }
    if (formData.description && formData.description.length > 1000) {
      toast.error('Description cannot exceed 1000 characters');
      return false;
    }
    if (!formData.issueDate) {
      toast.error('Please select issue date');
      return false;
    }
    return true;
  };

  const isDescriptionInvalid =
    formData.course === 'Appreciation Letter' &&
    (formData.description.trim().length < 10 || formData.description.trim().length > 1000);

  const handlePreview = () => {
    if (validateForm()) {
      setShowOtpModal(true);
    }
  };

  const sendOTP = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/certificates/otp/send`,
        { phone: "919321488422", name: 'HR-NEXCORE ALLIANCE' }, // adjust if your backend expects different payload
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
      console.error('sendOTP error:', error);
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
      generatePreview();
    } else {
      toast.error('Please enter complete OTP');
    }
  };

  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      const payload = {
        ...formData,
        // if you need to map fields differently for letters API, change here
      };

      const response = await axios.post(
        `${API_URL}/api/letters/preview`,
        payload,
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );

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
      const payload = { ...formData };
      const response = await axios.post(
        `${API_URL}/api/letters`,
        payload,
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          // router.push('/letters') // optional redirect
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to create letter');
      }
    } catch (error) {
      console.error('Create letter error:', error);
      toast.error('Failed to create letter');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <Toaster position="top-center" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <motion.button whileHover={{ x: -5 }} onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </motion.button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create Letter
              </h1>
              <p className="text-gray-600 mt-2">Generate Appreciation or Experience letters with OTP verification</p>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Letter Information
              </h2>

              <div className="space-y-6">
                {/* Category */}
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

                {/* Batch selection (if needed) */}
                {formData.category && categoryConfig[formData.category]?.batches?.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 inline mr-2" />
                      Batch *
                    </label>
                    <select
                      value={formData.batch || ''}
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

                {/* Name */}
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
                      {namesList.map((person, idx) => (
                        <option key={idx} value={person.name}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Course / Letter Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Letter Type *
                  </label>
                  <select
                    value={formData.course}
                    onChange={(e) => handleInputChange('course', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="">Select Letter Type</option>
                    <option value="Appreciation Letter">Appreciation Letter</option>
                    <option value="Experience Certificate">Experience Certificate</option>
                  </select>
                </div>

                {/* Description (required for Appreciation) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description {formData.course === 'Appreciation Letter' && '*'}
                  </label>
                  <p className={`text-xs mt-1 ${formData.description.length > 1000 ? 'text-red-500' : 'text-gray-500'}`}>
                    {formData.description.length}/1000 characters
                  </p>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter description"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
                    rows={4}
                    maxLength={1000}
                  />
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
                  disabled={isDescriptionInvalid}
                  onClick={handlePreview}
                  className={`w-full text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2
                    ${isDescriptionInvalid ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}
                >
                  <Shield className="w-5 h-5" />
                  Verify & Preview
                </motion.button>
              </div>
            </motion.div>

            {/* Info / Preview Placeholder */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Instructions</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">1.</span><span>Select category and batch (if applicable)</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">2.</span><span>Choose the recipient name from the dropdown</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">3.</span><span>Select letter type</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">4.</span><span>Fill description</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">5.</span><span>Verify via WhatsApp OTP</span></li>
                  <li className="flex items-start gap-2"><span className="text-blue-600 font-bold">6.</span><span>Review preview and create letter</span></li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-start gap-3">
                  <FaWhatsapp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">WhatsApp OTP Verification</h4>
                    <p className="text-sm text-gray-700">For security, you'll receive a 6-digit OTP via WhatsApp before creating the letter.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Preview + Create
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <motion.button whileHover={{ x: -5 }} onClick={() => setShowPreview(false)} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
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
                    Create Letter
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
                <img src={previewImage} alt="Letter Preview" className="w-full rounded-lg shadow-md border border-gray-200" />
              ) : null}

              <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">Letter Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Name:</span><span className="font-semibold text-gray-900">{formData.name}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Type:</span><span className="font-semibold text-gray-900">{formData.course}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Issue Date:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.issueDate ? new Date(formData.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTP Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative">
                <button onClick={() => setShowOtpModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                    <FaWhatsapp className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp OTP Verification</h2>
                  <p className="text-gray-600">
                    {otpSent ? 'Enter the 6-digit code sent to your WhatsApp' : 'We will send an OTP to verify this action'}
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

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={verifyOTP} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg mb-3 flex items-center justify-center gap-2">
                      <FaWhatsapp className="w-5 h-5" />
                      Verify OTP
                    </motion.button>

                    <button onClick={resendTimer === 0 ? sendOTP : null} disabled={resendTimer > 0} className="w-full text-green-600 py-2 font-medium disabled:text-gray-400 transition-colors">
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </>
                ) : (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={sendOTP} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md">
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ duration: 0.5 }}>
                  <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                <p className="text-gray-600">Letter created successfully! WhatsApp notification sent to the user.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
