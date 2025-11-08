'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Building, MapPin, Calendar, 
  Edit2, Save, X, Camera, Shield, Key, LogOut,
  CheckCircle, AlertCircle, Loader2, ArrowLeft, Home,
  Lock, Eye, EyeOff, Plus, UserPlus, Trash2, Search,
  Users, ChevronDown, Filter, Settings, PlusCircle
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

// Fixed Admin Data
// const FIXED_ADMIN_DATA = {
//   name: 'Admin',
//   email: 'hr@nexcorealliance.com',
//   phone: '9892398976',
//   whatsappNumber: '9892398976',
//   organization: 'Nexcore Alliance & Code 4 Bharat',
//   designation: 'HR',
//   location: 'Mumbai, India',
//   role: 'Admin',
//   joinedDate: '2024-01-01T00:00:00.000Z',
//   profileImage: ''
// };

// Available roles with their access permissions
const AVAILABLE_ROLES = [
  { 
    id: 'super_admin', 
    name: 'Super Admin', 
    description: 'Full access to all features and categories',
    permissions: ['marketing-junction', 'code4bharat', 'bootcamp', 'bvoc', 'fsd', 'hr', 'admin_management']
  },
  { 
    id: 'admin', 
    name: 'Admin', 
    description: 'Access to most features except admin management',
    permissions: ['marketing-junction', 'code4bharat', 'bootcamp', 'bvoc', 'fsd', 'hr']
  },
  { 
    id: 'code4bharat_admin', 
    name: 'Code4Bharat Admin', 
    description: 'Access only to Code4Bharat certificates',
    permissions: ['code4bharat']
  },
  { 
    id: 'marketing_junction_admin', 
    name: 'Marketing Junction Admin', 
    description: 'Access only to Marketing Junction certificates',
    permissions: ['marketing-junction']
  },
  { 
    id: 'fsd_admin', 
    name: 'FSD Admin', 
    description: 'Access only to FSD certificates',
    permissions: ['fsd']
  },
  { 
    id: 'hr_admin', 
    name: 'HR Admin', 
    description: 'Access only to HR certificates',
    permissions: ['hr']
  },
  { 
    id: 'bootcamp_admin', 
    name: 'Bootcamp Admin', 
    description: 'Access only to Bootcamp certificates',
    permissions: ['bootcamp']
  },
  { 
    id: 'bvoc_admin', 
    name: 'BVOC Admin', 
    description: 'Access only to BVOC certificates',
    permissions: ['bvoc']
  },
  { 
    id: 'custom', 
    name: 'Custom Role', 
    description: 'Customized access to specific categories',
    permissions: []
  }
];

export default function ProfilePage() {
  const router = useRouter();
  
  // Profile States
  // const [profile, setProfile] = useState(FIXED_ADMIN_DATA);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // const [editedProfile, setEditedProfile] = useState(FIXED_ADMIN_DATA);
  
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
  
  // Admin Management States
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'admins'
  const [admins, setAdmins] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'code4bharat_admin', // Default to Code4Bharat admin
    permissions: [],
    customPermissions: []
  });
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  
  
  // Check if current admin is super admin
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    loadProfile();
    
    // Check if current admin is super admin with admin management permissions
    const adminData = sessionStorage.getItem('adminData');
    if (adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        if (parsedData.role === 'Super Admin' || parsedData.permissions?.includes('admin_management')) {
          setIsSuperAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    }
  }, []);

  useEffect(() => {
    // When role changes, update permissions
    if (newAdmin.role === 'custom') {
      // Keep custom permissions as is
    } else {
      const selectedRole = AVAILABLE_ROLES.find(r => r.id === newAdmin.role);
      if (selectedRole) {
        setNewAdmin(prev => ({
          ...prev,
          permissions: selectedRole.permissions,
          customPermissions: selectedRole.permissions
        }));
      }
    }
  }, [newAdmin.role]);

  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('authToken') : null;
    return { 'Authorization': `Bearer ${token}` };
  };

  // Load Profile
  const loadProfile = () => {
    setLoading(true);
    ProfilePage
    
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
        // setProfile(FIXED_ADMIN_DATA);
        // setEditedProfile(FIXED_ADMIN_DATA);
        // sessionStorage.setItem('adminData', JSON.stringify(FIXED_ADMIN_DATA));
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
    
    // If super admin, load the list of admins
    if (isSuperAdmin) {
      loadAdmins();
    }
  };

  // Load Admins
  const loadAdmins = async () => {
    setLoadingAdmins(true);
    
    // For demo, we'll create some sample admins - in a real app, you'd fetch from backend
    const sampleAdmins = [
      {
        id: '1',
        name: 'Abhishek Sharma',
        email: 'abhishek@code4bharat.com',
        phone: '9876543210',
        role: 'code4bharat_admin',
        permissions: ['code4bharat'],
        status: 'active',
        lastLogin: '2025-10-25T10:30:00.000Z'
      },
      {
        id: '2',
        name: 'Priya Patel',
        email: 'priya@marketingjunction.com',
        phone: '9876543211',
        role: 'marketing_junction_admin',
        permissions: ['marketing-junction'],
        status: 'active',
        lastLogin: '2025-10-24T11:45:00.000Z'
      },
      {
        id: '3',
        name: 'Raj Kumar',
        email: 'raj@nexcorealliance.com',
        phone: '9876543212',
        role: 'admin',
        permissions: ['marketing-junction', 'code4bharat', 'bootcamp', 'bvoc', 'fsd', 'hr'],
        status: 'inactive',
        lastLogin: '2025-10-20T09:15:00.000Z'
      }
    ];
    
    try {
      // In a real app, you'd fetch from backend
      // const response = await axios.get(`${API_URL}/api/admins`, {
      //   headers: getAuthHeaders()
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAdmins(sampleAdmins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoadingAdmins(false);
    }
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
  
  // Add New Admin
  const handleAddAdmin = async () => {
    // Validation
    if (!newAdmin.name.trim() || !newAdmin.email.trim() || !newAdmin.phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!newAdmin.email.includes('@') || !newAdmin.email.includes('.')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newAdmin.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    // For custom role, use customPermissions
    const permissions = newAdmin.role === 'custom' ? newAdmin.customPermissions : 
      AVAILABLE_ROLES.find(r => r.id === newAdmin.role)?.permissions || [];
    
    if (permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }
    
    // Create the new admin
    const adminData = {
      id: Date.now().toString(), // Temporary ID for demo
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: newAdmin.role,
      permissions: permissions,
      status: 'active',
      lastLogin: null
    };
    
    try {
      // In a real app, you'd send to backend
      // const response = await axios.post(`${API_URL}/api/admins`, adminData, {
      //   headers: getAuthHeaders()
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Add to local state
      setAdmins(prev => [adminData, ...prev]);
      
      toast.success('New admin created successfully!');
      setShowAddAdmin(false);
      
      // Reset form
      setNewAdmin({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'code4bharat_admin',
        permissions: [],
        customPermissions: []
      });
      
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error('Failed to create new admin');
    }
  };
  
  // Delete Admin
  const handleDeleteAdmin = async (adminId) => {
    try {
      // In a real app, you'd send to backend
      // await axios.delete(`${API_URL}/api/admins/${adminId}`, {
      //   headers: getAuthHeaders()
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Update local state
      setAdmins(prev => prev.filter(a => a.id !== adminId));
      
      toast.success('Admin deleted successfully!');
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to delete admin');
    } finally {
      setShowDeleteConfirm(null);
    }
  };
  
  // Toggle admin status
  const toggleAdminStatus = async (adminId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      // In a real app, you'd send to backend
      // await axios.patch(`${API_URL}/api/admins/${adminId}/status`, { status: newStatus }, {
      //   headers: getAuthHeaders()
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400));
      
      // Update local state
      setAdmins(prev => prev.map(a => a.id === adminId ? { ...a, status: newStatus } : a));
      
      toast.success(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating admin status:', error);
      toast.error('Failed to update admin status');
    }
  };

  // Filter admins by search term
  const filteredAdmins = adminSearchTerm.trim() 
    ? admins.filter(admin => 
        admin.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
        admin.phone.includes(adminSearchTerm)
      )
    : admins;

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
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-6 md:mb-8">
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
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Manage your account settings and admin users</p>
            </div>

            <div className="flex gap-3">
              {activeTab === 'profile' && !editMode && (
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
              )}
              
              {activeTab === 'admins' && isSuperAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddAdmin(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  Add New Admin
                </motion.button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs - Only show if super admin */}
        {isSuperAdmin && (
          <div className="bg-white rounded-2xl shadow-md mb-8 p-1">
            <div className="flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  My Profile
                </div>
              </button>
              
              <button
                onClick={() => {
                  setActiveTab('admins');
                  if (admins.length === 0) {
                    loadAdmins();
                  }
                }}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all ${
                  activeTab === 'admins'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-5 h-5" />
                  Manage Admins
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' ? (
            // Profile Tab
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Left Column - Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-1"
              >
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center lg:sticky lg:top-6">
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
            </motion.div>
          ) : (
            // Admins Tab
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-blue-600" />
                    Admin Management
                  </h3>
                  
                  {/* Search Input */}
                  <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text"
                      value={adminSearchTerm}
                      onChange={e => setAdminSearchTerm(e.target.value)}
                      placeholder="Search admins..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none"
                    />
                    {adminSearchTerm && (
                      <button
                        onClick={() => setAdminSearchTerm('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
                
                {loadingAdmins ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading admin users...</p>
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h4 className="text-xl font-bold text-gray-800 mb-2">No Admin Users Found</h4>
                    <p className="text-gray-600 mb-6">
                      {adminSearchTerm ? "No admins match your search criteria." : "There are no admins in the system yet."}
                    </p>
                    {adminSearchTerm && (
                      <button 
                        onClick={() => setAdminSearchTerm('')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Filter className="w-4 h-4" />
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Admin Count Summary */}
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold">{filteredAdmins.length}</span> of {admins.length} admin users
                      </p>
                      {adminSearchTerm && (
                        <button
                          onClick={() => setAdminSearchTerm('')}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  
                    {/* Admin List */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Admin</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Last Login</th>
                            <th className="py-3 px-4 text-right text-sm font-semibold text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdmins.map((admin, index) => (
                            <motion.tr 
                              key={admin.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                                    {admin.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900">{admin.name}</div>
                                    <div className="text-sm text-gray-600">{admin.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {AVAILABLE_ROLES.find(r => r.id === admin.role)?.name || admin.role}
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  {admin.permissions.length} permission{admin.permissions.length !== 1 ? 's' : ''}
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2 h-2 rounded-full ${
                                    admin.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                  }`}></div>
                                  <span className={`text-sm font-medium ${
                                    admin.status === 'active' ? 'text-green-700' : 'text-gray-600'
                                  }`}>
                                    {admin.status === 'active' ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => toggleAdminStatus(admin.id, admin.status)}
                                    className={`p-2 rounded-lg text-xs font-medium ${
                                      admin.status === 'active'
                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                    }`}
                                  >
                                    {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(admin.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )
        }
</AnimatePresence>
        {/* Change Password Modal */}
        <AnimatePresence>
          {showChangePassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowChangePassword(false)}
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
        
        
        {/* Add New Admin Modal */}
        <AnimatePresence>
          {showAddAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddAdmin(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 shadow-2xl max-w-3xl w-full relative max-h-[90vh] overflow-y-auto"
              >
                <button
                  onClick={() => setShowAddAdmin(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-emerald-100 rounded-full mb-4">
                    <UserPlus className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Admin</h2>
                  <p className="text-gray-600">Create a new admin user with specific permissions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="example@company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={newAdmin.phone}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    
                    {/* Password Fields */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={newAdmin.confirmPassword}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>
                  
                  {/* Role & Permissions */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Admin Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newAdmin.role}
                        onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      >
                        {AVAILABLE_ROLES.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Role Description
                      </label>
                      <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 text-sm">
                        {AVAILABLE_ROLES.find(r => r.id === newAdmin.role)?.description || ''}
                      </div>
                    </div>
                    
                    {/* Permissions */}
                    {newAdmin.role === 'custom' && (
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Custom Permissions <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2 border-2 border-gray-200 rounded-xl p-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="perm-marketing-junction"
                              checked={newAdmin.customPermissions.includes('marketing-junction')}
                              onChange={(e) => {
                                const perms = [...newAdmin.customPermissions];
                                if (e.target.checked) {
                                  perms.push('marketing-junction');
                                } else {
                                  const index = perms.indexOf('marketing-junction');
                                  if (index !== -1) perms.splice(index, 1);
                                }
                                setNewAdmin(prev => ({ ...prev, customPermissions: perms }));
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="perm-marketing-junction" className="ml-2 text-sm text-gray-700">
                              Marketing Junction
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="perm-code4bharat"
                              checked={newAdmin.customPermissions.includes('code4bharat')}
                              onChange={(e) => {
                                const perms = [...newAdmin.customPermissions];
                                if (e.target.checked) {
                                  perms.push('code4bharat');
                                } else {
                                  const index = perms.indexOf('code4bharat');
                                  if (index !== -1) perms.splice(index, 1);
                                }
                                setNewAdmin(prev => ({ ...prev, customPermissions: perms }));
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="perm-code4bharat" className="ml-2 text-sm text-gray-700">
                              Code4Bharat
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="perm-bootcamp"
                              checked={newAdmin.customPermissions.includes('bootcamp')}
                              onChange={(e) => {
                                const perms = [...newAdmin.customPermissions];
                                if (e.target.checked) {
                                  perms.push('bootcamp');
                                } else {
                                  const index = perms.indexOf('bootcamp');
                                  if (index !== -1) perms.splice(index, 1);
                                }
                                setNewAdmin(prev => ({ ...prev, customPermissions: perms }));
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="perm-bootcamp" className="ml-2 text-sm text-gray-700">
                              Bootcamp
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="perm-bvoc"
                              checked={newAdmin.customPermissions.includes('bvoc')}
                              onChange={(e) => {
                                const perms = [...newAdmin.customPermissions];
                                if (e.target.checked) {
                                  perms.push('bvoc');
                                } else {
                                  const index = perms.indexOf('bvoc');
                                  if (index !== -1) perms.splice(index, 1);
                                }
                                setNewAdmin(prev => ({ ...prev, customPermissions: perms }));
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="perm-bvoc" className="ml-2 text-sm text-gray-700">
                              BVOC
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="perm-fsd"
                              checked={newAdmin.customPermissions.includes('fsd')}
                              onChange={(e) => {
                                const perms = [...newAdmin.customPermissions];
                                if (e.target.checked) {
                                  perms.push('fsd');
                                } else {
                                  const index = perms.indexOf('fsd');
                                  if (index !== -1) perms.splice(index, 1);
                                }
                                setNewAdmin(prev => ({ ...prev, customPermissions: perms }));
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="perm-fsd" className="ml-2 text-sm text-gray-700">
                              FSD
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="perm-hr"
                              checked={newAdmin.customPermissions.includes('hr')}
                              onChange={(e) => {
                                const perms = [...newAdmin.customPermissions];
                                if (e.target.checked) {
                                  perms.push('hr');
                                } else {
                                  const index = perms.indexOf('hr');
                                  if (index !== -1) perms.splice(index, 1);
                                }
                                setNewAdmin(prev => ({ ...prev, customPermissions: perms }));
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="perm-hr" className="ml-2 text-sm text-gray-700">
                              HR
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="perm-admin_management"
                              checked={newAdmin.customPermissions.includes('admin_management')}
                              onChange={(e) => {
                                const perms = [...newAdmin.customPermissions];
                                if (e.target.checked) {
                                  perms.push('admin_management');
                                } else {
                                  const index = perms.indexOf('admin_management');
                                  if (index !== -1) perms.splice(index, 1);
                                }
                                setNewAdmin(prev => ({ ...prev, customPermissions: perms }));
                              }}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label htmlFor="perm-admin_management" className="ml-2 text-sm text-gray-700">
                              Admin Management
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddAdmin}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      Create Admin
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddAdmin(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Delete Admin Confirmation */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Delete Admin User?</h2>
                  <p className="text-gray-600">
                    This action cannot be undone. The admin user will be permanently removed from the system.
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Cancel
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeleteAdmin(showDeleteConfirm)}
                    className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-all"
                  >
                    Delete
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