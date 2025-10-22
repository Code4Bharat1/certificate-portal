'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Search, CheckCircle, XCircle, Loader2, Award, Calendar, User, BookOpen, Tag, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

// Configure your API base URL here
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function QuickActions() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verifyId, setVerifyId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    category: '',
    course: '',
    date: '',
  });

  // Auto-dismiss verification result after 5 seconds
  useEffect(() => {
    if (verificationResult) {
      const timer = setTimeout(() => {
        setVerificationResult(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [verificationResult]);

  // Fetch courses when category changes
  useEffect(() => {
    if (certForm.category) {
      fetchCourses(certForm.category);
    } else {
      setCourses([]);
      setCertForm(prev => ({ ...prev, course: '' }));
    }
  }, [certForm.category]);

  const fetchCourses = async (category) => {
    setLoadingCourses(true);
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.get(`${API_URL}/api/certificates/courses/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = async () => {
    await handleCreateCertificate();
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setShowCreateModal(false);
      setCertForm({ name: "", category: "", course: "", date: "" });
    }, 10000);
  };

  const handleVerify = async () => {
    if (!verifyId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      const response = await axios.post(`${API_URL}/api/certificates/verify`,
        { certificateId: verifyId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const { valid, data } = response.data;

      setVerificationResult({
        valid: valid,
        id: data?.certificateId || verifyId,
        name: data?.name || null,
        course: data?.course || null,
        date: data?.issueDate || null,
        category: data?.category || null,
        status: data?.status || null
      });

      if (valid) {
        toast.success('Certificate verified successfully!');
      } else {
        toast.error('Invalid certificate!');
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      if (error.response?.status === 404) {
        setVerificationResult({
          valid: false,
          id: verifyId,
          name: null,
          course: null,
          date: null,
          category: null,
          status: null
        });
        toast.error('Certificate not found!');
      } else if (error.response?.status === 400) {
        toast.error('Invalid certificate ID format');
      } else {
        toast.error('Failed to verify certificate. Please try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCreateCertificate = async () => {
    if (!certForm.name || !certForm.category || !certForm.course || !certForm.date) {
      toast.error('Please fill all fields');
      return;
    }

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
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        toast.success(`Certificate created successfully! ID: ${response.data.data.certificateId}`);
        setShowCreateModal(false);
        setCertForm({ name: '', category: '', course: '', date: '' });
      }
    } catch (error) {
      console.error('Creation error:', error);
      
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Invalid certificate data');
      } else if (error.response?.status === 409) {
        toast.error('Certificate already exists');
      } else {
        toast.error('Failed to create certificate. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleCategoryChange = (category) => {
    setCertForm({
      ...certForm,
      category: category,
      course: '' // Reset course when category changes
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 overflow-hidden border border-gray-100"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -z-0" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/50 to-teal-100/50 rounded-full blur-3xl -z-0" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-8 h-8 text-purple-600" />
            </motion.div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Quick Actions
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  {/* Create Certificate Button */}
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => setShowCreateModal(true)}
    className="group relative overflow-hidden flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-12 -left-12 w-24 h-24 bg-white/10 rounded-full blur-xl"
    />
    <PlusCircle className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
    <span className="relative z-10">Create Certificate</span>
  </motion.button>

  {/* Certificate ID Input */}
  <div className="relative">
    <input
      type="text"
      value={verifyId}
      onChange={(e) => setVerifyId(e.target.value)}
      onKeyPress={(e) => e.key === 'Enter' && !isVerifying && handleVerify()}
      placeholder="Enter Certificate ID"
      disabled={isVerifying}
      className="w-full pl-12 pr-4 py-6 text-gray-800 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm text-lg"
    />
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
  </div>

  {/* Verify Button */}
  <motion.button
    whileHover={{ scale: isVerifying ? 1 : 1.02, y: isVerifying ? 0 : -2 }}
    whileTap={{ scale: isVerifying ? 1 : 0.98 }}
    onClick={handleVerify}
    disabled={isVerifying}
    className="px-6 py-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group shadow-lg"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    {isVerifying ? (
      <Loader2 className="w-6 h-6 animate-spin relative z-10" />
    ) : (
      <Search className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform" />
    )}
    <span className="relative z-10">{isVerifying ? 'Verifying...' : 'Verify'}</span>
  </motion.button>
</div>

          {/* Verification Result */}
          <AnimatePresence>
            {verificationResult && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, type: "spring" }}
                className={`relative overflow-hidden ${
                  verificationResult.valid 
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                    : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                } border-2 rounded-2xl p-6 shadow-lg`}
              >
                {/* Animated background */}
                <div className={`absolute inset-0 ${
                  verificationResult.valid ? 'bg-green-100/20' : 'bg-red-100/20'
                } animate-pulse`} />
                
                <div className="flex items-start gap-4 relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`p-3 rounded-2xl ${
                      verificationResult.valid 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-br from-red-500 to-pink-600'
                    } shadow-lg`}
                  >
                    {verificationResult.valid ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </motion.div>
                  
                  <div className="flex-1">
                    <motion.h3
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className={`text-xl font-bold ${
                        verificationResult.valid ? 'text-green-900' : 'text-red-900'
                      } mb-3 flex items-center gap-2`}
                    >
                      {verificationResult.valid ? (
                        <>
                          <Award className="w-5 h-5" />
                          Valid Certificate
                        </>
                      ) : (
                        'Invalid Certificate'
                      )}
                    </motion.h3>
                    
                    {verificationResult.valid && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                      >
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-xl p-3">
                          <Tag className="w-4 h-4 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Certificate ID</p>
                            <p className="text-gray-600">{verificationResult.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-xl p-3">
                          <User className="w-4 h-4 text-purple-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Name</p>
                            <p className="text-gray-600">{verificationResult.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-xl p-3">
                          <BookOpen className="w-4 h-4 text-green-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Course</p>
                            <p className="text-gray-600">{verificationResult.course}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 rounded-xl p-3">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Issue Date</p>
                            <p className="text-gray-600">
                              {verificationResult.date ? new Date(verificationResult.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              }) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 flex items-center justify-between bg-white/60 rounded-xl p-3">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-indigo-600" />
                            <p className="font-semibold text-gray-900">Category:</p>
                            <span className="text-gray-600">
                              {verificationResult.category === 'code4bharat' ? 'Code4Bharat' : 'Marketing Junction'}
                            </span>
                          </div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                            verificationResult.status === 'downloaded' ? 'bg-green-600 text-white' :
                            verificationResult.status === 'pending' ? 'bg-yellow-500 text-white' :
                            'bg-gray-600 text-white'
                          }`}>
                            {verificationResult.status?.toUpperCase()}
                          </span>
                        </div>
                      </motion.div>
                    )}
                    
                    {!verificationResult.valid && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-red-700"
                      >
                        Certificate ID not found in the system.
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Create Certificate Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => !isCreating && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto border-2 border-gray-100"
            >
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-0" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl -z-0" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg"
                    >
                      <Award className="w-6 h-6 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Create Certificate
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !isCreating && setShowCreateModal(false)}
                    disabled={isCreating}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-indigo-600" />
                      Name
                    </label>
                    <input
                      type="text"
                      value={certForm.name}
                      onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                      disabled={isCreating}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                    />
                  </div>

                  {/* Category Field */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      Category
                    </label>
                    <select
                      value={certForm.category}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      disabled={isCreating}
                      className="w-full px-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                    >
                      <option value="">Select Category</option>
                      <option value="marketing-junction">Marketing Junction</option>
                      <option value="code4bharat">Code4Bharat</option>
                    </select>
                  </div>

                  {/* Course Dropdown */}
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
                            <span className="ml-2 text-gray-600">
                              Loading courses...
                            </span>
                          </div>
                        ) : (
                          <select
                            value={certForm.course}
                            onChange={(e) =>
                              setCertForm({
                                ...certForm,
                                course: e.target.value,
                              })
                            }
                            disabled={isCreating || loadingCourses}
                            className="w-full px-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                          >
                            <option value="">Select Course</option>
                            {courses.map((course, index) => (
                              <option key={index} value={course}>
                                {course}
                              </option>
                            ))}
                          </select>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Issue Date */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-orange-600" />
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={certForm.date}
                      onChange={(e) =>
                        setCertForm({ ...certForm, date: e.target.value })
                      }
                      disabled={isCreating}
                      className="w-full px-4 py-3 text-black border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 bg-white"
                    />
                  </div>

                  {/* Preview Section */}
                  {certForm.name && certForm.category && certForm.course && certForm.date && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 text-sm text-gray-700"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-indigo-700">Preview:</h3>
                      </div>
                      <p><b>Name:</b> {certForm.name}</p>
                      <p><b>Category:</b> {certForm.category}</p>
                      <p><b>Course:</b> {certForm.course}</p>
                      <p><b>Issue Date:</b> {certForm.date}</p>
                    </motion.div>
                  )}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSuccess}
                      disabled={
                        isCreating ||
                        !certForm.name ||
                        !certForm.category ||
                        !certForm.course ||
                        !certForm.date
                      }
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                          <span className="relative z-10">Creating...</span>
                        </>
                      ) : (
                        <span className="relative z-10">Create Certificate</span>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowCreateModal(false);
                        setCertForm({
                          name: "",
                          category: "",
                          course: "",
                          date: "",
                        });
                      }}
                      disabled={isCreating}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                  </div>

                  {/* Success Overlay */}
                  <AnimatePresence>
                    {showSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                          className="text-center"
                        >
                          <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-2xl mb-4">
                            <CheckCircle className="w-16 h-16 text-white" />
                          </div>
                          <p className="text-xl font-bold text-gray-900">Certificate Created Successfully!</p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}