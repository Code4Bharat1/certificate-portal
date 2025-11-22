"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Upload,
  Download,
  Eye,
  LogOut,
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  TrendingUp,
  FileCheck,
  FileClock,
  FileX,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [userData, setUserData] = useState(null);
  const [statistics, setStatistics] = useState({
    totalLetters: 0,
    signedUploaded: 0,
    pendingSignature: 0,
    approved: 0,
    rejected: 0,
    inReview: 0,
  });
  const [allLetters, setAllLetters] = useState([]);
  const [recentLetters, setRecentLetters] = useState([]);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewLetter, setPreviewLetter] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

  useEffect(() => {
    checkAuth();
    fetchAllData();
  }, []);

  const checkAuth = () => {
    if (typeof window !== "undefined") {
      const isAuth = sessionStorage.getItem("isAuthenticated");
      const userType = sessionStorage.getItem("userType");

      if (!isAuth || userType !== "user") {
        toast.error("Please login to access this page");
        router.push("/login");
        return;
      }
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserData(),
        fetchStatistics(),
        fetchRecentLetters(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get(`${API_URL}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUserData(response.data.user);
        console.log("✅ User data loaded:", response.data.user);
      } else {
        throw new Error(response.data.message || "Failed to load user data");
      }
    } catch (error) {
      console.error("❌ Error fetching user data:", error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      } else {
        toast.error("Failed to load user profile");
      }
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/student/statistics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setStatistics(response.data.statistics);
        console.log("✅ Statistics loaded:", response.data.statistics);
      }
    } catch (error) {
      console.error("❌ Error fetching statistics:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to load statistics");
      }
    }
  };

  const fetchRecentLetters = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/api/student/letters/recent`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setRecentLetters(response.data.letters);
        console.log(
          "✅ Recent letters loaded:",
          response.data.letters.length,
          "letters"
        );
      }
    } catch (error) {
      console.error("❌ Error fetching recent letters:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to load recent letters");
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    toast.loading("Refreshing data...", { id: "refresh" });

    try {
      await fetchAllData();
      toast.success("Data refreshed successfully!", { id: "refresh" });
    } catch (error) {
      toast.error("Failed to refresh data", { id: "refresh" });
    } finally {
      setRefreshing(false);
    }
  };

  const verifyAndLoadPDF = async (letter) => {
    console.log("🔍 Loading preview for letter:", letter);
    setPreviewLetter(letter);
    setShowPreviewModal(true);
    setPreviewLoading(true);

    try {
      const verifyRes = await axios.post(`${API_URL}/api/certificates/verify`, {
        certificateId: letter.credentialId || letter.id,
      });
      console.log("✅ Verification response:", verifyRes.data);

      if (!verifyRes.data?.valid) {
        toast.error("Invalid or unauthorized certificate ID");
        setShowPreviewModal(false);
        return;
      }

      const token = sessionStorage.getItem("authToken");
      const pdfResponse = await axios.get(
        `${API_URL}/api/letters/${letter.id}/download.pdf`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      console.log("✅ PDF loaded successfully");
    } catch (error) {
      console.error("❌ PDF load error:", error);
      toast.error("Failed to load PDF preview");
      setShowPreviewModal(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownloadLetter = async (letter) => {
    console.log("⬇️ Downloading letter:", letter);
    const downloadToast = toast.loading("Preparing download...");

    try {
      if (letter.downloadLink) {
        window.open(letter.downloadLink, "_blank");
        toast.success("Download started!", { id: downloadToast });
      } else {
        console.log("📥 Using API fallback download for ID:", letter.id);

        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(
          `${API_URL}/api/letters/${letter.id}/download.pdf`,
          {
            headers: { Authorization: `Bearer ${token}` },
            responseType: "blob",
          }
        );

        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${letter.credentialId || letter.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);

        toast.success("Download started!", { id: downloadToast });
      }
    } catch (error) {
      console.error("❌ Error downloading certificate:", error);
      toast.error("Failed to download certificate", { id: downloadToast });
    }
  };

  const handleUploadSigned = async (letterId) => {
    if (!uploadFile) {
      toast.error("Please select a file to upload");
      return;
    }

    if (uploadFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!allowedTypes.includes(uploadFile.type)) {
      toast.error("Only PDF, JPG, JPEG, and PNG files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("signedFile", uploadFile); // ✅ FIXED
    // formData.append("letterId", letterId);
    // formData.append("letterId", selectedLetter.letterId); 
    formData.append("letterId", selectedLetter.credentialId);


    setUploading(true);
    const uploadToast = toast.loading("Uploading signed letter...");

    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.post(
        `${API_URL}/api/student/upload-signed?letterId=${selectedLetter.credentialId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            toast.loading(`Uploading... ${percentCompleted}%`, {
              id: uploadToast,
            });
          },
        }
      );

      if (response.data.success) {
        toast.success("Signed letter uploaded successfully!", {
          id: uploadToast,
        });
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedLetter(null);

        await fetchStatistics();
        await fetchRecentLetters();
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading signed letter:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to upload signed letter";
      toast.error(errorMessage, { id: uploadToast });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadAll = async () => {
    const downloadToast = toast.loading("Preparing download...");

    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(`${API_URL}/api/student/download-all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success && response.data.certificates?.length > 0) {
        toast.success(
          `Found ${response.data.certificates.length} certificates`,
          { id: downloadToast }
        );

        response.data.certificates.forEach((cert, index) => {
          setTimeout(() => {
            window.open(cert.downloadLink, "_blank");
          }, index * 300);
        });
      } else {
        toast.error("No certificates found to download", { id: downloadToast });
      }
    } catch (error) {
      console.error("Error downloading certificates:", error);
      toast.error("Failed to download certificates", { id: downloadToast });
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-14 h-14 ${color} rounded-xl flex items-center justify-center shadow-md`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}%</span>
          </div>
        )}
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
        {title}
      </h3>
      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </motion.div>
  );

  const LetterCard = ({ letter }) => {
    const getStatusColor = (status) => {
      switch (status) {
        case "approved":
          return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
        case "pending":
          return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "rejected":
          return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
        case "in_review":
          return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
        default:
          return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "approved":
          return CheckCircle;
        case "pending":
          return Clock;
        case "rejected":
          return FileX;
        case "in_review":
          return FileClock;
        default:
          return AlertCircle;
      }
    };

    const StatusIcon = getStatusIcon(letter.status);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-5 shadow-md hover:shadow-lg transition-all border-2 border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                {letter.letterType}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {letter.subType || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>
              Issued: {new Date(letter.issueDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Award className="w-4 h-4" />
            <span className="truncate">ID: {letter.credentialId}</span>
          </div>
          {letter.signedUploaded && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span>Signed Copy Uploaded</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* View Button */}
          <button
            onClick={() => verifyAndLoadPDF(letter)}
            className="flex-1 min-w-[100px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-2 rounded-lg text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          {/* Download Button */}
          <button
            onClick={() => handleDownloadLetter(letter)}
            className="flex-1 min-w-[100px] bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 py-2 rounded-lg text-sm font-semibold hover:bg-green-100 dark:hover:bg-green-900/50 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>

          {/* Upload Signed Button – ALWAYS SHOW */}
          <button
            onClick={() => {
              setSelectedLetter(letter);
              setShowUploadModal(true);
            }}
            className="flex-1 min-w-[130px] bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 py-2 rounded-lg text-sm font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Signed
          </button>
        </div>
      </motion.div>
    );
  };

  const filteredLetters = recentLetters.filter((letter) => {
    const matchesSearch =
      letter.letterType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      letter.credentialId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || letter.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-blue-300 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-semibold">
            Loading Dashboard...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Fetching your data from server
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b-2 border-blue-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                  Welcome back, {userData?.name || "User"}!
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Manage your certificates and letters
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-semibold text-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-8 text-white shadow-xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  {userData?.name || "User Name"}
                </h2>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">
                      {userData?.email || "user@example.com"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{userData?.phone || "91 XXXXXXXXXX"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm opacity-80">Member Since</p>
              <p className="text-lg sm:text-xl font-semibold">
                {userData?.joinedDate
                  ? new Date(userData.joinedDate).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
          <StatCard
            icon={FileText}
            title="Total Letters"
            value={statistics.totalLetters}
            color="bg-gradient-to-r from-blue-600 to-blue-700"
            bgColor="bg-blue-50 dark:bg-blue-950"
          />
          <StatCard
            icon={FileCheck}
            title="Signed & Uploaded"
            value={statistics.signedUploaded}
            color="bg-gradient-to-r from-green-600 to-green-700"
            bgColor="bg-green-50 dark:bg-green-950"
          />
          <StatCard
            icon={Clock}
            title="Pending Signature"
            value={statistics.pendingSignature}
            color="bg-gradient-to-r from-indigo-600 to-indigo-700"
            bgColor="bg-indigo-50 dark:bg-indigo-950"
          />
          <StatCard
            icon={CheckCircle}
            title="Approved"
            value={statistics.approved}
            color="bg-gradient-to-r from-emerald-600 to-emerald-700"
            bgColor="bg-emerald-50 dark:bg-emerald-950"
          />
          <StatCard
            icon={FileClock}
            title="In Review"
            value={statistics.inReview}
            color="bg-gradient-to-r from-cyan-600 to-cyan-700"
            bgColor="bg-cyan-50 dark:bg-cyan-950"
          />
          <StatCard
            icon={FileX}
            title="Rejected"
            value={statistics.rejected}
            color="bg-gradient-to-r from-red-600 to-red-700"
            bgColor="bg-red-50 dark:bg-red-950"
          />
        </div>

        {/* Quick Actions */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-8 border-2 border-blue-200 dark:border-gray-700"
        >
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700"
            >
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                  Download All
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Get all your certificates
                </p>
              </div>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900 transition border-2 border-transparent hover:border-indigo-300 dark:hover:border-indigo-700"
            >
              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                  Upload Signed
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Submit signed documents
                </p>
              </div>
            </button>
            <button
              onClick={() => router.push("/user/history")}
              className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-xl hover:bg-green-100 dark:hover:bg-green-900 transition border-2 border-transparent hover:border-green-300 dark:hover:border-green-700"
            >
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="text-left">
                <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                  View History
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Check all documents
                </p>
              </div>
            </button>
          </div>
        </motion.div> */}

        {/* Recent Letters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg border-2 border-blue-200 dark:border-gray-700"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              Recent Letters
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search letters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {filteredLetters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {recentLetters.length === 0
                  ? "No letters issued yet"
                  : "No letters match your search"}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                {recentLetters.length === 0
                  ? "Your letters will appear here once issued"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLetters.map((letter, index) => (
                <LetterCard key={letter.id || index} letter={letter} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Progress Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mt-8 border-2 border-blue-200 dark:border-gray-700"
        >
          <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            Completion Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Signed Documents
                </span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {statistics.totalLetters > 0
                    ? Math.round(
                        (statistics.signedUploaded / statistics.totalLetters) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      statistics.totalLetters > 0
                        ? (statistics.signedUploaded /
                            statistics.totalLetters) *
                          100
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Approved Letters
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  {statistics.totalLetters > 0
                    ? Math.round(
                        (statistics.approved / statistics.totalLetters) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      statistics.totalLetters > 0
                        ? (statistics.approved / statistics.totalLetters) * 100
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !uploading && setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-blue-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              Upload Signed Letter
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              Please upload the signed copy of your{" "}
              {selectedLetter?.letterType || "letter"}
            </p>

            <div className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl p-6 text-center mb-6 hover:border-blue-500 dark:hover:border-blue-600 transition bg-blue-50 dark:bg-blue-950">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer ${
                  uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="w-12 h-12 text-blue-400 dark:text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {uploadFile
                    ? uploadFile.name
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  PDF, JPG, PNG up to 10MB
                </p>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadFile(null);
                  setSelectedLetter(null);
                }}
                disabled={uploading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadSigned(selectedLetter.letterId)}
                // onClick={() => handleUploadSigned(selectedLetter?.id)}
                disabled={!uploadFile || uploading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Preview Modal with Iframe */}
      {showPreviewModal && previewLetter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowPreviewModal(false);
            setPreviewLetter(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] shadow-2xl border-2 border-blue-200 dark:border-gray-700 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    {previewLetter.letterType}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    ID: {previewLetter.credentialId}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadLetter(previewLetter)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button
                  onClick={() => {
                    setShowPreviewModal(false);
                    setPreviewLetter(null);
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Issue Date</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {new Date(previewLetter.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sub Type</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {previewLetter.subType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Signed</p>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">
                    {previewLetter.signedUploaded ? "✅ Yes" : "❌ No"}
                  </p>
                </div>
              </div>
            </div>

            {/* Iframe Preview */}
            <div className="relative w-full h-[80vh]">
              <iframe
                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                className="w-full h-full border rounded-xl shadow-inner"
                title="Certificate PDF"
              />

              {/* Label */}
              <div className="absolute top-3 right-3 bg-white/80 dark:bg-gray-900/70 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 shadow-md">
                Preview Mode
              </div>

              {/* Upload Signed Copy Button */}
              {/* {!previewLetter.signedUploaded && (
    <button
      onClick={() => {
        setSelectedLetter(previewLetter);
        setShowUploadModal(true);
      }}
      className="absolute bottom-5 right-5 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl shadow-lg flex items-center gap-2"
    >
      <Upload className="w-4 h-4" />
      Upload Signed Copy
    </button>
  )} */}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                💡 Tip: Use the buttons above to download or open in new tab
              </div>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewLetter(null);
                }}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
