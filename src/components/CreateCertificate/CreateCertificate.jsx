'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Award, Calendar, User, BookOpen, Tag, Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

export default function CreateCertificate() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [certForm, setCertForm] = useState({
    name: '',
    category: '',
    course: '',
    date: '',
  });

  useEffect(() => {
    if (certForm.category) {
      fetchCourses(certForm.category);
    } else {
      setCourses([]);
      setCertForm(prev => ({ ...prev, course: '' }));
    }
  }, [certForm.category]);

  // Generate preview when all fields are filled
  useEffect(() => {
    if (certForm.name && certForm.category && certForm.course && certForm.date) {
      generatePreview();
    } else {
      setPreviewImage(null);
    }
  }, [certForm.name, certForm.category, certForm.course, certForm.date]);

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

  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      const token = typeof window !== 'undefined' 
        ? sessionStorage.getItem('authToken') 
        : null;

      // Create a temporary certificate to get preview
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
      // Don't show error toast for preview failures
      setPreviewImage(null);
    } finally {
      setLoadingPreview(false);
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
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setCertForm({ name: '', category: '', course: '', date: '' });
        }, 3000);
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
      course: ''
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 overflow-hidden border-2 border-gray-100">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl -z-0" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg"
                >
                  <Award className="w-8 h-8 text-white" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Create Certificate
                </h1>
              </div>

              <div className="space-y-6">
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
                    <option value="marketing-junction">Marketing Junction</option>
                    <option value="code4bharat">Code4Bharat</option>
                  </select>
                </div>

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
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin relative z-10" />
                      <span className="relative z-10">Creating...</span>
                    </>
                  ) : (
                    <span className="relative z-10">Create Certificate</span>
                  )}
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
                    <p><b>Category:</b> {certForm.category === 'code4bharat' ? 'Code4Bharat' : 'Marketing Junction'}</p>
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
                <p className="text-gray-600">Certificate Created Successfully!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}