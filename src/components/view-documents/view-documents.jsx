"use client";

// 🔥 UPDATED VERSION - v2.0 - API Endpoints Fixed to /api/admin
// Last Updated: 2024

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
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

  // 🔥 IMPORTANT: All API calls use /api/admin prefix
  console.log("🔥 ViewDocuments v2.0 - API Base:", API_URL + "/api/admin");

  // Cleanup blob URLs when component unmounts or preview changes
  useEffect(() => {
    return () => {
      if (previewDocument?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(previewDocument.url);
      }
    };
  }, [previewDocument]);

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

      // 🔥 FIX: Changed to /api/admin
      const apiEndpoint = `${API_URL}/api/documents/students/documents`;
      console.log("📡 Fetching from:", apiEndpoint);

      const response = await axios.get(apiEndpoint, {
        params: {
          page: 1,
          limit: 100,
          verified: verificationFilter,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Response:", response);

      if (response.data.success) {
        const formatted = response.data.students.map((student) => {
          const docs = student.documents || {};
          const docStatus = student.documentStatus || {};

          return {
            ...student,
            id: student._id || student.id, // ✅ Fix: Use _id from MongoDB
            hasDocuments:
              docs.aadhaarFront ||
              docs.aadhaarBack ||
              docs.panCard ||
              docs.bankPassbook,

            documents: {
              aadharFront: docs.aadhaarFront
                ? {
<<<<<<< HEAD
                    filename:
                      typeof docs.aadhaarFront === "string"
                        ? docs.aadhaarFront.split("/").pop()
                        : docs.aadhaarFront.path?.split("/").pop() || "unknown",
                    path:
                      typeof docs.aadhaarFront === "string"
                        ? docs.aadhaarFront
                        : docs.aadhaarFront.path,
                    status:
                      typeof docs.aadhaarFront === "object"
                        ? docs.aadhaarFront.status
                        : student.documentStatus?.aadhaarFront?.status ||
                          "pending",
                    rejectionReason:
                      typeof docs.aadhaarFront === "object"
                        ? docs.aadhaarFront.rejectionReason
                        : student.documentStatus?.aadhaarFront?.rejectionReason,
=======
                    filename: docs.aadhaarFront.split("/").pop(),
                    path: docs.aadhaarFront,
                    status: docStatus.aadhaarFront?.status || "pending",
                    rejectionReason: docStatus.aadhaarFront?.rejectionReason,
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
                  }
                : null,

              aadharBack: docs.aadhaarBack
                ? {
<<<<<<< HEAD
                    filename:
                      typeof docs.aadhaarBack === "string"
                        ? docs.aadhaarBack.split("/").pop()
                        : docs.aadhaarBack.path?.split("/").pop() || "unknown",
                    path:
                      typeof docs.aadhaarBack === "string"
                        ? docs.aadhaarBack
                        : docs.aadhaarBack.path,
                    status:
                      typeof docs.aadhaarBack === "object"
                        ? docs.aadhaarBack.status
                        : student.documentStatus?.aadhaarBack?.status ||
                          "pending",
                    rejectionReason:
                      typeof docs.aadhaarBack === "object"
                        ? docs.aadhaarBack.rejectionReason
                        : student.documentStatus?.aadhaarBack?.rejectionReason,
=======
                    filename: docs.aadhaarBack.split("/").pop(),
                    path: docs.aadhaarBack,
                    status: docStatus.aadhaarBack?.status || "pending",
                    rejectionReason: docStatus.aadhaarBack?.rejectionReason,
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
                  }
                : null,

              panCard: docs.panCard
                ? {
<<<<<<< HEAD
                    filename:
                      typeof docs.panCard === "string"
                        ? docs.panCard.split("/").pop()
                        : docs.panCard.path?.split("/").pop() || "unknown",
                    path:
                      typeof docs.panCard === "string"
                        ? docs.panCard
                        : docs.panCard.path,
                    status:
                      typeof docs.panCard === "object"
                        ? docs.panCard.status
                        : student.documentStatus?.panCard?.status || "pending",
                    rejectionReason:
                      typeof docs.panCard === "object"
                        ? docs.panCard.rejectionReason
                        : student.documentStatus?.panCard?.rejectionReason,
=======
                    filename: docs.panCard.split("/").pop(),
                    path: docs.panCard,
                    status: docStatus.panCard?.status || "pending",
                    rejectionReason: docStatus.panCard?.rejectionReason,
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
                  }
                : null,

              bankPassbook: docs.bankPassbook
                ? {
<<<<<<< HEAD
                    filename:
                      typeof docs.bankPassbook === "string"
                        ? docs.bankPassbook.split("/").pop()
                        : docs.bankPassbook.path?.split("/").pop() || "unknown",
                    path:
                      typeof docs.bankPassbook === "string"
                        ? docs.bankPassbook
                        : docs.bankPassbook.path,
                    status:
                      typeof docs.bankPassbook === "object"
                        ? docs.bankPassbook.status
                        : student.documentStatus?.bankPassbook?.status ||
                          "pending",
                    rejectionReason:
                      typeof docs.bankPassbook === "object"
                        ? docs.bankPassbook.rejectionReason
                        : student.documentStatus?.bankPassbook?.rejectionReason,
=======
                    filename: docs.bankPassbook.split("/").pop(),
                    path: docs.bankPassbook,
                    status: docStatus.bankPassbook?.status || "pending",
                    rejectionReason: docStatus.bankPassbook?.rejectionReason,
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
                  }
                : null,
            },
          };
        });

        console.log("✅ Formatted Students:", formatted);
        setStudents(formatted);
      }
    } catch (error) {
      console.error("❌ Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  // Get unique users for filter
  const uniqueUsers = Array.from(
    new Set(students.map((student) => student.name))
  );

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

  // Replace your existing handleDownload function with this:
  const handleDownload = async (studentId, docType, filename) => {
    try {
      const token = sessionStorage.getItem("authToken");
<<<<<<< HEAD

      // Get the document URL from API
      const response = await axios.get(
        `${API_URL}/api/documents/students/${studentId}/documents/${docType}/view`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success && response.data.url) {
        const documentUrl = response.data.url;

        // If it's a Cloudinary URL (starts with http), download directly
        if (documentUrl.startsWith("http")) {
          // Download from Cloudinary
          const fileResponse = await fetch(documentUrl);
          const blob = await fileResponse.blob();
          const downloadUrl = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        } else {
          // Local file - construct server URL
          const serverUrl = `${API_URL}/${documentUrl}`;
          const fileResponse = await fetch(serverUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const blob = await fileResponse.blob();
          const downloadUrl = window.URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        }

        toast.success("Document downloaded!");
      }
=======
      
      // 🔥 FIX: Changed to /api/admin
      const url = `${API_URL}/api/documents/students/documents/${docType}/view`;
      console.log("📥 Downloading from:", url);

      toast.loading("Downloading document...");

      // Fetch the document as a blob
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      toast.dismiss();

      // Create blob URL and trigger download
      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success("Document downloaded!");
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
    } catch (error) {
      console.error("❌ Error downloading document:", error);
      toast.dismiss();
      toast.error("Failed to download document");
    }
  };

  // Replace your existing handlePreview function with this:
  // Replace the handlePreview function in view-documents.jsx

  const handlePreview = async (studentId, docType, filename) => {
    try {
      const token = sessionStorage.getItem("authToken");
<<<<<<< HEAD

      // Get the document URL from API
      const response = await axios.get(
        `${API_URL}/api/documents/students/${studentId}/documents/${docType}/view`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔍 API Response:", response.data); // Debug log

      if (response.data.success && response.data.url) {
        const documentUrl = response.data.url;

        console.log("📄 Document URL:", documentUrl); // Debug log

        // Check if it's a Cloudinary URL
        const isCloudinary =
          documentUrl.includes("cloudinary.com") ||
          documentUrl.startsWith("https://res.cloudinary.com");

        console.log("☁️ Is Cloudinary?", isCloudinary); // Debug log

        if (isCloudinary) {
          // Open Cloudinary documents in new tab
          console.log("✅ Opening in new tab:", documentUrl);
          const newWindow = window.open(
            documentUrl,
            "_blank",
            "noopener,noreferrer"
          );

          if (newWindow) {
            toast.success("Opening document in new tab");
          } else {
            toast.error("Popup blocked! Please allow popups for this site.");
          }
        } else {
          // Local files - use modal preview
          const previewUrl = documentUrl.startsWith("http")
            ? documentUrl
            : `${API_URL}/${documentUrl}`;

          console.log("📂 Opening in modal:", previewUrl);

          setPreviewDocument({
            studentId,
            docType,
            filename,
            url: previewUrl,
            isCloudinary: false,
          });
        }
      } else {
        toast.error("Document URL not found in response");
      }
    } catch (error) {
      console.error("❌ Error previewing document:", error);
      console.error("Error details:", error.response?.data);
=======
      
      // 🔥 FIX: Changed to /api/admin
      const url = `${API_URL}/api/documents/students/documents/${docType}/view`;
      console.log("👁️ Previewing from:", url);

      const loadingToast = toast.loading("Loading document...");

      // Fetch the document as a blob
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob", // Important: Get response as blob
      });

      toast.dismiss(loadingToast);

      // Create object URL from blob
      const blobUrl = URL.createObjectURL(response.data);
      const contentType = response.headers["content-type"] || "application/pdf";

      setPreviewDocument({
        studentId,
        docType,
        filename,
        url: blobUrl,
        type: contentType,
        isImage: contentType.startsWith("image/"),
      });

      toast.success("Document loaded!");
    } catch (error) {
      console.error("❌ Error previewing document:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.dismiss();
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
      toast.error("Failed to preview document");
    }
  };

  const handleVerifyDocuments = async (studentId, verified) => {
    try {
      setVerifyingStudent(studentId);
      const token = sessionStorage.getItem("authToken");

      const response = await axios.put(
        `${API_URL}/api/documents/students/${studentId}/documents/verify`,
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

<<<<<<< HEAD
  // Add these functions after handleVerifyDocuments function in view-document.jsx

=======
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
  const handleApproveDocument = async (studentId, docType) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.put(
        `${API_URL}/api/documents/students/${studentId}/documents/${docType}/status`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
<<<<<<< HEAD
        toast.success("Document approved successfully!");
        fetchStudentsWithDocuments(); // Refresh the list
=======
        toast.success("Document approved!");
        fetchStudentsWithDocuments();
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
      }
    } catch (error) {
      console.error("❌ Error approving document:", error);
      toast.error("Failed to approve document");
    }
  };

  const openRejectModal = (studentId, docType) => {
    setRejectModal({ studentId, docType });
    setRejectReason("");
  };

  const handleRejectDocument = async () => {
    if (!rejectReason.trim()) {
<<<<<<< HEAD
      toast.error("Please enter a rejection reason");
=======
      toast.error("Please provide a rejection reason");
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");
      const { studentId, docType } = rejectModal;

      const response = await axios.put(
        `${API_URL}/api/documents/students/${studentId}/documents/${docType}/status`,
        {
          status: "rejected",
          rejectionReason: rejectReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
<<<<<<< HEAD
        toast.success("Document rejected");
        setRejectModal(null);
        setRejectReason("");
        fetchStudentsWithDocuments(); // Refresh
=======
        toast.success("Document rejected!");
        fetchStudentsWithDocuments();
        setRejectModal(null);
        setRejectReason("");
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
      }
    } catch (error) {
      console.error("❌ Error rejecting document:", error);
      toast.error("Failed to reject document");
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

      {/* Version indicator - remove in production */}
      <div className="fixed top-2 right-2 z-50 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
        v2.0 - API Fixed ✅
      </div>

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
          {(selectedUser !== "all" ||
            verificationFilter !== "all" ||
            searchTerm) && (
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
                key={student._id}
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
                        Category: {student.category}{" "}
                        {student.batch && `• Batch: ${student.batch}`}
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
                          key={`${student._id}-${docType}`}
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

                              {/* Status Badge */}
                              {docData.status && (
                                <span
                                  className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                    docData.status === "approved"
                                      ? "bg-green-200 text-green-700"
                                      : docData.status === "rejected"
                                      ? "bg-red-200 text-red-700"
                                      : "bg-yellow-200 text-yellow-700"
                                  }`}
                                >
                                  {docData.status === "approved" && (
                                    <CheckCircle className="w-3 h-3" />
                                  )}
                                  {docData.status === "rejected" && (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                  {docData.status === "pending" && (
                                    <Clock className="w-3 h-3" />
                                  )}
                                  {docData.status.charAt(0).toUpperCase() +
                                    docData.status.slice(1)}
                                </span>
                              )}

                              {/* Rejection Reason */}
                              {docData.status === "rejected" &&
                                docData.rejectionReason && (
                                  <p className="text-red-400 text-xs mt-1">
                                    Reason: {docData.rejectionReason}
                                  </p>
                                )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                handlePreview(
                                  student._id,
                                  docType,
                                  docData.filename
                                )
                              }
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>

                            <button
                              onClick={() =>
                                handleDownload(
                                  student._id,
                                  docType,
                                  docData.filename
                                )
                              }
                              className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs"
                            >
                              <Download className="w-3 h-3" />
                              Download
                            </button>
                          </div>

                          {/* Approval / Rejection Buttons */}
                          <div className="flex gap-2 mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
                            <button
                              onClick={
                                () =>
                                  handleApproveDocument(student._id, docType) // ✅ CHANGE student.id to student._id
                              }
                              disabled={docData.status === "approved"}
                              className={`flex-1 px-2 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
                                docData.status === "approved"
                                  ? "bg-green-400 text-white cursor-not-allowed"
                                  : "bg-green-600 hover:bg-green-700 text-white"
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {docData.status === "approved"
                                ? "Approved"
                                : "Approve"}
                            </button>

                            <button
                              onClick={
                                () => openRejectModal(student._id, docType) // ✅ CHANGE student.id to student._id
                              }
                              disabled={docData.status === "rejected"}
                              className={`flex-1 px-2 py-2 text-xs rounded-lg flex items-center justify-center gap-1 ${
                                docData.status === "rejected"
                                  ? "bg-red-400 text-white cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                            >
                              <XCircle className="w-3 h-3" />
                              {docData.status === "rejected"
                                ? "Rejected"
                                : "Reject"}
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
                    onClick={() => handleVerifyDocuments(student._id, true)}
                    disabled={
                      verifyingStudent === student._id ||
                      student.documentsVerified
                    }
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-semibold"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {student.documentsVerified
                      ? "Already Verified"
                      : "Verify Documents"}
                  </button>
                  {student.documentsVerified && (
                    <button
                      onClick={() => handleVerifyDocuments(student._id, false)}
                      disabled={verifyingStudent === student._id}
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

        {/* Reject Modal */}
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
                Reject Document
              </h3>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
                className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
              />

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setRejectModal(null)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectDocument}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition-colors"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Preview Modal - FIXED VERSION */}
        {previewDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              // Cleanup blob URL when closing
              if (previewDocument.url.startsWith("blob:")) {
                URL.revokeObjectURL(previewDocument.url);
              }
              setPreviewDocument(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {getDocumentLabel(previewDocument.docType)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {previewDocument.filename}
                  </p>
                  {previewDocument.isCloudinary && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ☁️ Cloudinary
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (previewDocument.url.startsWith("blob:")) {
                      URL.revokeObjectURL(previewDocument.url);
                    }
                    setPreviewDocument(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
<<<<<<< HEAD

              {/* Direct URL in iframe */}
              <iframe
                src={previewDocument.url}
                className="w-full h-[600px] rounded-lg"
                title="Document Preview"
                style={{ border: "none" }}
                onError={(e) => {
                  console.error("Iframe error:", e);
                  toast.error("Failed to load document preview");
                }}
              />
=======
              <div className="p-6 flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
                {previewDocument.isImage ? (
                  <img
                    src={previewDocument.url}
                    alt={previewDocument.filename}
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <iframe
                    src={previewDocument.url}
                    className="w-full h-[600px] rounded-lg border-2 border-gray-200 dark:border-gray-700"
                    title="Document Preview"
                  />
                )}
              </div>
>>>>>>> 05531356fd9cc1fdf442eade50f04469d9663690
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}