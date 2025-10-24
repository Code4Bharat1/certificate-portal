'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, Award, Calendar, User, BookOpen, Tag, Sparkles, ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

export default function VerifyCertificate() {
  const router = useRouter();
  const [verifyId, setVerifyId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

//   useEffect(() => {
//     if (verificationResult) {
//       const timer = setTimeout(() => {
//         setVerificationResult(null);
//         setPreviewImage(null);
//       }, 10000);
//       return () => clearTimeout(timer);
//     }
//   }, [verificationResult]);

  const fetchCertificatePreview = async (certificateId) => {
    setLoadingPreview(true);
    try {
      const response = await axios.get(`${API_URL}/api/certificates/${certificateId}/download/jpg`, {
        responseType: 'blob'
      });

      const imageUrl = URL.createObjectURL(response.data);
      setPreviewImage(imageUrl);
    } catch (error) {
      console.error('Preview fetch error:', error);
      setPreviewImage(null);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleVerify = async () => {
    if (!verifyId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);
    setPreviewImage(null);

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
        // Fetch preview for valid certificates
        fetchCertificatePreview(data.certificateId);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
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

        <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 overflow-hidden border-2 border-gray-100">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-100/50 to-cyan-100/50 rounded-full blur-3xl -z-0" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="w-8 h-8 text-green-600" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Verify Certificate
              </h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="relative md:col-span-2">
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

            <AnimatePresence>
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="space-y-6"
                >
                  {/* Verification Result Card */}
                  <div className={`relative overflow-hidden ${
                    verificationResult.valid 
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300' 
                      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                  } border-2 rounded-2xl p-6 shadow-lg`}>
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
                  </div>

                  {/* Preview Section - Only show for valid certificates */}
                  {verificationResult.valid && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-green-600" />
                        <h3 className="text-xl font-bold text-gray-800">Certificate Preview</h3>
                      </div>

                      {loadingPreview ? (
                        <div className="w-full aspect-[1.414/1] bg-gray-100 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-3" />
                            <p className="text-gray-600">Loading preview...</p>
                          </div>
                        </div>
                      ) : previewImage ? (
                        <motion.img 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={previewImage} 
                          alt="Certificate Preview" 
                          className="w-full rounded-xl shadow-lg border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500">
                            <Award className="w-16 h-16 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Preview not available</p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}