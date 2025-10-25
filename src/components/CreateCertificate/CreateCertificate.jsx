  'use client';

  import { useState, useEffect } from 'react';
  import { motion, AnimatePresence } from 'framer-motion';
  import { 
    Loader2, Award, Calendar, User, BookOpen, Tag, 
    CheckCircle, ArrowLeft, Mail, Shield, AlertCircle
  } from 'lucide-react';
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
    
    // Form States
    const [formData, setFormData] = useState({
      category: '',
      subCategory: '',
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

    // Category Configuration
    const categoryConfig = {
      'internship': {
        label: 'INTERNSHIP',
        subCategories: {
          'c4b': { label: 'Code4Bharat (C4B)'},
          'mj': { label: 'Marketing Junction (MJ)'}
        }
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
        // batches: ['Bootcamp Batch 1', 'Bootcamp Batch 2', 'Bootcamp Batch 3']
      }
    };

    // OTP Timer
    useEffect(() => {
      if (resendTimer > 0) {
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
      }
    }, [resendTimer]);

    // Fetch names when category and batch are selected
    useEffect(() => {
      if (formData.category && formData.batch) {
        fetchNames();
      } else {
        setNamesList([]);
        setFormData(prev => ({ ...prev, internId: '', name: '', course: '' }));
      }
    }, [formData.category, formData.batch]);

    // Fetch courses when name is selected
    useEffect(() => {
      if (formData.category && formData.batch && formData.internId) {
        fetchCourses();
      } else {
        setCoursesList([]);
        setFormData(prev => ({ ...prev, course: '' }));
      }
    }, [formData.category, formData.batch, formData.internId]);

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
          subCategory: formData.subCategory,
          batch: formData.batch
        }
      });

      if (response.data.success && response.data.names?.length > 0) {
        setNamesList(response.data.names);
      } else {
        // ✅ Use mock data if API returns empty
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
      // ✅ Use mock data in case of API failure
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
          subCategory: formData.subCategory,
          batch: formData.batch,
          internId: formData.internId
        }
      });

      if (response.data.success && response.data.courses?.length > 0) {
        setCoursesList(response.data.courses);
        setCreatedCertificates(response.data.createdCertificates || []);
      } else {
        // ✅ Use mock course data if backend returns empty
        console.warn('Using mock course data (no courses found from backend)');
        const mockCourses = [
          'Web Development Fundamentals',
          'Full Stack Development',
          'Digital Marketing Basics',
          'Python Programming Essentials',
          'Data Analytics Workshop'
        ];
        setCoursesList(mockCourses);
        setCreatedCertificates(['Web Development Fundamentals']); // Mock already created example
        toast('Loaded mock courses (testing mode)', { icon: '⚙️' });
      }
    } catch (error) {
      console.error('Fetch courses error:', error);
      toast.error('Failed to load courses (using mock data)');
      // ✅ Use mock data in case of API error
      const mockCourses = [
        'Web Development Fundamentals',
        'Full Stack Development',
        'Digital Marketing Basics',
        'Python Programming Essentials',
        'Data Analytics Workshop'
      ];
      setCoursesList(mockCourses);
      setCreatedCertificates(['Full Stack Development']); // Optional: show one as created
    } finally {
      setLoadingCourses(false);
    }
  };


    const generatePreview = async () => {
      setLoadingPreview(true);
      try {
        const response = await axios.post(`${API_URL}/api/certificates/preview`, {
          name: formData.name,
          category: formData.category,
          course: formData.course,
          issueDate: formData.issueDate,
        }, {
          headers: getAuthHeaders(),
          responseType: 'blob'
        });

        const imageUrl = URL.createObjectURL(response.data);
        setPreviewImage(imageUrl);
        setShowPreview(true);
      } catch (error) {
        console.error('Preview generation error:', error);
        toast.error('Failed to generate preview');
      } finally {
        setLoadingPreview(false);
      }
    };

    const sendOTP = async () => {
      try {
        const response = await axios.post(`${API_URL}/api/certificates/otp/send`, {
          // email: sessionStorage.getItem('userEmail')
          phone: "919321488422",
          name: "Abdul Wahid",
        }, {
          headers: getAuthHeaders()
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
        const response = await axios.post(`${API_URL}/api/certificates/otp/verify`, {
          otp: otpCode,
          phone: "919321488422"
          // email: sessionStorage.getItem('userEmail')
        }, {
          headers: getAuthHeaders()
        });

        if (response.data.success) {
          setOtpVerified(true);
          toast.success('OTP verified successfully');
          setShowOtpModal(false);
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

    const handleVerifyClick = () => {
      if (!formData.name || !formData.category || !formData.course || !formData.issueDate) {
        toast.error('Please fill all fields');
        return;
      }
      setShowOtpModal(true);
      if (!otpSent) {
        sendOTP();
      }
    };

    const handleCreateCertificate = async () => {
      setIsCreating(true);
      try {
        const response = await axios.post(`${API_URL}/api/certificates/create`, {
          ...formData
        }, {
          headers: getAuthHeaders()
        });

        if (response.data.success) {
          toast.success(`Certificate created successfully! ID: ${response.data.certificateId}`);
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            resetForm();
          }, 3000);
        }
      } catch (error) {
        console.error('Creation error:', error);
        toast.error(error.response?.data?.message || 'Failed to create certificate');
      } finally {
        setIsCreating(false);
      }
    };

    const resetForm = () => {
      setFormData({
        category: '',
        subCategory: '',
        batch: '',
        internId: '',
        name: '',
        course: '',
        issueDate: ''
      });
      setOtpVerified(false);
      setOtp(['', '', '', '', '', '']);
      setShowPreview(false);
      setPreviewImage(null);
      setOtpSent(false);
    };

    const handleCategoryChange = (category) => {
      setFormData({
        category,
        subCategory: '',
        batch: '',
        internId: '',
        name: '',
        course: '',
        issueDate: formData.issueDate
      });
    };

    const getBatchOptions = () => {
      if (!formData.category) return [];
      
      const config = categoryConfig[formData.category];
      if (config.subCategories && formData.subCategory) {
        return config.subCategories[formData.subCategory]?.batches || [];
      }
      return config.batches || [];
    };

    const isCourseCreated = (courseName) => {
      return createdCertificates.includes(courseName);
    };

    return (
      <div className="min-h-screen bg-gradient-to-br text-black from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
        <Toaster position="top-right" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <motion.button
            whileHover={{ scale: 1.05, x: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/dashboard')}
            className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </motion.button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Award className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Create Certificate</h1>
                  <p className="text-sm text-gray-500">Fill in the details to generate certificate</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Category Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 text-indigo-600" />
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    disabled={otpVerified}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-category for Internship */}
                {formData.category === 'internship' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Tag className="w-4 h-4 text-purple-600" />
                      Internship Type
                    </label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value, batch: '', internId: '', name: '', course: '' })}
                      disabled={otpVerified}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
                    >
                      <option value="">Select Type</option>
                      {Object.entries(categoryConfig.internship.subCategories).map(([key, sub]) => (
                        <option key={key} value={key}>{sub.label}</option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {/* Batch Selection */}
                {/* Batch Selection — Hide when Internship */}
{formData.category && formData.category !== 'internship' && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
  >
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
      <BookOpen className="w-4 h-4 text-blue-600" />
      Batch
    </label>
    <select
      value={formData.batch}
      onChange={(e) => setFormData({ ...formData, batch: e.target.value, internId: '', name: '', course: '' })}
      disabled={otpVerified}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
    >
      <option value="">Select Batch</option>
      {getBatchOptions().map((batch, index) => (
        <option key={index} value={batch}>{batch}</option>
      ))}
    </select>
  </motion.div>
)}


                {/* Name Selection */}
                {formData.category && formData.batch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <User className="w-4 h-4 text-green-600" />
                      Intern Name
                    </label>
                    {loadingNames ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
                        <span className="text-gray-600">Loading names...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.internId}
                        onChange={(e) => {
                          const selected = namesList.find(n => n.internId === e.target.value);
                          setFormData({ 
                            ...formData, 
                            internId: e.target.value,
                            name: selected?.name || '',
                            course: ''
                          });
                        }}
                        disabled={otpVerified}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
                      >
                        <option value="">Select Name</option>
                        {namesList.map((person) => (
                          <option key={person.internId} value={person.internId}>
                            {person.name} ({person.internId})
                          </option>
                        ))}
                      </select>
                    )}
                  </motion.div>
                )}

                {/* Course Selection */}
                {formData.internId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <BookOpen className="w-4 h-4 text-orange-600" />
                      Course
                    </label>
                    {loadingCourses ? (
                      <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
                        <span className="text-gray-600">Loading courses...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        disabled={otpVerified}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
                      >
                        <option value="">Select Course</option>
                        {coursesList.map((course, index) => (
                          <option 
                            key={index} 
                            value={course}
                            className={isCourseCreated(course) ? 'bg-green-100 text-green-800 font-semibold' : ''}
                          >
                            {course} {isCourseCreated(course) ? '✓ (Already Created)' : ''}
                          </option>
                        ))}
                      </select>
                    )}
                    {createdCertificates.length > 0 && (
                      <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Green courses indicate certificates already created
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Issue Date */}
                {formData.course && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 text-red-600" />
                      Issue Date
                    </label>
                    <input
                      type="date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                      disabled={otpVerified}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white disabled:bg-gray-100"
                    />
                  </motion.div>
                )}

                {/* Verify Button */}
                {formData.issueDate && !otpVerified && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleVerifyClick}
                    className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    Verify with OTP
                  </motion.button>
                )}

                {/* Create and Cancel Buttons */}
                {otpVerified && showPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCreateCertificate}
                      disabled={isCreating}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
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
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      disabled={isCreating}
                      className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
                  <p className="text-sm text-gray-500">Certificate preview will appear here</p>
                </div>
              </div>

              {showPreview && otpVerified ? (
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
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch:</span>
                        <span className="font-semibold text-gray-900">{formData.batch}</span>
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

          {/* OTP Modal */}
          <AnimatePresence>
            {showOtpModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowOtpModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full"
                >
                  <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-indigo-100 rounded-full mb-4">
                      <Mail className="w-10 h-10 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">OTP Verification</h2>
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
                            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                          />
                        ))}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={verifyOTP}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg mb-3"
                      >
                        Verify OTP
                      </motion.button>

                      <button
                        onClick={resendTimer === 0 ? sendOTP : null}
                        disabled={resendTimer > 0}
                        className="w-full text-indigo-600 py-2 font-medium disabled:text-gray-400 transition-colors"
                      >
                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                      </button>
                    </>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={sendOTP}
                      className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg"
                    >
                      Send OTP
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
                  <p className="text-gray-600">Certificate Created Successfully!</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }