'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Shield, User, Lock, Eye, EyeOff } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'user'
  const [showPassword, setShowPassword] = useState(false);
  
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

  // ========== USER FIRST LOGIN (Username Only) ==========
  const handleUserFirstLogin = async () => {
    if (!username) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/user/first-login`, {
        username: username
      });

      if (response.data.success && response.data.firstLogin) {
        toast.success('Welcome! Please set your password.');
        setIsFirstLogin(true);
        setTempToken(response.data.tempToken);
        setUserInfo(response.data.user);
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.requiresPassword) {
        // User already set password, needs regular login
        toast.error('Please enter your password');
      } else {
        toast.error(errorData?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== USER REGULAR LOGIN (With Password) ==========
  const handleUserLogin = async () => {
    if (!username || !password) {
      toast.error('Please enter phone number and password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/auth/user/user-login`, {
        loginId: username,
        password: password
      });

      if (response.data.success) {
        toast.success('Login successful!');
        
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userType', 'user');
        sessionStorage.setItem('authToken', response.data.token);
        sessionStorage.setItem('userData', JSON.stringify(response.data.user));

        setTimeout(() => router.push('/user/dashboard'), 500);
      }
    } catch (error) {
      const errorData = error.response?.data;
      
      if (errorData?.requiresFirstLogin) {
        // Redirect to first login
        toast.info('Please complete your first login');
        handleUserFirstLogin();
      } else {
        toast.error(errorData?.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  };

  // ========== SET PASSWORD (After First Login) ==========
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
      const errorMessage = error.response?.data?.message || 'Failed to set password';
      toast.error(errorMessage);
      
      if (error.response?.data?.message?.includes('expired')) {
        // Token expired, restart flow
        setIsFirstLogin(false);
        setTempToken('');
        setNewPassword('');
        setConfirmPassword('');
        toast.info('Please start login again');
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
      // User login flow
      if (password) {
        // Has password, try regular login
        handleUserLogin();
      } else {
        // No password, try first login
        handleUserFirstLogin();
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (isFirstLogin) {
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
    setIsFirstLogin(false);
    setTempToken('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const cancelPasswordSetup = () => {
    setIsFirstLogin(false);
    setTempToken('');
    setNewPassword('');
    setConfirmPassword('');
    setUserInfo(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-orange-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Toaster position="top-right" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 w-full max-w-md relative z-10 border-2 border-blue-200 dark:border-blue-800"
      >
        {!isFirstLogin ? (
          <>
            {/* Toggle Buttons */}
            <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => toggleLoginType('admin')}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  loginType === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
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
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
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
                    className={`w-20 h-20 ${
                      loginType === 'admin'
                        ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                        : 'bg-gradient-to-br from-orange-600 to-amber-600'
                    } rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl`}
                  >
                    {loginType === 'admin' ? (
                      <Shield className="w-10 h-10 text-white" />
                    ) : (
                      <User className="w-10 h-10 text-white" />
                    )}
                  </motion.div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 dark:from-blue-400 dark:to-orange-400 bg-clip-text text-transparent mb-2">
                    {loginType === 'admin' ? 'Admin Portal' : 'User Portal'}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {loginType === 'admin'
                      ? 'Sign in to access admin dashboard'
                      : 'Sign in to access your certificates'}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Username/Phone Input */}
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
                      className="w-full px-4 py-3 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder={loginType === 'admin' ? 'Enter admin username' : 'Enter phone number (e.g., 9876543210)'}
                    />
                    {loginType === 'user' && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        📱 Enter 10-digit phone number (without +91)
                      </p>
                    )}
                  </div>

                  {/* Password Input (Optional for first-time users) */}
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
                        className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-orange-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                        💡 First time? Just enter phone number and click continue
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`w-full ${
                      loginType === 'admin'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                        : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                    } text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {loginType === 'user' && !password ? 'Checking...' : 'Signing In...'}
                      </span>
                    ) : (
                      `${loginType === 'user' && !password ? 'Continue' : 'Sign In'}`
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
                    <User className="w-4 h-4 inline mr-1" />
                    Secure certificate access • Contact admin for support
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
                className="w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
              >
                <Lock className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent mb-2">
                Set Your Password
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Welcome, {userInfo?.name}! 👋
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                Create a secure password for your account
              </p>
            </div>

            {/* New Password */}
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
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition disabled:opacity-50"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
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
                  className="w-full px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition disabled:opacity-50"
                  placeholder="Re-enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {newPassword && confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Password Strength */}
            {newPassword && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span className={newPassword.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                    At least 6 characters
                  </span>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelPasswordSetup}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                onClick={handleSetPassword}
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Setting...
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