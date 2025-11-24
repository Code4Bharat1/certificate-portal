"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Search,
  Download,
  Eye,
  FileText,
  Image,
  File,
  User,
  Calendar,
  Filter,
  X,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  CreditCard,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function ViewDocuments() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [previewDocument, setPreviewDocument] = useState(null);
  const [verifyingStudent, setVerifyingStudent] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

  // Fetch students with documents from API
  useEffect(() => {
    fetchStudentsWithDocuments();
  }, [verificationFilter]);

  const fetchStudentsWithDocuments = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("Please login first");
        router.push("/login");
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/admin/students/documents`,
        {
          params: {
            page: 1,
            limit: 100,
            verified: verificationFilter,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error("❌ Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Get unique users for filter
  const uniqueUsers = Array.from(new Set(students.map((student) => student.name)));

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === "all" || student.name === selectedUser;
    return matchesSearch && matchesUser && student.hasDocuments;
  });

  const getDocumentIcon = (docType) => {
    switch (docType) {
      case "aadharFront":
      case "aadharBack":
        return <Shield className="w-5 h-5" />;
      case "panCard":
        return <CreditCard className="w-5 h-5" />;
      case "bankPassbook":
        return <Building2 className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const getDocumentLabel = (docType) => {
    const labels = {
      aadharFront: "Aadhar Card (Front)",
      aadharBack: "Aadhar Card (Back)",
      panCard: "PAN Card",
      bankPassbook: "Bank Passbook",
    };
    return labels[docType] || docType;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async (studentId, docType, filename) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const url = `${API_URL}/api/admin/students/${studentId}/documents/${docType}/view`;

      // Open in new tab
      window.open(url + `?token=${token}`, "_blank");
      toast.success("Opening document...");
    } catch (error) {
      console.error("❌ Error downloading document:", error);
      toast.error("Failed to download document");
    }
  };

  const handlePreview = async (studentId, docType, filename) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const url = `${API_URL}/api/admin/students/${studentId}/documents/${docType}/view`;

      setPreviewDocument({
        studentId,
        docType,
        filename,
        url: url + `?token=${token}`,
      });
    } catch (error) {
      console.error("❌ Error previewing document:", error);
      toast.error("Failed to preview document");
    }
  };

  const handleVerifyDocuments = async (studentId, verified) => {
    try {
      setVerifyingStudent(studentId);
      const token = sessionStorage.getItem("authToken");

      const response = await axios.put(
        `${API_URL}/api/admin/students/${studentId}/documents/verify`,
        { verified },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          verified ? "Documents verified!" : "Documents marked as unverified"
        );
        fetchStudentsWithDocuments(); // Refresh list
      }
    } catch (error) {
      console.error("❌ Error verifying documents:", error);
      toast.error("Failed to verify documents");
    } finally {
      setVerifyingStudent(null);
    }
  };

  const getVerificationBadge = (student) => {
    if (student.documentsVerified) {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm">
          <CheckCircle className="w-4 h-4" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full text-sm">
          <Clock className="w-4 h-4" />
          Pending Verification
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/dashboard")}
          className="fixed top-6 left-6 z-50 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full p-3 shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-3">
              <FolderOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
                Student Documents
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and verify uploaded documents
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border-2 border-blue-100 dark:border-gray-700"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, phone, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* User Filter */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
              >
                <option value="all">All Students</option>
                {uniqueUsers.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 appearance-none"
              >
                <option value="all">All Documents</option>
                <option value="uploaded">Uploaded</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending Verification</option>
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedUser !== "all" || verificationFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Active Filters:
              </span>
              {searchTerm && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1">
                  Search: {searchTerm}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSearchTerm("")}
                  />
                </span>
              )}
              {selectedUser !== "all" && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1">
                  Student: {selectedUser}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setSelectedUser("all")}
                  />
                </span>
              )}
              {verificationFilter !== "all" && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm flex items-center gap-1">
                  Status: {verificationFilter}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => setVerificationFilter("all")}
                  />
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Documents by Student */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading documents...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No documents found
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-blue-100 dark:border-gray-700"
              >
                {/* Student Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
                      <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {student.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {student.phone} • {student.email || "No email"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Category: {student.category} {student.batch && `• Batch: ${student.batch}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getVerificationBadge(student)}
                    {student.documentsUploadedAt && (
                      <div className="text-right text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(student.documentsUploadedAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {Object.entries(student.documents || {}).map(
                    ([docType, docData]) => {
                      if (!docData || !docData.filename) return null;

                      return (
                        <motion.div
                          key={docType}
                          whileHover={{ scale: 1.02 }}
                          className="group relative bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 border-2 border-blue-100 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 transition-all"
                        >
                          {/* Document Icon */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-2 text-blue-600 dark:text-blue-400">
                              {getDocumentIcon(docType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                {getDocumentLabel(docType)}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {docData.filename}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                handlePreview(student.id, docType, docData.filename)
                              }
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownload(student.id, docType, docData.filename)
                              }
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>
                        </motion.div>
                      );
                    }
                  )}
                </div>

                {/* Verification Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleVerifyDocuments(student.id, true)}
                    disabled={verifyingStudent === student.id || student.documentsVerified}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {student.documentsVerified ? "Already Verified" : "Verify Documents"}
                  </button>
                  {student.documentsVerified && (
                    <button
                      onClick={() => handleVerifyDocuments(student.id, false)}
                      disabled={verifyingStudent === student.id}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      Mark Unverified
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {getDocumentLabel(previewDocument.docType)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {previewDocument.filename}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewDocument(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                <iframe
                  src={previewDocument.url}
                  className="w-full h-[600px] rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  title="Document Preview"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}