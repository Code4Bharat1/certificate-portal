"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Upload,
  X,
  FileText,
  CheckCircle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("admin");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP Flow States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // First Login Flow States
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Document Upload States
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documents, setDocuments] = useState({
    aadharFront: null,
    aadharBack: null,
    panCard: null,
    bankPassbook: null,
  });
  const [documentPreviews, setDocumentPreviews] = useState({
    aadharFront: null,
    aadharBack: null,
    panCard: null,
    bankPassbook: null,
  });
  const [uploadingDocument, setUploadingDocument] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordPhone, setForgotPasswordPhone] = useState("");
  const [showForgotPasswordOtp, setShowForgotPasswordOtp] = useState(false);
  const [forgotPasswordOtp, setForgotPasswordOtp] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [showResetNewPassword, setShowResetNewPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] =
    useState(false);

  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

  // ========== RESEND TIMER ==========
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ========== ADMIN LOGIN ==========
  const handleAdminLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      if (response.data.success) {
        toast.success("Admin login successful!");

        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userType", "admin");
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("userData", JSON.stringify(response.data.user));

        setTimeout(() => router.push("/dashboard"), 500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid credentials!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== SUPER ADMIN LOGIN ==========
  const handleSuperAdminLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/super-admin/login`,
        {
          username,
          password,
        }
      );

      if (response.data.success) {
        toast.success("Super Admin login successful!");

        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userType", "superadmin");
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("userData", JSON.stringify(response.data.user));

        setTimeout(() => router.push("/super-admin/dashboard"), 500);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Invalid credentials!";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== USER FIRST LOGIN (Send OTP) ==========
  const handleUserFirstLogin = async () => {
    if (!username) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/first-login`,
        { username }
      );

      const data = response.data;

      if (data.success && data.firstLogin) {
        toast.success("OTP sent to your WhatsApp! 📱");
        setTempToken(data.tempToken);
        setUserInfo(data.user);
        setShowOtpScreen(true);
        setOtp("");
        startResendTimer();
      }
    } catch (error) {
      const err = error.response?.data;

      if (err?.requiresPassword) {
        toast.error("Password already set! Please enter your password");
        return;
      }

      toast.error(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ========== VERIFY OTP ==========
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/verify-otp`,
        {
          phone: userInfo.phone,
          otp,
        },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      const data = response.data;

      if (data.success) {
        toast.success("OTP verified! Please set your password");

        setTempToken(data.tempToken);
        setUserInfo(data.user);

        setShowOtpScreen(false);
        setIsFirstLogin(true);
      }
    } catch (error) {
      const err = error.response?.data;
      const errorMessage = err?.message || "Invalid OTP";

      toast.error(errorMessage);

      if (errorMessage.toLowerCase().includes("expired")) {
        toast.info("OTP expired. Please request a new one.");
        setOtp("");
        setShowOtpScreen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== RESEND OTP ==========
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/first-login`,
        {
          username: username,
        }
      );

      if (response.data.success) {
        toast.success("New OTP sent! 📱");
        setOtp("");
        startResendTimer();
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ========== USER REGULAR LOGIN (With Password) ==========
  const handleUserLogin = async () => {
    if (!username || !password) {
      toast.error("Please enter phone number and password");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/user/user-login`, {
        loginId: username,
        password,
      });

      if (response.data.success) {
        toast.success("Login successful!");

        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userType", "user");
        sessionStorage.setItem("authToken", response.data.token);
        sessionStorage.setItem("userData", JSON.stringify(response.data.user));

        setTimeout(() => router.push("/user/dashboard"), 500);
      }
    } catch (error) {
      const err = error.response?.data;

      if (err?.requiresFirstLogin) {
        toast.info("Please complete your first login");
        handleUserFirstLogin();
        return;
      }

      toast.error(err?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // ========== SET PASSWORD (After OTP Verify) ==========
  const handleSetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both passwords");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/set-password`,
        {
          password: newPassword,
          confirmPassword: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Password set successfully!");

        // Store token and user data temporarily
        const authToken = response.data.token;
        const userData = response.data.user;

        setTempToken(authToken);
        setUserInfo(userData);

        // Show document upload modal
        setIsFirstLogin(false);
        setShowDocumentUpload(true);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to set password";
      toast.error(errorMessage);

      if (
        error.response?.data?.message?.includes("expired") ||
        error.response?.data?.message?.includes("Invalid token")
      ) {
        setIsFirstLogin(false);
        setShowOtpScreen(false);
        setTempToken("");
        setNewPassword("");
        setConfirmPassword("");
        toast.info("Session expired. Please start login again");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== DOCUMENT UPLOAD HANDLERS ==========
  const handleDocumentSelect = (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid document (JPG, PNG, or PDF)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    setDocuments((prev) => ({
      ...prev,
      [documentType]: file,
    }));

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreviews((prev) => ({
          ...prev,
          [documentType]: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setDocumentPreviews((prev) => ({
        ...prev,
        [documentType]: "pdf",
      }));
    }
  };

  const handleDocumentUpload = async () => {
  // Check if all mandatory documents are uploaded
  if (
    !documents.aadharFront ||
    !documents.aadharBack ||
    !documents.panCard ||
    !documents.bankPassbook
  ) {
    toast.error("Please upload all mandatory documents");
    return;
  }

  setUploadingDocument(true);

  try {
    const formData = new FormData();

    // Use documents, not undefined file1/file2/file3/file4
    formData.append("aadhaarFront", documents.aadharFront);
    formData.append("aadhaarBack", documents.aadharBack);
    formData.append("panCard", documents.panCard);
    formData.append("bankPassbook", documents.bankPassbook);

    // SAVE THE RESPONSE
    const response = await axios.post(
      `${API_URL}/api/auth/user/student/upload-documents`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${tempToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success) {
      toast.success("Documents uploaded successfully! 🎉");

      // Complete login
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("userType", "user");
      sessionStorage.setItem("authToken", tempToken);
      sessionStorage.setItem("userData", JSON.stringify(userInfo));

      setTimeout(() => router.push("/user/dashboard"), 1000);
    }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Failed to upload documents";
    toast.error(errorMessage);
    console.log(error);
  } finally {
    setUploadingDocument(false);
  }
};

  const removeSelectedDocument = (documentType) => {
    setDocuments((prev) => ({
      ...prev,
      [documentType]: null,
    }));
    setDocumentPreviews((prev) => ({
      ...prev,
      [documentType]: null,
    }));
  };

  // ========== FORGOT PASSWORD - SEND OTP ==========
  const handleForgotPasswordSendOtp = async () => {
    if (!forgotPasswordPhone) {
      toast.error("Please enter your phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/forgot-password`,
        {
          phone: forgotPasswordPhone,
        }
      );

      if (response.data.success) {
        toast.success("OTP sent to your WhatsApp! 📱");
        setShowForgotPassword(false);
        setShowForgotPasswordOtp(true);
        setForgotPasswordOtp("");
        startResendTimer();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== FORGOT PASSWORD - VERIFY OTP ==========
  const handleForgotPasswordVerifyOtp = async () => {
    if (!forgotPasswordOtp || forgotPasswordOtp.length !== 6) {
      toast.error("Please enter 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/verify-reset-otp`,
        {
          phone: forgotPasswordPhone,
          otp: forgotPasswordOtp,
        }
      );

      if (response.data.success) {
        toast.success("OTP verified! Set your new password");
        setResetToken(response.data.resetToken);
        setShowForgotPasswordOtp(false);
        setShowResetPassword(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Invalid OTP";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== FORGOT PASSWORD - RESET PASSWORD ==========
  const handleResetPassword = async () => {
    if (!resetNewPassword || !resetConfirmPassword) {
      toast.error("Please enter both passwords");
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (resetNewPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/reset-password`,
        {
          password: resetNewPassword,
          confirmPassword: resetConfirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${resetToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Password reset successful! Please login");

        // Reset all forgot password states
        setShowResetPassword(false);
        setForgotPasswordPhone("");
        setForgotPasswordOtp("");
        setResetToken("");
        setResetNewPassword("");
        setResetConfirmPassword("");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ========== RESEND FORGOT PASSWORD OTP ==========
  const handleResendForgotPasswordOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/auth/user/forgot-password`,
        {
          phone: forgotPasswordPhone,
        }
      );

      if (response.data.success) {
        toast.success("New OTP sent! 📱");
        setForgotPasswordOtp("");
        startResendTimer();
      }
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ========== CANCEL HANDLERS ==========
  const cancelForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotPasswordPhone("");
  };

  const cancelForgotPasswordOtp = () => {
    setShowForgotPasswordOtp(false);
    setForgotPasswordOtp("");
    setForgotPasswordPhone("");
  };

  const cancelResetPassword = () => {
    setShowResetPassword(false);
    setResetToken("");
    setResetNewPassword("");
    setResetConfirmPassword("");
    setForgotPasswordPhone("");
  };

  // ========== MAIN SUBMIT HANDLER ==========
  const handleSubmit = async () => {
    if (isSuperAdmin) {
      handleSuperAdminLogin();
    } else if (loginType === "admin") {
      handleAdminLogin();
    } else {
      if (password) {
        handleUserLogin();
      } else {
        handleUserFirstLogin();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (showOtpScreen) {
        handleVerifyOtp();
      } else if (isFirstLogin) {
        handleSetPassword();
      } else if (showForgotPassword) {
        handleForgotPasswordSendOtp();
      } else if (showForgotPasswordOtp) {
        handleForgotPasswordVerifyOtp();
      } else if (showResetPassword) {
        handleResetPassword();
      } else {
        handleSubmit();
      }
    }
  };

  const toggleLoginType = (type) => {
    setLoginType(type);
    setIsSuperAdmin(false);
    setUsername("");
    setPassword("");
    setShowOtpScreen(false);
    setOtp("");
    setIsFirstLogin(false);
    setTempToken("");
    setNewPassword("");
    setConfirmPassword("");
    setShowForgotPassword(false);
    setShowForgotPasswordOtp(false);
    setShowResetPassword(false);
  };

  const toggleSuperAdmin = () => {
    setIsSuperAdmin(!isSuperAdmin);
    setUsername("");
    setPassword("");
    setShowOtpScreen(false);
    setOtp("");
    setIsFirstLogin(false);
    setTempToken("");
    setNewPassword("");
    setConfirmPassword("");
    setShowForgotPassword(false);
    setShowForgotPasswordOtp(false);
    setShowResetPassword(false);
  };

  const cancelOtpFlow = () => {
    setShowOtpScreen(false);
    setOtp("");
    setTempToken("");
    setUserInfo(null);
  };

  const cancelPasswordSetup = () => {
    setIsFirstLogin(false);
    setTempToken("");
    setNewPassword("");
    setConfirmPassword("");
    setUserInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <Toaster position="top-right" />

      {/* DOCUMENT UPLOAD MODAL */}
      <AnimatePresence>
        {showDocumentUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 "
            onClick={(e) => e.target === e.currentTarget && !uploadingDocument}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-3xl my-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
                >
                  <Upload className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  Upload Your Documents
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Please upload all mandatory documents to continue
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Aadhar Card Front */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Aadhar Card (Front) <span className="text-red-500">*</span>
                  </label>
                  {!documents.aadharFront ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Upload Front
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          JPG, PNG or PDF (Max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) => handleDocumentSelect(e, "aadharFront")}
                        className="hidden"
                        disabled={uploadingDocument}
                      />
                    </label>
                  ) : (
                    <div className="border-2 border-blue-500 dark:border-blue-400 rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-start gap-2">
                        {documentPreviews.aadharFront &&
                        documentPreviews.aadharFront !== "pdf" ? (
                          <img
                            src={documentPreviews.aadharFront}
                            alt="Aadhar Front"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {documents.aadharFront.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(documents.aadharFront.size / 1024).toFixed(2)} KB
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Uploaded
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSelectedDocument("aadharFront")}
                          disabled={uploadingDocument}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Aadhar Card Back */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Aadhar Card (Back) <span className="text-red-500">*</span>
                  </label>
                  {!documents.aadharBack ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Upload Back
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          JPG, PNG or PDF (Max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) => handleDocumentSelect(e, "aadharBack")}
                        className="hidden"
                        disabled={uploadingDocument}
                      />
                    </label>
                  ) : (
                    <div className="border-2 border-blue-500 dark:border-blue-400 rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-start gap-2">
                        {documentPreviews.aadharBack &&
                        documentPreviews.aadharBack !== "pdf" ? (
                          <img
                            src={documentPreviews.aadharBack}
                            alt="Aadhar Back"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {documents.aadharBack.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(documents.aadharBack.size / 1024).toFixed(2)} KB
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Uploaded
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSelectedDocument("aadharBack")}
                          disabled={uploadingDocument}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* PAN Card */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    PAN Card <span className="text-red-500">*</span>
                  </label>
                  {!documents.panCard ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Upload PAN
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          JPG, PNG or PDF (Max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) => handleDocumentSelect(e, "panCard")}
                        className="hidden"
                        disabled={uploadingDocument}
                      />
                    </label>
                  ) : (
                    <div className="border-2 border-blue-500 dark:border-blue-400 rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-start gap-2">
                        {documentPreviews.panCard &&
                        documentPreviews.panCard !== "pdf" ? (
                          <img
                            src={documentPreviews.panCard}
                            alt="PAN Card"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {documents.panCard.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(documents.panCard.size / 1024).toFixed(2)} KB
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Uploaded
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSelectedDocument("panCard")}
                          disabled={uploadingDocument}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank Passbook */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Bank Passbook <span className="text-red-500">*</span>
                  </label>
                  {!documents.bankPassbook ? (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          Upload Passbook
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          JPG, PNG or PDF (Max 5MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,application/pdf"
                        onChange={(e) =>
                          handleDocumentSelect(e, "bankPassbook")
                        }
                        className="hidden"
                        disabled={uploadingDocument}
                      />
                    </label>
                  ) : (
                    <div className="border-2 border-blue-500 dark:border-blue-400 rounded-xl p-3 bg-blue-50 dark:bg-blue-900/20">
                      <div className="flex items-start gap-2">
                        {documentPreviews.bankPassbook &&
                        documentPreviews.bankPassbook !== "pdf" ? (
                          <img
                            src={documentPreviews.bankPassbook}
                            alt="Bank Passbook"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {documents.bankPassbook.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(documents.bankPassbook.size / 1024).toFixed(2)} KB
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Uploaded
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSelectedDocument("bankPassbook")}
                          disabled={uploadingDocument}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50 flex-shrink-0"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: uploadingDocument ? 1 : 1.02 }}
                whileTap={{ scale: uploadingDocument ? 1 : 0.98 }}
                onClick={handleDocumentUpload}
                disabled={
                  uploadingDocument ||
                  !documents.aadharFront ||
                  !documents.aadharBack ||
                  !documents.panCard ||
                  !documents.bankPassbook
                }
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingDocument ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Uploading Documents...
                  </span>
                ) : (
                  "Upload All & Continue to Dashboard"
                )}
              </motion.button>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
                  ⚠️ All 4 documents are mandatory to access your dashboard
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-gray-200 dark:border-gray-700"
      >
        {/* FORGOT PASSWORD SCREEN */}
        {showForgotPassword ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Forgot Password?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter your phone number to receive OTP
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={forgotPasswordPhone}
                onChange={(e) => setForgotPasswordPhone(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelForgotPassword}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleForgotPasswordSendOtp}
                disabled={loading || !forgotPasswordPhone}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send OTP"}
              </motion.button>
            </div>
          </motion.div>
        ) : showForgotPasswordOtp ? (
          /* FORGOT PASSWORD OTP VERIFICATION */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
              >
                <Smartphone className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Verify OTP
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter the 6-digit OTP sent to
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {forgotPasswordPhone}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={forgotPasswordOtp}
                onChange={(e) =>
                  setForgotPasswordOtp(e.target.value.replace(/\D/g, ""))
                }
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
                placeholder="000000"
              />
            </div>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Resend OTP in{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {resendTimer}s
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendForgotPasswordOtp}
                  disabled={loading}
                  className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50"
                >
                  Didn't receive OTP? Resend
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelForgotPasswordOtp}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleForgotPasswordVerifyOtp}
                disabled={loading || forgotPasswordOtp.length !== 6}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </motion.button>
            </div>
          </motion.div>
        ) : showResetPassword ? (
          /* RESET PASSWORD SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Reset Password
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create a new secure password
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showResetNewPassword ? "text" : "password"}
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowResetNewPassword(!showResetNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showResetNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showResetConfirmPassword ? "text" : "password"}
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowResetConfirmPassword(!showResetConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showResetConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {resetNewPassword &&
                resetConfirmPassword &&
                resetNewPassword !== resetConfirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelResetPassword}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleResetPassword}
                disabled={
                  loading ||
                  !resetNewPassword ||
                  !resetConfirmPassword ||
                  resetNewPassword !== resetConfirmPassword
                }
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>
            </div>
          </motion.div>
        ) : showOtpScreen ? (
          /* OTP SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
              >
                <Smartphone className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Verify OTP
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Enter the 6-digit OTP sent to
              </p>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mt-1">
                {username}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
                placeholder="000000"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-center">
                📱 Check your WhatsApp messages
              </p>
            </div>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Resend OTP in{" "}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {resendTimer}s
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline disabled:opacity-50"
                >
                  Didn't receive OTP? Resend
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelOtpFlow}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </motion.button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                🔐 Your OTP is valid for 5 minutes
              </p>
            </div>
          </motion.div>
        ) : !isFirstLogin ? (
          <>
            {/* Super Admin Toggle - Shows above main toggle */}
            {(loginType === "admin" || isSuperAdmin) && (
              <div className="mb-4">
                <button
                  onClick={toggleSuperAdmin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg font-medium text-sm hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSuperAdmin ? (
                    <>
                      <Shield className="w-4 h-4" />
                      Switch to Admin Login
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Super Admin Access
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Toggle Buttons - Only show if not Super Admin */}
            {!isSuperAdmin && (
              <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                <button
                  onClick={() => toggleLoginType("admin")}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    loginType === "admin"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Shield className="w-5 h-5" />
                  Admin
                </button>
                <button
                  onClick={() => toggleLoginType("user")}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    loginType === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <User className="w-5 h-5" />
                  User
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={isSuperAdmin ? "superadmin" : loginType}
                initial={{
                  opacity: 0,
                  x: isSuperAdmin ? 0 : loginType === "admin" ? -20 : 20,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: isSuperAdmin ? 0 : loginType === "admin" ? 20 : -20,
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`w-20 h-20 ${
                      isSuperAdmin
                        ? "bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700"
                        : "bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
                    } rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl`}
                  >
                    {isSuperAdmin ? (
                      <Lock className="w-10 h-10 text-white" />
                    ) : loginType === "admin" ? (
                      <Shield className="w-10 h-10 text-white" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </motion.div>
                  <h1
                    className={`text-3xl font-bold mb-2 ${
                      isSuperAdmin
                        ? "text-purple-600 dark:text-purple-400"
                        : "text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {isSuperAdmin
                      ? "Super Admin Portal"
                      : loginType === "admin"
                      ? "Admin Portal"
                      : "User Portal"}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isSuperAdmin
                      ? "Sign in with super admin credentials"
                      : loginType === "admin"
                      ? "Sign in to access admin dashboard"
                      : "Sign in to access your certificates"}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isSuperAdmin
                        ? "Super Admin Username"
                        : loginType === "admin"
                        ? "Admin Username"
                        : "Phone Number"}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      className="w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={
                        isSuperAdmin
                          ? "Enter super admin username"
                          : loginType === "admin"
                          ? "Enter admin username"
                          : "Enter phone number (e.g., 9876543210)"
                      }
                    />
                    {loginType === "user" && !isSuperAdmin && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        📱 Enter 10-digit phone number (without +91)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password{" "}
                      {loginType === "user" && !isSuperAdmin && (
                        <span className="text-xs text-gray-500">
                          (if already set)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {loginType === "user" && !password && !isSuperAdmin && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        💡 First time? Just enter phone number to receive OTP
                      </p>
                    )}
                    {loginType === "user" && !isSuperAdmin && (
                      <button
                        onClick={() => setShowForgotPassword(true)}
                        className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full ${
                      isSuperAdmin
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-700 dark:hover:to-purple-800"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800"
                    } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {loginType === "user" && !password && !isSuperAdmin
                          ? "Sending OTP..."
                          : "Signing In..."}
                      </span>
                    ) : (
                      `${
                        loginType === "user" && !password && !isSuperAdmin
                          ? "Send OTP"
                          : "Sign In"
                      }`
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                {isSuperAdmin ? (
                  <>
                    <Lock className="w-4 h-4 inline mr-1" />
                    Super Admin access only • Highest level privileges
                  </>
                ) : loginType === "admin" ? (
                  <>
                    <Shield className="w-4 h-4 inline mr-1" />
                    Admin access only • No signup available
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    First time? You'll receive OTP • Contact admin for support
                  </>
                )}
              </p>
            </div>
          </>
        ) : (
          /* PASSWORD SETUP SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Set Your Password
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Welcome, {userInfo?.name}! 👋
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                Create a secure password for your account
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {newPassword &&
                confirmPassword &&
                newPassword !== confirmPassword && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Passwords do not match
                  </p>
                )}
            </div>

            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      newPassword.length >= 6
                        ? "bg-blue-500 dark:bg-blue-400"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                  <span
                    className={
                      newPassword.length >= 6
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }
                  >
                    At least 6 characters
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={cancelPasswordSetup}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleSetPassword}
                disabled={
                  loading ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Setting Password...
                  </span>
                ) : (
                  "Continue"
                )}
              </motion.button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                🔒 Next step: Upload mandatory document to access dashboard
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
