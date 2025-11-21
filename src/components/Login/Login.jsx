'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, Lock, Eye, EyeOff, Smartphone } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';
// import { toast } from 'react-hot-toast';


export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  
  // OTP Flow States
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  // First Login Flow States
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

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
      toast.error('Please enter username and password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      if (response.data.success) {
        toast.success('Admin login successful!');
        
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userType', 'admin');
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify(response.data.user));

        setTimeout(() => router.push('/dashboard'), 500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Invalid credentials!';
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
      setOtp(""); // Clear previous input
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
    otp
  },
  {
    headers: {
      Authorization: `Bearer ${tempToken}`
    }
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

    // Auto-close OTP screen if expired
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
      const response = await axios.post(`${API_URL}/api/auth/user/first-login`, {
        username: username
      });

      if (response.data.success) {
        toast.success('New OTP sent! 📱');
        setOtp('');
        startResendTimer();
      }
    } catch (error) {
      toast.error('Failed to resend OTP');
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
    console.log("Login request payload:", {
      loginId: username,
      password
    });

    const response = await axios.post(
      `${API_URL}/api/auth/user/user-login`,
      {
        loginId: username,
        password
      }
    );

    console.log("Login API Response:", response.data);

    if (response.data.success) {
      toast.success("Login successful!");

      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("userType", "user");
      sessionStorage.setItem("authToken", response.data.token);
      sessionStorage.setItem("userData", JSON.stringify(response.data.user));

      setTimeout(() => router.push("/user/dashboard"), 500);
    }
  } catch (error) {
    console.error("Login Error:", error.response?.data || error);

    const err = error.response?.data;

    // 🔥 Server says user must finish first login (OTP)
    if (err?.requiresFirstLogin) {
      toast.info("Please complete your first login");
      handleUserFirstLogin();
      return;
    }

    // Generic error
    toast.error(err?.message || "Invalid credentials");
  } finally {
    setLoading(false);
  }
};


  // ========== SET PASSWORD (After OTP Verify) ==========
  const handleSetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please enter both passwords');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Sending temp token:', tempToken);
      
      const response = await axios.post(
        `${API_URL}/api/auth/user/set-password`,
        {
          password: newPassword,
          confirmPassword: confirmPassword
        },
        {
          headers: {
            Authorization: `Bearer ${tempToken}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Password set successfully! Logging you in...');
        
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userType', 'user');
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify(response.data.user));

        setTimeout(() => router.push('/user/dashboard'), 1000);
      }
    } catch (error) {
      console.error('Set password error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to set password';
      toast.error(errorMessage);
      
      if (error.response?.data?.message?.includes('expired') || error.response?.data?.message?.includes('Invalid token')) {
        setIsFirstLogin(false);
        setShowOtpScreen(false);
        setTempToken('');
        setNewPassword('');
        setConfirmPassword('');
        toast.info('Session expired. Please start login again');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== MAIN SUBMIT HANDLER ==========
  const handleSubmit = async () => {
    if (loginType === 'admin') {
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
    if (e.key === 'Enter') {
      if (showOtpScreen) {
        handleVerifyOtp();
      } else if (isFirstLogin) {
        handleSetPassword();
      } else {
        handleSubmit();
      }
    }
  };

  const toggleLoginType = (type) => {
    setLoginType(type);
    setUsername('');
    setPassword('');
    setShowOtpScreen(false);
    setOtp('');
    setIsFirstLogin(false);
    setTempToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const cancelOtpFlow = () => {
    setShowOtpScreen(false);
    setOtp('');
    setTempToken('');
    setUserInfo(null);
  };

  const cancelPasswordSetup = () => {
    setIsFirstLogin(false);
    setTempToken('');
    setNewPassword('');
    setConfirmPassword('');
    setUserInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/30 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/20 dark:bg-blue-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-gray-200 dark:border-gray-700"
      >
        {/* OTP SCREEN */}
        {showOtpScreen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: 'spring', duration: 0.8 }}
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
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
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
                  Resend OTP in <span className="font-bold text-blue-600 dark:text-blue-400">{resendTimer}s</span>
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
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
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
            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
              <button
                onClick={() => toggleLoginType('admin')}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  loginType === 'admin'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Shield className="w-5 h-5" />
                Admin
              </button>
              <button
                onClick={() => toggleLoginType('user')}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  loginType === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white shadow-lg'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <User className="w-5 h-5" />
                User
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={loginType}
                initial={{ opacity: 0, x: loginType === 'admin' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: loginType === 'admin' ? 20 : -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
                  >
                    {loginType === 'admin' ? (
                      <Shield className="w-10 h-10 text-white" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </motion.div>
                  <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {loginType === 'admin' ? 'Admin Portal' : 'User Portal'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {loginType === 'admin'
                      ? 'Sign in to access admin dashboard'
                      : 'Sign in to access your certificates'}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {loginType === 'admin' ? 'Admin Username' : 'Phone Number'}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      className="w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={loginType === 'admin' ? 'Enter admin username' : 'Enter phone number (e.g., 9876543210)'}
                    />
                    {loginType === 'user' && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        📱 Enter 10-digit phone number (without +91)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Password {loginType === 'user' && <span className="text-xs text-gray-500">(if already set)</span>}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
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
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {loginType === 'user' && !password && (
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        💡 First time? Just enter phone number to receive OTP
                      </p>
                    )}
                  </div>

                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loginType === 'user' && !password ? 'Sending OTP...' : 'Signing In...'}
                      </span>
                    ) : (
                      `${loginType === 'user' && !password ? 'Send OTP' : 'Sign In'}`
                    )}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                {loginType === 'admin' ? (
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
                transition={{ type: 'spring', duration: 0.8 }}
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
                  type={showNewPassword ? 'text' : 'password'}
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
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
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
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">Passwords do not match</p>
              )}
            </div>

            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-blue-500 dark:bg-blue-400' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <span className={newPassword.length >= 6 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
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
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting Password...
                  </span>
                ) : (
                  'Set Password & Login'
                )}
              </motion.button>
            </div>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                🔒 This password will be used for future logins
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}