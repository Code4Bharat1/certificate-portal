'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Award, 
  Calendar, 
  User, 
  BookOpen, 
  Tag, 
  Sparkles, 
  ArrowLeft, 
  Download,
  Shield,
  Copy,
  Info,
  AlertTriangle,
  BadgeCheck,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [showTips, setShowTips] = useState(false);

  // Animation variants for smoother transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1,
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    setIsAdmin(!!token);
    
    // Check for URL params that might have the certificate ID
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const certId = urlParams.get('id');
      if (certId) {
        setVerifyId(certId);
        handleVerify(certId);
      }
    }
    
    // Load recent verifications from localStorage
    try {
      const storedVerifications = localStorage.getItem('recentVerifications');
      if (storedVerifications) {
        setRecentVerifications(JSON.parse(storedVerifications).slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to load recent verifications:', error);
    }
  }, []);

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

  const handleVerify = async (customId) => {
    const idToVerify = customId || verifyId.trim();
    
    if (!idToVerify) {
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
        { certificateId: idToVerify }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const { valid, data } = response.data;

      const result = {
        valid: valid,
        id: data?.certificateId || idToVerify,
        name: data?.name || null,
        course: data?.course || null,
        date: data?.issueDate || null,
        category: data?.category || null,
        status: data?.status || null
      };

      setVerificationResult(result);

      // Add to recent verifications
      if (typeof window !== 'undefined') {
        try {
          const storedVerifications = localStorage.getItem('recentVerifications');
          const existingVerifications = storedVerifications ? JSON.parse(storedVerifications) : [];
          
          // Remove duplicates and add new one at the beginning
          const filteredVerifications = existingVerifications
            .filter(v => v.id !== result.id)
            .slice(0, 4);
            
          const updatedVerifications = [
            { 
              id: result.id, 
              name: result.name, 
              valid: result.valid,
              timestamp: new Date().toISOString()
            },
            ...filteredVerifications
          ];
          
          localStorage.setItem('recentVerifications', JSON.stringify(updatedVerifications));
          setRecentVerifications(updatedVerifications);
        } catch (error) {
          console.error('Failed to update recent verifications:', error);
        }
      }

      if (valid) {
        toast.success('Certificate verified successfully!');
        fetchCertificatePreview(data.certificateId);
      } else {
        toast.error('Invalid certificate!');
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      if (error.response?.status === 404) {
        setVerificationResult({
          valid: false,
          id: idToVerify,
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const resetVerification = () => {
    setVerificationResult(null);
    setPreviewImage(null);
    setVerifyId('');
  };

  const getCategoryLabel = (category) => {
    switch(category) {
      case 'code4bharat': return 'Code4Bharat';
      case 'bootcamp': return 'BootCamp';
      case 'marketing-junction': return 'Marketing Junction';
      case 'bvoc': return 'BVOC';
      case 'fsd': return 'FSD';
      default: return category;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4 md:p-8">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 3000,
          success: { 
            style: { 
              background: 'rgba(46, 204, 113, 0.95)',
              color: 'white',
              backdropFilter: 'blur(4px)'
            },
            iconTheme: { primary: 'white', secondary: 'rgba(46, 204, 113, 0.95)' }
          },
          error: { 
            style: { 
              background: 'rgba(231, 76, 60, 0.95)', 
              color: 'white',
              backdropFilter: 'blur(4px)'
            },
            iconTheme: { primary: 'white', secondary: 'rgba(231, 76, 60, 0.95)' }
          }
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header with Back Button (only visible for admin) */}
        <div className="flex items-center justify-between mb-4">
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-medium ml-auto"
          >
            <Info className="w-5 h-5 text-emerald-600" />
            Verification Tips
          </motion.button>
        </div>

        <AnimatePresence>
          {showTips && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-5 mb-6 border-l-4 border-emerald-500 overflow-hidden"
            >
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Certificate Verification Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Certificate IDs are typically 24 characters long alphanumeric strings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>You can find the Certificate ID on the bottom of your physical certificate or in the email you received</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>Make sure to enter the complete ID without any extra spaces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>If you're having trouble, contact support at support@code4bharat.com</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Verification Card */}
        <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 overflow-hidden border border-gray-200">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/50 to-emerald-100/50 rounded-full blur-3xl -z-0" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-teal-100/50 to-cyan-100/50 rounded-full blur-3xl -z-0" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-50/30 to-green-50/30 rounded-full blur-3xl -z-0 animate-pulse" />

          <div className="relative z-10">
            {/* Header with Animation */}
            <motion.div 
              className="flex items-center gap-3 mb-8"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Certificate Verification
                </h1>
                <p className="text-gray-600">Verify the authenticity of your certificates and letters</p>
              </div>
            </motion.div>
            
            {/* Input Field with Pulsing Border Animation */}
            <div className="bg-white rounded-3xl shadow-lg border border-emerald-100 p-1 mb-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/20 via-green-200/20 to-emerald-200/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="relative md:col-span-3">
                  <input
                    type="text"
                    value={verifyId}
                    onChange={(e) => setVerifyId(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isVerifying && handleVerify()}
                    placeholder="Enter Certificate ID"
                    disabled={isVerifying}
                    className="w-full pl-12 pr-4 py-6 text-gray-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all disabled:bg-gray-50 disabled:cursor-not-allowed bg-white text-lg border-0"
                  />
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-emerald-500" />
                </div>

                <motion.button
                  whileHover={{ scale: isVerifying ? 1 : 1.02 }}
                  whileTap={{ scale: isVerifying ? 1 : 0.98 }}
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !verifyId.trim()}
                  className={`px-6 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all duration-300 relative overflow-hidden ${
                    isVerifying || !verifyId.trim() 
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-lg'
                  }`}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Verifying</span>
                    </>
                  ) : (
                    <>
                      <BadgeCheck className="w-5 h-5" />
                      <span>Verify</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Recent Verifications */}
            {recentVerifications.length > 0 && !verificationResult && (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <div className="flex items-center gap-2 mb-3">
                  <RefreshCw className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-gray-800">Recent Verifications</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {recentVerifications.map((item, index) => (
                    <motion.div
                      key={item.id}
                      variants={itemVariants}
                      transition={{ duration: 0.2, delay: index * 0.1 }}
                      className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        item.valid
                          ? 'bg-green-50 border border-green-100 hover:bg-green-100'
                          : 'bg-red-50 border border-red-100 hover:bg-red-100'
                      }`}
                      onClick={() => {
                        setVerifyId(item.id);
                        handleVerify(item.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          item.valid ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {item.valid ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <XCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-800">{item.name || 'Unknown Certificate'}</p>
                            <span className="text-xs text-gray-500">
                              {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{item.id}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:transform group-hover:translate-x-1 transition-transform" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Verification Result */}
            <AnimatePresence>
              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="space-y-6"
                >
                  {/* Verification Status Card */}
                  <motion.div 
                    className={`relative overflow-hidden ${
                      verificationResult.valid 
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200'
                    } border-2 rounded-2xl p-6 shadow-xl`}
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm" />
                    
                    {/* Status Indicator Animation */}
                    {verificationResult.valid && (
                      <motion.div
                        className="absolute inset-0 opacity-20"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 1.1, 1], opacity: [0, 0.2, 0.1] }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
                      >
                        <div className="w-full h-full bg-green-500 rounded-full blur-3xl" />
                      </motion.div>
                    )}
                    
                    <div className="flex items-start gap-4 relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 10, 0] }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className={`p-4 rounded-2xl shadow-lg ${
                          verificationResult.valid 
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-br from-red-500 to-pink-600'
                        }`}
                      >
                        {verificationResult.valid ? (
                          <CheckCircle className="w-8 h-8 text-white" />
                        ) : (
                          <XCircle className="w-8 h-8 text-white" />
                        )}
                      </motion.div>
                      
                      <div className="flex-1">
                        <motion.div
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className={`text-xl font-bold mb-2 ${
                            verificationResult.valid ? 'text-green-800' : 'text-red-800'
                          }`}
                        >
                          <h2 className="flex items-center gap-2">
                            {verificationResult.valid ? (
                              <>
                                <BadgeCheck className="w-6 h-6" />
                                Authentic Certificate
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-6 h-6" />
                                Invalid Certificate
                              </>
                            )}
                          </h2>
                          
                          {verificationResult.valid ? (
                            <p className="text-sm font-normal text-green-700 mt-1">
                              This certificate has been verified and is authentic.
                            </p>
                          ) : (
                            <p className="text-sm font-normal text-red-700 mt-1">
                              We couldn't verify this certificate. Please check the ID and try again.
                            </p>
                          )}
                        </motion.div>
                        
                        {/* Valid Certificate Details */}
                        {verificationResult.valid && (
                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 gap-3"
                          >
                            <motion.div 
                              variants={itemVariants}
                              className="flex items-center gap-3 text-sm text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-colors shadow-sm border border-green-100"
                            >
                              <Tag className="w-5 h-5 text-blue-600" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">Certificate ID</p>
                                <div className="flex items-center gap-2">
                                  <p className="text-gray-600 break-all">{verificationResult.id}</p>
                                  <button 
                                    onClick={() => copyToClipboard(verificationResult.id)}
                                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              variants={itemVariants}
                              className="flex items-center gap-3 text-sm text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-colors shadow-sm border border-green-100"
                            >
                              <User className="w-5 h-5 text-purple-600" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">Recipient</p>
                                <p className="text-gray-600">{verificationResult.name}</p>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              variants={itemVariants}
                              className="flex items-center gap-3 text-sm text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-colors shadow-sm border border-green-100"
                            >
                              <BookOpen className="w-5 h-5 text-emerald-600" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">Course/Program</p>
                                <p className="text-gray-600">{verificationResult.course}</p>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              variants={itemVariants}
                              className="flex items-center gap-3 text-sm text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-colors shadow-sm border border-green-100"
                            >
                              <Calendar className="w-5 h-5 text-orange-600" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">Issue Date</p>
                                <p className="text-gray-600">
                                  {verificationResult.date ? new Date(verificationResult.date).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  }) : 'N/A'}
                                </p>
                              </div>
                            </motion.div>
                            
                            <motion.div 
                              variants={itemVariants}
                              className="md:col-span-2 flex items-center gap-3 text-sm text-gray-700 bg-white/80 backdrop-blur-sm rounded-xl p-4 hover:bg-white/90 transition-colors shadow-sm border border-green-100"
                            >
                              <Award className="w-5 h-5 text-indigo-600" />
                              <div className="flex-1 flex justify-between items-center">
                                <div>
                                  <p className="font-semibold text-gray-900">Issuing Organization</p>
                                  <p className="text-gray-600">
                                    {getCategoryLabel(verificationResult.category)}
                                  </p>
                                </div>
                                
                                <span className={`px-4 py-1 rounded-full text-xs font-bold shadow-sm ${
                                  verificationResult.status === 'downloaded' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-amber-500 text-white'
                                }`}>
                                  {verificationResult.status === 'downloaded' ? 'VERIFIED' : 'PENDING'}
                                </span>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}

                        {/* Invalid Certificate Message */}
                        {!verificationResult.valid && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-red-200 mt-2"
                          >
                            <p className="text-sm text-red-700 mb-2">
                              <span className="font-semibold">Certificate ID:</span> {verificationResult.id}
                            </p>
                            <p className="text-sm text-gray-700">
                              This certificate ID was not found in our database. Please check for any typing errors and try again.
                            </p>
                            <div className="mt-4 flex gap-2">
                              <button
                                onClick={resetVerification}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                              </button>
                              <a
                                href="mailto:support@code4bharat.com?subject=Certificate Verification Issue"
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center gap-1"
                              >
                                <Info className="w-4 h-4" />
                                Contact Support
                              </a>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Certificate Preview Section */}
                  {verificationResult.valid && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="bg-white rounded-2xl p-6 shadow-xl border border-emerald-100"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <Award className="w-6 h-6 text-emerald-600" />
                          <h3 className="text-xl font-bold text-gray-800">Certificate Preview</h3>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={resetVerification}
                          className="px-3 py-1 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="w-4 h-4" />
                          New Search
                        </motion.button>
                      </div>

                      {loadingPreview ? (
                        <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
                          <div className="text-center">
                            <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-4 opacity-60" />
                            <p className="text-gray-600 font-medium">Loading certificate preview...</p>
                          </div>
                        </div>
                      ) : previewImage ? (
                        <div className="space-y-4">
                          <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring" }}
                            className="relative group overflow-hidden rounded-xl shadow-lg border-2 border-emerald-100"
                          >
                            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6">
                              <p className="text-white text-center font-medium">Click to view full size image</p>
                            </div>
                            <img 
                              src={previewImage} 
                              alt="Certificate Preview" 
                              className="w-full h-auto"
                              onClick={() => window.open(previewImage, '_blank')}
                            />
                          </motion.div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.a
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              href={`${API_URL}/api/certificates/${verificationResult.id}/download/pdf`}
                              target="_blank"
                              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                              <Download className="w-5 h-5" />
                              Download PDF
                            </motion.a>
                            
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                const link = `${window.location.origin}${window.location.pathname}?id=${verificationResult.id}`;
                                copyToClipboard(link);
                              }}
                              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2"
                            >
                              <Copy className="w-5 h-5" />
                              Copy Verification Link
                            </motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-[1.414/1] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 p-6">
                          <div className="text-center">
                            <Award className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                            <p className="font-medium text-gray-700 mb-2">Preview not available</p>
                            <p className="text-sm text-gray-500 max-w-md">
                              The certificate image couldn't be loaded, but the certificate has been verified as authentic.
                            </p>
                            
                            <motion.a
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              href={`${API_URL}/api/certificates/${verificationResult.id}/download/pdf`}
                              target="_blank"
                              className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download PDF Instead
                            </motion.a>
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
        
        {/* Footer Section */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Verification system by Code4Bharat. For support, contact <a href="mailto:support@code4bharat.com" className="text-emerald-600 hover:underline">support@code4bharat.com</a></p>
        </div>
      </motion.div>
    </div>
  );
}