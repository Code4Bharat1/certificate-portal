'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Building, MapPin, Calendar, 
  Edit2, Save, X, Camera, Shield, Key, LogOut,
  CheckCircle, AlertCircle, Loader2, ArrowLeft, Home,
  Lock, Eye, EyeOff
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

// Fixed Admin Data
const FIXED_ADMIN_DATA = {
  name: 'Admin',
  email: 'hr@nexcorealliance.com',
  phone: '9892398976',
  whatsappNumber: '9892398976',
  organization: 'Nexcore Alliance & Code 4 Bharat',
  designation: 'HR',
  location: 'Mumbai, India',
  role: 'Admin',
  joinedDate: '2024-01-01T00:00:00.000Z',
  profileImage: ''
};

export default function ProfilePage() {
  const router = useRouter();
  
  // States
  const [profile, setProfile] = useState(FIXED_ADMIN_DATA);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState(FIXED_ADMIN_DATA);
  
  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Profile Image Upload
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    return { 'Authorization': `Bearer ${token}` };
  };

  // Load Profile
  const loadProfile = () => {
    setLoading(true);
    
    // Check if there are any saved changes in localStorage
    const savedProfile = localStorage.getItem('adminProfile');
    
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('✅ Loaded saved profile from localStorage:', parsedProfile);
        setProfile(parsedProfile);
        setEditedProfile(parsedProfile);
        
        // Also update sessionStorage for other components
        sessionStorage.setItem('adminData', JSON.stringify(parsedProfile));
      } catch (error) {
        console.error('Error parsing saved profile:', error);
        // Use fixed data if parsing fails
        setProfile(FIXED_ADMIN_DATA);
        setEditedProfile(FIXED_ADMIN_DATA);
        sessionStorage.setItem('adminData', JSON.stringify(FIXED_ADMIN_DATA));
      }
    } else {
      // No saved changes, use fixed data
      console.log('📋 Using fixed admin data');
      setProfile(FIXED_ADMIN_DATA);
      setEditedProfile(FIXED_ADMIN_DATA);
      sessionStorage.setItem('adminData', JSON.stringify(FIXED_ADMIN_DATA));
      
      // Save to localStorage for first time
      localStorage.setItem('adminProfile', JSON.stringify(FIXED_ADMIN_DATA));
    }
    
    setLoading(false);
  };

  // Handle Input Change
  const handleInputChange = (field, value) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  // Save Profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage
      localStorage.setItem('adminProfile', JSON.stringify(editedProfile));
      
      // Also save to sessionStorage for other components
      sessionStorage.setItem('adminData', JSON.stringify(editedProfile));
      
      // Update state
      setProfile(editedProfile);
      setEditMode(false);
      
      // Try to sync with backend (optional)
      try {
        const response = await axios.put(
          `${API_URL}/api/admin/profile`,
          editedProfile,
          { 
            headers: getAuthHeaders(),
            timeout: 3000
          }
        );
        
        if (response.data.success) {
          console.log('✅ Profile synced with backend');
          toast.success('Profile updated successfully!');
        }
      } catch (backendError) {
        console.log('⚠️ Backend sync failed (data saved locally)');
        toast.success('Profile updated successfully!');
      }
      
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // Upload Profile Image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create local preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result;
        const updatedProfile = { ...profile, profileImage: imageUrl };
        
        setProfile(updatedProfile);
        setEditedProfile(updatedProfile);
        
        // Save to localStorage
        localStorage.setItem('adminProfile', JSON.stringify(updatedProfile));
        sessionStorage.setItem('adminData', JSON.stringify(updatedProfile));
        
        toast.success('Profile image updated!');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);

      // Try to upload to backend (optional)
      try {
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await axios.post(
          `${API_URL}/api/admin/profile/image`,
          formData,
          {
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'multipart/form-data'
            },
            timeout: 5000
          }
        );

        if (response.data.success) {
          console.log('✅ Image also uploaded to server');
        }
      } catch (uploadError) {
        console.log('⚠️ Image saved locally only');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      setUploadingImage(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setShowChangePassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  // Reset to Default
  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset to default admin data?')) {
      localStorage.setItem('adminProfile', JSON.stringify(FIXED_ADMIN_DATA));
      sessionStorage.setItem('adminData', JSON.stringify(FIXED_ADMIN_DATA));
      setProfile(FIXED_ADMIN_DATA);
      setEditedProfile(FIXED_ADMIN_DATA);
      setEditMode(false);
      toast.success('Profile reset to default!');
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.clear();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Toaster position="top-center" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
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

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                My Profile
              </h1>
              <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
            </div>

            <div className="flex gap-3">
              {!editMode ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    <Edit2 className="w-5 h-5" />
                    Edit Profile
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetToDefault}
                    className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Reset to Default
                  </motion.button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center sticky top-6">
              {/* Profile Image */}
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden relative">
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                  )}
                  {profile.profileImage ? (
                    <img 
                      src={profile.profileImage} 
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.name?.charAt(0)?.toUpperCase() || 'A'
                  )}
                </div>
                
                {/* Change Photo Button */}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile.name}</h2>
              <p className="text-gray-600 mb-2">{profile.designation}</p>
              <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                {profile.role}
              </div>

              {/* Quick Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Email</span>
                  <span className="text-gray-900 font-semibold text-sm truncate ml-2">{profile.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Phone</span>
                  <span className="text-gray-900 font-semibold text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-sm">Location</span>
                  <span className="text-gray-900 font-semibold text-sm">{profile.location}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Key className="w-5 h-5" />
                  Change Password
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                Profile Information
              </h3>

              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedProfile.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.name}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={editedProfile.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.phone}
                    </div>
                  )}
                </div>

                {/* WhatsApp Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaWhatsapp className="w-4 h-4 inline mr-2 text-green-600" />
                    WhatsApp Number
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      value={editedProfile.whatsappNumber || ''}
                      onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.whatsappNumber}
                    </div>
                  )}
                </div>

                {/* Organization */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="w-4 h-4 inline mr-2" />
                    Organization
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedProfile.organization || ''}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.organization}
                    </div>
                  )}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Designation
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedProfile.designation || ''}
                      onChange={(e) => handleInputChange('designation', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.designation}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900 font-medium">
                      {profile.location}
                    </div>
                  )}
                </div>

                {/* Save/Cancel Buttons */}
                {editMode && (
                  <div className="flex gap-3 pt-4 border-t">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setEditMode(false);
                        setEditedProfile(profile);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showChangePassword && (
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
                  onClick={() => setShowChangePassword(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                    <Lock className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
                  <p className="text-gray-600">Enter your current and new password</p>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangePassword}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Change Password
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}