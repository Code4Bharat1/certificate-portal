'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileSpreadsheet, Download, CheckCircle, XCircle,
  ArrowLeft, Loader2, AlertCircle, X, FileText, Image as ImageIcon,
  User, Hash, Calendar, Award, Eye, Trash2, Home
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

export default function BulkCreateCertificate() {
  const router = useRouter();

  // States
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [isBulkCreating, setIsBulkCreating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });
  const [generatedCertificates, setGeneratedCertificates] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  // Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState(null);

  // OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    return { 'Authorization': `Bearer ${token}` };
  };

  // Handle CSV Upload
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

  // Parse CSV
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
          
          name: values[1] || '',
          phone: values[2] || '',
          course: values[3] || '',
          category: values[4] || '',
          batch: values[5] || '',
          issueDate: values[6] || new Date().toISOString().split('T')[0]
        };
      }).filter(row => row.name && row.phone);

      setCsvData(parsed);
      toast.success(`✅ ${parsed.length} records loaded from CSV`);
    };
    reader.readAsText(file);
  };

  // Download Sample CSV
  const downloadSampleCSV = () => {
    const csvContent = `
    Name,Phone,Course,Category,Batch,IssueDate
    Aarav Sharma,919876543210,Web Development Fundamentals,code4bharat,,2025-01-15
    Neha Verma,919876543211,Full Stack Development,FSD,B-1,2025-01-15
    Rahul Singh,919876543212,Digital Marketing Basics,marketing-junction,,2025-01-15
    Priya Patel,919876543213,Python Programming,BVOC,B-1,2025-01-15
    Rohan Mehta,919876543214,Data Analytics,BOOTCAMP,,2025-01-15`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'certificate_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('📥 Sample CSV downloaded!');
  };

  // Send OTP
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
      toast.error('Failed to send OTP');
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    try {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        toast.error('Please enter complete OTP');
        return;
      }

      const response = await axios.post(
        `${API_URL}/api/certificates/otp/verify`,
        {
          phone: "919321488422",
          otp: otpCode
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('✅ OTP Verified Successfully!');
        setOtpVerified(true);
        setShowOtpModal(false);
      } else {
        toast.error('Invalid OTP');
        setOtp(['', '', '', '', '', '']);
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast.error('OTP verification failed');
      setOtp(['', '', '', '', '', '']);
    }
  };

  // Handle OTP Input
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

  // Bulk Create Certificates
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
        `${API_URL}/api/certificates/bulk`,
        {
          certificates: csvData,
          adminPhone: adminData.whatsappNumber || "919321488422",
          adminName: adminData.name || 'Admin'
        },
        {
          headers: getAuthHeaders(),
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setBulkProgress(prev => ({
              ...prev,
              current: Math.floor(csvData.length * progress / 100)
            }));
          }
        }
      );

      if (response.data.success) {
        const { stats, certificates } = response.data;

        // Store generated certificates
        setGeneratedCertificates(certificates || []);

        toast.success(
          `✅ Bulk creation completed!\nSuccess: ${stats.successful} | Failed: ${stats.failed}`,
          { duration: 5000 }
        );

        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Bulk creation error:', error);
      toast.error(error.response?.data?.message || 'Bulk creation failed');
    } finally {
      setIsBulkCreating(false);
    }
  };

  // Download Certificate as PDF
  const downloadAsPDF = async (certificate) => {
    try {
      toast.loading('Generating PDF...');

      // Create a temporary div to render certificate
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.innerHTML = `
        <div style="padding: 40px; background: white; width: 800px;">
          <div style="text-align: center; border: 3px solid #4F46E5; padding: 30px; border-radius: 10px;">
            <h1 style="color: #4F46E5; font-size: 32px; margin-bottom: 10px;">Certificate of Completion</h1>
            <p style="font-size: 18px; margin: 20px 0;">This is to certify that</p>
            <h2 style="color: #1F2937; font-size: 28px; margin: 20px 0;">${certificate.name}</h2>
            <p style="font-size: 16px; margin: 20px 0;">has successfully completed</p>
            <h3 style="color: #4F46E5; font-size: 24px; margin: 20px 0;">${certificate.course}</h3>
            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px;">
              <div>
                <p><strong>Certificate ID:</strong> ${certificate.certificateId}</p>
                <p><strong>Issue Date:</strong> ${new Date(certificate.issueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p><strong>Category:</strong> ${certificate.category}</p>
                ${certificate.batch ? `<p><strong>Batch:</strong> ${certificate.batch}</p>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${certificate.name}_${certificate.certificateId}.pdf`);

      document.body.removeChild(tempDiv);
      toast.dismiss();
      toast.success('PDF downloaded!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF');
    }
  };

  // Download Certificate as JPG
  const downloadAsJPG = async (certificate) => {
    try {
      toast.loading('Generating JPG...');

      // Fetch the actual certificate image from backend
      const response = await axios.get(
        `${API_URL}/api/certificates/${certificate.certificateId}/image`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${certificate.name}_${certificate.certificateId}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success('JPG downloaded!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to download JPG');
    }
  };

  // Preview Certificate
  const handlePreview = (certificate) => {
    setPreviewCertificate(certificate);
    setShowPreviewModal(true);
  };

  // Reset Form
  const resetForm = () => {
    setCsvFile(null);
    setCsvData([]);
    setGeneratedCertificates([]);
    setOtpVerified(false);
    setOtp(['', '', '', '', '', '']);
    setShowSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 p-6">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <motion.button
              whileHover={{ x: -5 }}
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-white/50 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </motion.button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                Bulk Certificate Creation
              </h1>
              <p className="text-gray-600 mt-2">Upload CSV file to generate multiple certificates at once</p>
            </div>

            {generatedCertificates.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetForm}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Create New Batch
              </motion.button>
            )}
          </div>
        </div>

        {/* Main Content */}
        {generatedCertificates.length === 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-purple-600" />
                Upload CSV File
              </h2>

              <div className="space-y-6">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50">
                  <input
                    type="file"
                    id="csvInput"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                  <label htmlFor="csvInput" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <Upload className="text-white" size={40} />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-700">
                          {csvFile ? csvFile.name : 'Click to upload CSV file'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {csvData.length > 0
                            ? `${csvData.length} records loaded`
                            : 'Upload CSV with student details'}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* CSV Data Preview */}
                {csvData.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <h3 className="font-bold text-gray-900 mb-3">Preview ({csvData.length} records)</h3>
                    <div className="space-y-2">
                      {csvData.slice(0, 5).map((row, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{row.name}</p>
                              <p className="text-sm text-gray-600">{row.course}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{row.category}</p>
                              {row.batch && <p className="text-xs text-gray-500">{row.batch}</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                      {csvData.length > 5 && (
                        <p className="text-center text-sm text-gray-500 py-2">
                          ... and {csvData.length - 5} more records
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBulkCreate}
                    disabled={csvData.length === 0 || isBulkCreating}
                    className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isBulkCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Creating... ({bulkProgress.current}/{bulkProgress.total})
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Create All Certificates
                      </>
                    )}
                  </motion.button>

                  {csvData.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetForm}
                      className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      Clear & Upload New CSV
                    </motion.button>
                  )}
                </div>

                {/* Progress Bar */}
                {isBulkCreating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Processing...</span>
                      <span>{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Instructions Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">📋 CSV Format Instructions</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">1.</span>
                    <span>CSV must include: Name, Phone, Course, Category, Batch, IssueDate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">2.</span>
                    <span>Phone numbers should include country code (e.g., 919876543210)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">3.</span>
                    <span>Category: code4bharat, marketing-junction, FSD, BVOC, BOOTCAMP, HR</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">3.</span>
                    <span>Batch: B-1, B-2, B-3 </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">4.</span>
                    <span>Date format: YYYY-MM-DD (e.g., 2025-01-15)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 font-bold">5.</span>
                    <span>Download sample CSV template for reference</span>
                  </li>
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={downloadSampleCSV}
                  className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Sample CSV
                </motion.button>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <div className="flex items-start gap-3">
                  <FaWhatsapp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">WhatsApp Notifications</h4>
                    <p className="text-sm text-gray-700">
                      After successful creation, WhatsApp notifications will be sent to all students automatically with their certificate links.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Important Notes</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• OTP verification required before bulk creation</li>
                      <li>• Maximum 100 certificates per batch</li>
                      <li>• Invalid entries will be skipped</li>
                      <li>• Process may take a few minutes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Generated Certificates List
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-6 h-6 text-green-600" />
                Generated Certificates ({generatedCertificates.length})
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    generatedCertificates.forEach(cert => downloadAsJPG(cert));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download All as JPG
                </button>
                <button
                  onClick={() => {
                    generatedCertificates.forEach(cert => downloadAsPDF(cert));
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download All as PDF
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedCertificates.map((cert, index) => (
                <motion.div
                  key={cert.certificateId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-2 border-gray-200 rounded-xl p-5 hover:border-purple-400 hover:shadow-lg transition-all group"
                >
                  {/* Certificate Preview Image */}
                  {cert.previewUrl && (
                    <div className="mb-4 relative overflow-hidden rounded-lg bg-gray-100 aspect-[1.414/1]">
                      <img
                        src={cert.previewUrl}
                        alt={cert.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => handlePreview(cert)}
                          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-all flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Certificate Details */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <p className="font-bold text-gray-900 truncate">{cert.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Hash className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Certificate ID</p>
                        <p className="font-mono text-sm text-gray-900 truncate">{cert.certificateId}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">Course</p>
                        <p className="text-sm text-gray-900 line-clamp-2">{cert.course}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Issue Date</p>
                        <p className="text-sm text-gray-900">
                          {new Date(cert.issueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t">
                      <button
                        onClick={() => downloadAsJPG(cert)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-all flex items-center justify-center gap-1"
                      >
                        <ImageIcon className="w-4 h-4" />
                        JPG
                      </button>
                      <button
                        onClick={() => downloadAsPDF(cert)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all flex items-center justify-center gap-1"
                      >
                        <FileText className="w-4 h-4" />
                        PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* OTP Modal */}
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
                      : 'We will send an OTP to verify this bulk operation'}
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

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreviewModal && previewCertificate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowPreviewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Certificate Preview</h3>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {previewCertificate.previewUrl && (
                  <img
                    src={previewCertificate.previewUrl}
                    alt={previewCertificate.name}
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                )}

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-bold text-gray-900">{previewCertificate.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Certificate ID</p>
                    <p className="font-mono text-gray-900">{previewCertificate.certificateId}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Course</p>
                    <p className="text-gray-900">{previewCertificate.course}</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => downloadAsJPG(previewCertificate)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-5 h-5" />
                    Download as JPG
                  </button>
                  <button
                    onClick={() => downloadAsPDF(previewCertificate)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Download as PDF
                  </button>
                </div>
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
                <p className="text-gray-600 mb-4">
                  All certificates created successfully! WhatsApp notifications sent to all students.
                </p>
                <button
                  onClick={() => setShowSuccess(false)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  View Certificates
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}