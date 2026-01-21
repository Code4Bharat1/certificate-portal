"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  Award,
  Tag,
  User,
  BookOpen,
  Calendar,
  Shield,
  CheckCircle,
  X,
  FileText,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const IS_DEV_MODE =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_DEV_MODE === "true";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

export default function CreateLetter() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);


  // Form States
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    issueDate: "",
    letterType: "",
    projectName: "",
    subject: "",
    description: "",
  });

  // console.log(formData);
  // Data Lists
  const [namesList, setNamesList] = useState([]);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  // Success & preview
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [pdfPreview, setPdfPreview] = useState(null);

  const [createdLetterId, setCreatedLetterId] = useState(null);

  const categoryConfig = {
    client: { label: "client", batches: [] },
  };

  // Letter types configuration
  const getLetterTypesConfig = (category) => {
    if (category === "client") {
      return {
        Agenda: [],
        "MOM (Minutes of Meeting)": [],
        "Project Communication": [],
        "Project Progress": [],
      };
    }
    return {};
  };

  // Get main letter types (alphabetically sorted)
  const getLetterTypes = (category) => {
    const config = getLetterTypesConfig(category);
    return Object.keys(config).sort();
  };

  // OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Fetch names when category changes
  useEffect(() => {
    if (!formData.category) {
      setNamesList([]);
      setFormData((prev) => ({ ...prev, name: "" }));
      return;
    }

    fetchNames();
  }, [formData.category]);

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("authToken")
        : null;
    return { Authorization: `Bearer ${token}` };
  };

const fetchNames = async () => {
  setLoadingNames(true);

  try {
    // console.log("🔍 Fetching names for category:", formData.category);

    const response = await axios.get(`${API_URL}/api/people`, {
      headers: getAuthHeaders(),
      params: {
        category: formData.category,
        disabled: false, // ✅ Only fetch enabled people
      },
    });

    // console.log("📦 API Response:", response.data);

    let names = [];

    // CASE 1 → { success: true, names: [...] }
    if (response.data?.names) {
      names = response.data.names;
    }
    // CASE 2 → { success: true, data: [...] }
    else if (response.data?.data) {
      names = response.data.data;
    }
    // CASE 3 → backend returns raw array
    else if (Array.isArray(response.data)) {
      names = response.data;
    }

    // console.log("📋 Processed names:", names);

    // FINAL CLEANUP - filter disabled people (double-check)
    const enabled = names
      .filter((p) => !p.disabled)
      .sort((a, b) => a.name.localeCompare(b.name));

    // console.log("✅ Final enabled names:", enabled);

    setNamesList(enabled);

    if (enabled.length === 0) {
      toast.error(`No active clients found in ${formData.category} category`);
    } else {
      toast.success(`Found ${enabled.length} client(s)`);
    }
  } catch (error) {
    console.error("❌ Fetch Names Error:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    toast.error("Failed to load client names");
  } finally {
    setLoadingNames(false);
  }
};

  const handleInputChange = (field, value) => {
    if (field === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        name: "",
        letterType: "",
        projectName: "",
        subject: "",
        description: "",
      }));
      setPreviewImage(null);
      setOtpVerified(false);
    } else if (field === "letterType") {
      setFormData((prev) => ({
        ...prev,
        letterType: value,
        projectName: "",
        subject: "",
        description: "",
      }));
      setPreviewImage(null);
      setOtpVerified(false);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === "issueDate") {
        setPreviewImage(null);
        setOtpVerified(false);
      }
    }
  };

  const validateForm = () => {
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.name) {
      toast.error("Please select a client name");
      return false;
    }
    if (!formData.letterType) {
      toast.error("Please select letter type");
      return false;
    }
    if (!formData.projectName.trim()) {
      toast.error("Please enter project name");
      return false;
    }
    if (formData.projectName.length > 120) {
      toast.error("Project name cannot exceed 120 characters");
      return false;
    }
    if (!formData.subject.trim()) {
      toast.error("Please enter subject");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Please enter description");
      return false;
    }
    if (!formData.issueDate) {
      toast.error("Please select issue date");
      return false;
    }
    return true;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowOtpModal(true);
    }
  };

  const sendOTP = async () => {
    try {
      // In dev mode, skip actual OTP sending
      if (IS_DEV_MODE) {
        toast.success("🚀 DEV MODE: OTP bypassed! Enter any 6 digits", {
          duration: 4000,
          icon: "🔓",
        });
        setOtpSent(true);
        setResendTimer(60);
        return;
      }

      // Production mode - actual OTP sending
      const response = await axios.post(
        `${API_URL}/api/certificates/otp/send`,
        { phone: "919892398976", name: "hr-NEXCORE ALLIANCE" },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success("OTP sent to your WhatsApp! 📱");
        setOtpSent(true);
        setResendTimer(60);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("sendOTP error:", error);
      toast.error("Failed to send OTP");
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
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

 const verifyOTP = async () => {
   try {
     const otpCode = otp.join("");
     if (otpCode.length !== 6) {
       toast.error("Please enter complete OTP");
       return;
     }

     // Dev mode bypass - accept any 6-digit OTP
     if (IS_DEV_MODE) {
       toast.success("🚀 DEV MODE: OTP Verified (Bypass)!", {
         duration: 3000,
         icon: "✅",
       });
       setOtpVerified(true);
       setShowOtpModal(false);
       setShowPreview(true);
       generatePreview();
       return;
     }

     // Production mode - actual OTP verification
     const response = await axios.post(
       `${API_URL}/api/certificates/otp/verify`,
       {
         phone: "919892398976",
         otp: otpCode,
       },
       { headers: getAuthHeaders() }
     );

     if (response.data.success) {
       toast.success("OTP Verified Successfully!");
       setOtpVerified(true);
       setShowOtpModal(false);
       setShowPreview(true);
       generatePreview();
     } else {
       toast.error("Invalid OTP");
       setOtp(["", "", "", "", "", ""]);
     }
   } catch (error) {
     console.error("Verify OTP error:", error);
     toast.error("OTP verification failed");
     setOtp(["", "", "", "", "", ""]);
   }
 };

const generatePreview = async () => {
  setLoadingPreview(true);
  try {
    // ✅ FIXED: Use correct endpoint
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

    // console.log("🔍 Generating preview for client letter");
    // console.log("📤 Preview data:", formData);

    const payload = {
      name: formData.name,
      issueDate: formData.issueDate,
      letterType: formData.letterType,
      projectName: formData.projectName,
      subject: formData.subject,
      description: formData.description,
    };

    // ✅ FIXED: Changed from /api/client/preview to /api/clientletters/preview
    const response = await axios.post(
      `${apiUrl}/api/clientletters/preview`,
      payload,
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );

    // console.log("✅ Preview response received");

    const fileType = response.data.type || response.headers["content-type"];
    const fileUrl = URL.createObjectURL(response.data);

    if (fileType.includes("pdf")) {
      setPreviewImage(null);
      setPdfPreview(fileUrl);
      // console.log("📄 PDF preview set");
    } else {
      setPdfPreview(null);
      setPreviewImage(fileUrl);
      // console.log("🖼️ Image preview set");
    }

    toast.success("Preview generated successfully!");
  } catch (error) {
    console.error("❌ Preview error:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (
      error.code === "ERR_NETWORK" ||
      error.message.includes("ERR_CONNECTION_REFUSED")
    ) {
      toast.error(
        "Cannot connect to server. Please check if backend is running on port 5235."
      );
    } else if (error.response) {
      const errorMsg =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      toast.error(errorMsg);
    } else {
      toast.error("Failed to generate preview");
    }
  } finally {
    setLoadingPreview(false);
  }
};
  /// data going to backend form MOM
const handleSubmit = async () => {
  if (!otpVerified) {
    toast.error("Please verify OTP first");
    return;
  }

  setIsCreating(true);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

    const payload = {
      name: formData.name,
      category: formData.category,
      issueDate: formData.issueDate,
      letterType: formData.letterType,
      projectName: formData.projectName,
      subject: formData.subject,
      description: formData.description,
    };

    // console.log("📤 Creating client letter with payload:", payload);

    // ✅ FIXED: Changed from /api/client to /api/clientletters
    const response = await axios.post(`${apiUrl}/api/clientletters`, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      responseType: "blob",
    });

    // console.log("✅ Letter creation response received");

    // Get letterId from response headers
    const letterId = response.headers["x-letter-id"];
    setCreatedLetterId(letterId);

    // console.log("📋 Letter ID:", letterId);

    const blob = new Blob([response.data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    // Auto-download PDF
    const link = document.createElement("a");
    link.href = url;
    link.download = `${formData.name.replace(/\s+/g, "_")}_${
      letterId || "client_letter"
    }.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // console.log("✅ PDF downloaded");

    setPdfPreview(url);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      toast.success("Letter sent via Email & WhatsApp! 📧📱", {
        duration: 5000,
      });

      // Optional: Reset form after successful creation
      // setFormData({
      //   name: "",
      //   category: "",
      //   issueDate: "",
      //   letterType: "",
      //   projectName: "",
      //   subject: "",
      //   description: "",
      // });
      // setShowPreview(false);
    }, 3000);
  } catch (error) {
    console.error("❌ Create letter error:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });

    if (error.code === "ERR_NETWORK") {
      toast.error(
        "Cannot connect to server. Please check if backend is running on port 5235."
      );
    } else if (error.response) {
      const errorMsg =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
      toast.error(errorMsg);
    } else {
      toast.error("Failed to create letter");
    }
  } finally {
    setIsCreating(false);
  }
};

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </motion.button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Create client Letter
              </h1>
              <p className="text-gray-600 mt-2">
                Generate client letters with OTP verification
              </p>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
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
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    <option value="client">client</option>
                  </select>
                </div>

                {/* client Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    client Name *
                  </label>
                  {loadingNames ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <select
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!namesList.length || !formData.category}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50"
                    >
                      <option value="">Select client Name</option>
                      {namesList.map((person, idx) => (
                        <option key={idx} value={person.name}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Letter Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Award className="w-4 h-4 inline mr-2" />
                    Letter Type *
                  </label>
                  <select
                    value={formData.letterType}
                    onChange={(e) =>
                      handleInputChange("letterType", e.target.value)
                    }
                    disabled={!formData.category}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50"
                  >
                    <option value="">Select Letter Type</option>
                    {getLetterTypes(formData.category).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Project Name *
                  </label>
                  <p
                    className={`text-xs mb-2 ${
                      formData.projectName.length > 120
                        ? "text-red-500 font-semibold"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.projectName.length}/120 characters
                    {formData.projectName.length > 120 && " - Exceeds limit!"}
                  </p>
                  <input
                    type="text"
                    value={formData.projectName}
                    onChange={(e) =>
                      handleInputChange("projectName", e.target.value)
                    }
                    placeholder="Enter project name"
                    maxLength={120}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    placeholder="Enter subject"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Description *
                  </label>
                  <p className="text-xs text-blue-600 mb-2 bg-blue-50 p-2 rounded">
                    💡 Provide detailed information about the letter content
                  </p>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Enter description"
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
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
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                {/* Preview Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePreview}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Verify & Preview
                </motion.button>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📋 Instructions
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Select "client" as category</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Choose the client name from the dropdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Enter project name (max 120 characters)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>Provide detailed description</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">5.</span>
                    <span>
                      Select letter type (Agenda, MOM, Project Communication, or
                      Project Progress)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">6.</span>
                    <span>Select issue date</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">7.</span>
                    <span>Verify via WhatsApp OTP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">8.</span>
                    <span>Review preview and create letter</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-start gap-3">
                  <FaWhatsapp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      WhatsApp OTP Verification
                    </h4>
                    <p className="text-sm text-gray-700">
                      For security, you'll receive a 6-digit OTP via WhatsApp
                      before creating the letter.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="font-bold text-gray-900 mb-3">
                  📝 Letter Types for client
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    • <strong>Agenda</strong> - Meeting agenda documentation
                  </p>
                  <p>
                    • <strong>MOM (Minutes of Meeting)</strong> - Meeting
                    minutes record
                  </p>
                  <p>
                    • <strong>Project Communication</strong> - Project-related
                    communications
                  </p>
                  <p>
                    • <strong>Project Progress</strong> - Progress update
                    reports
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Preview Section
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
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
                  <p className="text-gray-600 font-medium">
                    Generating preview...
                  </p>
                </div>
              ) : (
                <>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full rounded-xl shadow-lg"
                    />
                  )}

                  {pdfPreview && (
                    <div
                      className="mt-4 w-full no-scrollbar relative"
                      style={{
                        height: "80vh",
                        overflow: "hidden", // 🚀 prevents UI scrollbar
                      }}
                    >
                      <iframe
                        src={`${pdfPreview}#toolbar=0&scrollbar=0&navpanes=0`}
                        className="w-full h-full rounded-lg"
                        style={{
                          border: "none",
                          overflow: "hidden", // 🚀 hides inner scroll
                        }}
                      ></iframe>
                    </div>
                  )}
                </>
              )}

              <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                  Letter Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">client Name:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Project Name:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.projectName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Letter Type:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.letterType}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-indigo-200">
                    <span className="text-gray-600 block mb-1">
                      Description:
                    </span>
                    <div className="text-gray-800 text-xs leading-relaxed bg-white p-3 rounded border border-indigo-100 max-h-32 overflow-y-auto">
                      {formData.description}
                    </div>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-indigo-200">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.issueDate
                        ? new Date(formData.issueDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : ""}
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
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    WhatsApp OTP Verification
                  </h2>
                  <p className="text-gray-600">
                    {otpSent
                      ? "Enter the 6-digit code sent to your WhatsApp"
                      : "We will send an OTP to verify this action"}
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
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
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
                      {resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : "Resend OTP"}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600">
                  Letter created successfully! WhatsApp notification sent to the
                  client.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
