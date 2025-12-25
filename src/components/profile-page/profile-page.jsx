"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  Shield,
  Key,
  LogOut,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Home,
  Lock,
  Eye,
  EyeOff,
  Plus,
  UserPlus,
  Trash2,
  Search,
  Users,
  ChevronDown,
  Filter,
  Settings,
  PlusCircle,
  Bell,
  Award,
  Clock,
  Activity,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

// Fixed Admin Data - THIS IS THE SUPER ADMIN (MAIN ADMIN)
const FIXED_ADMIN_DATA = {
  name: "Super Admin",
  email: "hr@nexcorealliance.com",
  phone: "9892398976",
  whatsappNumber: "9892398976",
  organization: "Nexcore Alliance & Code 4 Bharat",
  designation: "HR Manager",
  location: "Mumbai, India",
  role: "Super Admin",
  adminType: "main",
  permissions: [
    "marketing-junction",
    "IT-Nexcore",
    "bootcamp",
    "bvoc",
    "fsd",
    "hr",
    "admin_management",
  ],
  joinedDate: "2024-01-01T00:00:00.000Z",
  profileImage: "",
};

// Available roles with their access permissions
// ✅ FIXED: Role IDs now match backend exactly
const AVAILABLE_ROLES = [
  {
    id: "superadmin",
    name: "Super Admin",
    description: "Full access to all features and categories",
    permissions: [
      "it-nexcore",
      "marketing-junction",
      "dm",
      "fsd",
      "hr",
      "bootcamp",
      "bvoc",
      "operations",
      "client",
      "admin_management",
    ],
    color: "from-purple-600 to-pink-600",
  },
  {
    id: "admin",
    name: "Admin",
    description: "Full access including admin management",
    permissions: [
      "it-nexcore",
      "marketing-junction",
      "dm",
      "fsd",
      "hr",
      "bootcamp",
      "bvoc",
      "operations",
      "client",
      "admin_management",
    ],
    color: "from-blue-600 to-indigo-600",
  },
  {
    id: "it_nexcore_admin",
    name: "IT-Nexcore / Code4Bharat Admin",
    description: "Access to IT-Nexcore, Code4Bharat, and FSD certificates",
    permissions: ["it-nexcore", "fsd"],
    color: "from-green-600 to-emerald-600",
  },
  {
    id: "marketing_junction_admin", // ✅ Matches backend
    name: "Marketing Junction Admin",
    description: "Access to Marketing Junction and Digital Marketing",
    permissions: ["marketing-junction", "dm"],
    color: "from-orange-600 to-red-600",
  },
  {
    id: "fsd_admin", // ✅ Matches backend
    name: "FSD Admin",
    description: "Access to FSD and IT-Nexcore certificates",
    permissions: ["fsd", "it-nexcore"], // ✅ Shares access with IT-Nexcore
    color: "from-cyan-600 to-blue-600",
  },
  {
    id: "hr_admin",
    name: "HR Admin",
    description: "Access only to HR certificates",
    permissions: ["hr"],
    color: "from-pink-600 to-rose-600",
  },
  {
    id: "bootcamp_admin",
    name: "Bootcamp Admin",
    description: "Access only to Bootcamp certificates",
    permissions: ["bootcamp"],
    color: "from-violet-600 to-purple-600",
  },
  {
    id: "bvoc_admin",
    name: "BVOC Admin",
    description: "Access only to BVOC certificates",
    permissions: ["bvoc"],
    color: "from-teal-600 to-cyan-600",
  },
  {
    id: "dm_admin", // ✅ Added
    name: "Digital Marketing Admin",
    description: "Access to Digital Marketing and Marketing Junction",
    permissions: ["dm", "marketing-junction"],
    color: "from-cyan-600 to-blue-600",
  },
  {
    id: "operations_admin",
    name: "Operations Admin",
    description: "Access only to Operations certificates",
    permissions: ["operations"],
    color: "from-gray-600 to-slate-600",
  },
  {
    id: "client_admin",
    name: "Client Admin",
    description: "Access only to Client documents",
    permissions: ["client"],
    color: "from-teal-600 to-emerald-600",
  },
];

// Permission badges
const PERMISSION_CONFIG = {
  "marketing-junction": {
    label: "Marketing Junction / DM",
    color: "bg-orange-100 text-orange-700 border-orange-200",
  },
  "IT-Nexcore": {
    label: "Code4Bharat / IT-Nexcore",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  bootcamp: {
    label: "Bootcamp",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  bvoc: {
    label: "BVOC",
    color: "bg-teal-100 text-teal-700 border-teal-200",
  },
  fsd: {
    label: "FSD",
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
  },
  hr: {
    label: "HR",
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
  operations: {
    label: "Operations",
    color: "bg-gray-100 text-gray-700 border-gray-200",
  },
  admin_management: {
    label: "Admin Management",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
};

export default function ProfilePage() {
  const router = useRouter();

  // Profile States
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

  // Change Password States
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile Image Upload
  const [uploadingImage, setUploadingImage] = useState(false);

  // Admin Management States
  const [activeTab, setActiveTab] = useState("profile");
  const [admins, setAdmins] = useState([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    whatsappNumber: "",
    password: "",
    confirmPassword: "",
    role: "",
    permissions: [],
    customPermissions: [],
  });
  const [adminSearchTerm, setAdminSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  // Check if current admin is main admin (Super Admin)
  const [isMainAdmin, setIsMainAdmin] = useState(false);

  useEffect(() => {
    loadProfile();

    const adminData = sessionStorage.getItem("adminData");
    if (adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        if (
          parsedData.email === "hr@nexcorealliance.com" ||
          parsedData.adminType === "main" ||
          parsedData.role === "Super Admin" ||
          parsedData.role === "Main Admin" ||
          parsedData.permissions?.includes("admin_management")
        ) {
          setIsMainAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
      }
    } else {
      setIsMainAdmin(true);
    }
  }, []);

  const getAvailableRoles = () => {
    const currentRole = profile?.role;
    const currentPermissions = profile?.permissions || [];

    // Only admins with admin_management permission can see role options
    if (!currentPermissions.includes("admin_management")) {
      return [];
    }

    if (currentRole === "superadmin") {
      return AVAILABLE_ROLES; // Can create any role
    } else if (currentRole === "admin") {
      // Admins cannot create superadmins or other admins
      return AVAILABLE_ROLES.filter(
        (r) => r.id !== "superadmin" && r.id !== "admin"
      );
    } else {
      // Other roles cannot create any admins
      return [];
    }
  };

  useEffect(() => {
    if (!newAdmin.role) return; // Prevent running on empty role

    if (newAdmin.role === "custom") {
      // Keep custom permissions as is
    } else {
      const selectedRole = AVAILABLE_ROLES.find((r) => r.id === newAdmin.role);
      if (selectedRole) {
        setNewAdmin((prev) => ({
          ...prev, // Keep all previous values first
          permissions: [...selectedRole.permissions], // Then update permissions
          customPermissions: [...selectedRole.permissions],
        }));
      }
    }
  }, [newAdmin.role]);

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("authToken")
        : null;
    return { Authorization: `Bearer ${token}` };
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const profileData = response.data.data;
        setProfile(profileData);
        setEditedProfile(profileData);

        // Store updated profile data
        sessionStorage.setItem("adminData", JSON.stringify(profileData));

        // Check if user has admin management permission
        const hasAdminManagement =
          profileData.permissions?.includes("admin_management");
        setIsMainAdmin(hasAdminManagement);
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Profile load error:", error);

      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.clear();
        router.push("/login");
      } else if (error.response?.status === 404) {
        toast.error("Profile not found");
      } else {
        toast.error(error.response?.data?.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const response = await axios.get(`${API_URL}/api/admin/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAdmins(response.data.data);
      } else {
        toast.error("Failed to load admins");
      }
    } catch (error) {
      console.error("Load admins error:", error);

      if (error.response?.status === 403) {
        toast.error("You don't have permission to view admin list");
        setActiveTab("profile"); // Switch back to profile tab
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.clear();
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to load admins");
      }
    } finally {
      setLoadingAdmins(false);
    }
  };
  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = sessionStorage.getItem("authToken");

      const response = await axios.put(
        `${API_URL}/api/admin/profile`,
        editedProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProfile(response.data.data);
        setEditMode(false);

        if (response.data.newToken) {
          sessionStorage.setItem("authToken", response.data.newToken);
        }

        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      setUploadingImage(true);
      const token = sessionStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/admin/profile/image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);
        setEditedProfile(response.data.data);
        toast.success("Profile image updated!");
      }
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/admin/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Password updated");
        setShowChangePassword(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleResetToDefault = async () => {
    if (!confirm("Reset profile to default?")) return;

    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.post(
        `${API_URL}/api/admin/profile/reset`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        loadProfile();
        toast.success("Reset to default C4B profile!");
      }
    } catch (err) {
      toast.error("Reset failed");
    }
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    toast.success("Logged out successfully");
    setTimeout(() => router.push("/login"), 500);
  };

  const handleAddAdmin = async () => {
    try {
      // ✅ Validation
      if (
        !newAdmin.username ||
        !newAdmin.name ||
        !newAdmin.email ||
        !newAdmin.phone ||
        !newAdmin.password ||
        !newAdmin.role
      ) {
        toast.error("Please fill all required fields");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newAdmin.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Password validation
      if (newAdmin.password !== newAdmin.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (newAdmin.password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      // Phone validation
      if (newAdmin.phone.length < 10) {
        toast.error("Please enter a valid phone number");
        return;
      }

      const token = sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      const permissions =
        newAdmin.role === "custom"
          ? newAdmin.customPermissions
          : AVAILABLE_ROLES.find((r) => r.id === newAdmin.role)?.permissions ||
            [];

      const response = await axios.post(
        `${API_URL}/api/admin/admins`,
        {
          username: newAdmin.username,
          name: newAdmin.name,
          email: newAdmin.email,
          phone: newAdmin.phone,
          whatsappNumber: newAdmin.whatsappNumber || newAdmin.phone,
          password: newAdmin.password,
          role: newAdmin.role,
          permissions,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAdmins((prev) => [response.data.data, ...prev]);

        // ✅ Reset form completely
        setNewAdmin({
          username: "",
          name: "",
          email: "",
          phone: "",
          whatsappNumber: "",
          password: "",
          confirmPassword: "",
          role: "",
          permissions: [],
          customPermissions: [],
        });

        setShowAddAdmin(false);
        toast.success("Admin created successfully");
      }
    } catch (error) {
      console.error("Create admin error:", error);

      if (error.response?.status === 403) {
        toast.error(
          error.response?.data?.message ||
            "You don't have permission to create admins"
        );
      } else if (error.response?.status === 409) {
        toast.error(
          error.response?.data?.message || "Username or email already exists"
        );
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.clear();
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to create admin");
      }
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    try {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      await axios.delete(`${API_URL}/api/admin/admins/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAdmins((prev) =>
        prev.filter((a) => a._id !== adminId && a.id !== adminId)
      );
      toast.success("Admin deleted successfully");
    } catch (error) {
      console.error("Delete admin error:", error);

      if (error.response?.status === 403) {
        toast.error(
          error.response?.data?.message ||
            "You don't have permission to delete this admin"
        );
      } else if (error.response?.status === 404) {
        toast.error("Admin not found");
      } else if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        sessionStorage.clear();
        router.push("/login");
      } else {
        toast.error(error.response?.data?.message || "Failed to delete admin");
      }
    }
  };

  const toggleAdminStatus = async (adminId, currentStatus) => {
    try {
      const token = sessionStorage.getItem("authToken");

      const response = await axios.put(
        `${API_URL}/api/admin/${adminId}/status`,
        { status: currentStatus === "active" ? "inactive" : "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setAdmins((prev) =>
          prev.map((a) => (a.id === adminId ? response.data.data : a))
        );
        toast.success("Status updated");
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredAdmins = adminSearchTerm.trim()
    ? admins.filter(
        (admin) =>
          admin.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
          admin.email.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
          admin.phone.includes(adminSearchTerm)
      )
    : admins;

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-blue-400/20 animate-ping"></div>
          </div>
          <p className="text-gray-700 font-semibold text-lg">
            Loading your profile...
          </p>
          <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 p-4 md:p-6">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#363636",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          },
          success: {
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            {/* Left side - Navigation */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm font-medium bg-white dark:bg-gray-800 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </motion.button>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex gap-3">
              {activeTab === "profile" && !editMode && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleResetToDefault}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Reset</span>
                  </motion.button>
                </>
              )}

              {activeTab === "admins" && isMainAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddAdmin(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Admin</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Enhanced Title Section with Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your account settings and system administration
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4" />
                    <span className="text-xs font-medium opacity-90">
                      Status
                    </span>
                  </div>
                  <p className="text-lg font-bold">Active</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium opacity-90">Role</span>
                  </div>
                  <p className="text-lg font-bold">{profile.role}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Tabs */}
        {isMainAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-lg p-2 mb-8 inline-flex border border-gray-200 dark:border-gray-700"
          >
            <button
              onClick={() => setActiveTab("profile")}
              className={`relative py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "profile"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {activeTab === "profile" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative flex items-center gap-2">
                <User className="w-4 h-4" />
                My Profile
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab("admins");
                if (admins.length === 0) {
                  loadAdmins();
                }
              }}
              className={`relative py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                activeTab === "admins"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              {activeTab === "admins" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative flex items-center gap-2">
                <Users className="w-4 h-4" />
                Manage Admins
              </div>
            </button>
          </motion.div>
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" ? (
            // Enhanced Profile Tab
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid lg:grid-cols-3 gap-6"
            >
              {/* Enhanced Left Column - Profile Card */}
              <motion.div
                className="lg:col-span-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-6">
                  {/* Profile Image with Gradient Border */}
                  <div className="text-center mb-6">
                    <div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full p-1">
                        <div className="bg-white dark:bg-gray-800 rounded-full p-1 flex items-center justify-center">
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden relative shadow-2xl">
                            {uploadingImage && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 backdrop-blur-sm">
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
                              <div className="relative">
                                {profile.name?.charAt(0)?.toUpperCase() || "A"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Camera badge */}
                      <label className="absolute -bottom-1 -right-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full p-2 cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 border-4 border-white dark:border-gray-800 shadow-lg group">
                        <Camera className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <motion.h2
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1"
                    >
                      {profile.name}
                    </motion.h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {profile.designation}
                    </p>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold border-2 border-blue-200 dark:border-blue-700 shadow-sm"
                    >
                      <Award className="w-3 h-3 inline mr-1" />
                      {profile.role}
                    </motion.div>
                  </div>

                  {/* Enhanced Quick Info */}
                  <div className="space-y-3 mb-6">
                    {[
                      {
                        icon: Mail,
                        label: "Email",
                        value: profile.email,
                        truncate: true,
                      },
                      { icon: Phone, label: "Phone", value: profile.phone },
                      {
                        icon: MapPin,
                        label: "Location",
                        value: profile.location,
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        whileHover={{ x: 5 }}
                        className="flex items-start justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-700/50 rounded-xl text-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {item.label}
                          </span>
                        </div>
                        <span
                          className={`text-gray-900 dark:text-gray-100 font-semibold text-right ${
                            item.truncate ? "max-w-[60%] truncate" : ""
                          }`}
                        >
                          {item.value}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowChangePassword(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300"
                    >
                      <Key className="w-4 h-4" />
                      Change Password
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Right Column - Profile Information */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      Profile Information
                    </h3>

                    {!editMode && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </motion.div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        Full Name
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedProfile.name || ""}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-semibold">
                          {profile.name}
                        </div>
                      )}
                    </motion.div>

                    {/* Email */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        Email Address
                      </label>
                      {editMode ? (
                        <input
                          type="email"
                          value={editedProfile.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-medium">
                          {profile.email}
                        </div>
                      )}
                    </motion.div>

                    {/* Phone */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        Phone Number
                      </label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={editedProfile.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-medium">
                          {profile.phone}
                        </div>
                      )}
                    </motion.div>

                    {/* WhatsApp Number */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        <FaWhatsapp className="w-3.5 h-3.5 text-green-600" />
                        WhatsApp Number
                      </label>
                      {editMode ? (
                        <input
                          type="tel"
                          value={editedProfile.whatsappNumber || ""}
                          onChange={(e) =>
                            handleInputChange("whatsappNumber", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-medium">
                          {profile.whatsappNumber}
                        </div>
                      )}
                    </motion.div>

                    {/* Organization */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="md:col-span-2"
                    >
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        Organization
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedProfile.organization || ""}
                          onChange={(e) =>
                            handleInputChange("organization", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-medium">
                          {profile.organization}
                        </div>
                      )}
                    </motion.div>

                    {/* Designation */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 }}
                    >
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        <Shield className="w-3.5 h-3.5 text-blue-600" />
                        Designation
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedProfile.designation || ""}
                          onChange={(e) =>
                            handleInputChange("designation", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-medium">
                          {profile.designation}
                        </div>
                      )}
                    </motion.div>

                    {/* Location */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        Location
                      </label>
                      {editMode ? (
                        <input
                          type="text"
                          value={editedProfile.location || ""}
                          onChange={(e) =>
                            handleInputChange("location", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium transition-all duration-300"
                        />
                      ) : (
                        <div className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600 text-sm font-medium">
                          {profile.location}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Enhanced Save/Cancel Buttons */}
                  {editMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 pt-6 mt-6 border-t-2 border-gray-200 dark:border-gray-700"
                    >
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setEditMode(false);
                          setEditedProfile(profile);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300"
                      >
                        <X className="w-5 h-5" />
                        Cancel
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : (
            // Admins Tab - Continuing with rest of the component...
            <motion.div
              key="admins"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="bg-white dark:bg-gray-800 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Admin Management
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {admins.length} total administrators
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Search Input */}
                  <div className="relative w-full md:max-w-sm">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={adminSearchTerm}
                      onChange={(e) => setAdminSearchTerm(e.target.value)}
                      placeholder="Search by name, email or phone..."
                      className="w-full pl-12 pr-4 py-3 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all duration-300"
                    />
                    {adminSearchTerm && (
                      <button
                        onClick={() => setAdminSearchTerm("")}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {loadingAdmins ? (
                  <div className="text-center py-20">
                    <div className="relative inline-block">
                      <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
                      <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-blue-400/20 animate-ping"></div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                      Loading administrators...
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Please wait a moment
                    </p>
                  </div>
                ) : filteredAdmins.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
                  >
                    <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-4">
                      <Users className="w-16 h-16 text-gray-400" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                      No Admin Users Found
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm max-w-md mx-auto">
                      {adminSearchTerm
                        ? "No admins match your search criteria. Try different keywords."
                        : "There are no administrators in the system yet. Add one to get started."}
                    </p>
                    {adminSearchTerm && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAdminSearchTerm("")}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Filter className="w-4 h-4" />
                        Clear Search
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <>
                    {/* Admin Count Summary */}
                    <div className="mb-4 flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Showing{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {filteredAdmins.length}
                        </span>{" "}
                        of{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-bold">
                          {admins.length}
                        </span>{" "}
                        administrators
                      </p>
                      {adminSearchTerm && (
                        <button
                          onClick={() => setAdminSearchTerm("")}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Clear search
                        </button>
                      )}
                    </div>

                    {/* Enhanced Admin Cards for Mobile, Table for Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                            <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Admin
                            </th>
                            <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Role & Permissions
                            </th>
                            <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="py-4 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Last Activity
                            </th>
                            <th className="py-4 px-4 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAdmins.map((admin, index) => {
                            const roleInfo = AVAILABLE_ROLES.find(
                              (r) => r.id === admin.role
                            );
                            return (
                              <motion.tr
                                key={admin.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-300"
                              >
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                                        roleInfo?.color ||
                                        "from-gray-600 to-gray-700"
                                      } flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                                    >
                                      {admin.name.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900 dark:text-gray-100 text-sm">
                                        {admin.name}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {admin.email}
                                      </div>
                                      <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                        <Phone className="w-3 h-3" />
                                        {admin.phone}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div
                                    className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${
                                      roleInfo?.color ||
                                      "from-gray-600 to-gray-700"
                                    } text-white shadow-md mb-2`}
                                  >
                                    {roleInfo?.name || admin.role}
                                  </div>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {(admin.permissions || [])
                                      .slice(0, 3)
                                      .map((perm) => {
                                        const permConfig =
                                          PERMISSION_CONFIG[perm];
                                        return (
                                          <span
                                            key={perm}
                                            className={`inline-block px-2 py-0.5 text-xs border rounded ${
                                              permConfig?.color ||
                                              "bg-gray-100 text-gray-600 border-gray-200"
                                            }`}
                                          >
                                            {permConfig?.label || perm}
                                          </span>
                                        );
                                      })}

                                    {(admin.permissions || []).length > 3 && (
                                      <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                        +{(admin.permissions || []).length - 3}{" "}
                                        more
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-2.5 h-2.5 rounded-full ${
                                        admin.status === "active"
                                          ? "bg-green-500"
                                          : "bg-gray-400"
                                      }`}
                                    ></div>
                                    <span
                                      className={`text-xs font-bold uppercase tracking-wide ${
                                        admin.status === "active"
                                          ? "text-green-700 dark:text-green-400"
                                          : "text-gray-600 dark:text-gray-400"
                                      }`}
                                    >
                                      {admin.status}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4">
                                  <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {admin.lastLogin ? (
                                      <>
                                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                                          {new Date(
                                            admin.lastLogin
                                          ).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                          {new Date(
                                            admin.lastLogin
                                          ).toLocaleTimeString()}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-gray-400 italic">
                                        Never logged in
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        toggleAdminStatus(
                                          admin.id,
                                          admin.status
                                        )
                                      }
                                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                        admin.status === "active"
                                          ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600"
                                          : "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800 border border-emerald-300 dark:border-emerald-700"
                                      }`}
                                    >
                                      {admin.status === "active"
                                        ? "Deactivate"
                                        : "Activate"}
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() =>
                                        setShowDeleteConfirm(admin.id)
                                      }
                                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </motion.button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View - Cards */}
                    <div className="md:hidden space-y-4">
                      {filteredAdmins.map((admin, index) => {
                        const roleInfo = AVAILABLE_ROLES.find(
                          (r) => r.id === admin.role
                        );
                        return (
                          <motion.div
                            key={admin.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-300"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div
                                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                                  roleInfo?.color || "from-gray-600 to-gray-700"
                                } flex items-center justify-center text-white text-lg font-bold shadow-lg flex-shrink-0`}
                              >
                                {admin.name.charAt(0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate">
                                  {admin.name}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {admin.email}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {admin.phone}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    admin.status === "active"
                                      ? "bg-green-500"
                                      : "bg-gray-400"
                                  }`}
                                ></div>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div
                                className={`inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r ${
                                  roleInfo?.color || "from-gray-600 to-gray-700"
                                } text-white shadow-md mb-2`}
                              >
                                {roleInfo?.name || admin.role}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {admin.permissions.slice(0, 2).map((perm) => {
                                  const permConfig = PERMISSION_CONFIG[perm];
                                  return (
                                    <span
                                      key={perm}
                                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-medium border ${
                                        permConfig?.color ||
                                        "bg-gray-100 text-gray-700 border-gray-200"
                                      }`}
                                    >
                                      {permConfig?.label || perm}
                                    </span>
                                  );
                                })}
                                {admin.permissions.length > 2 && (
                                  <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                    +{admin.permissions.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  toggleAdminStatus(admin.id, admin.status)
                                }
                                className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                                  admin.status === "active"
                                    ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                                    : "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700"
                                }`}
                              >
                                {admin.status === "active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                              <button
                                onClick={() => setShowDeleteConfirm(admin.id)}
                                className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors border border-red-200 dark:border-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Change Password Modal */}
        <AnimatePresence>
          {showChangePassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setShowChangePassword(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full border-2 border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Change Password
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Keep your account secure
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm pr-12 font-medium transition-all"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            current: !prev.current,
                          }))
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm pr-12 font-medium transition-all"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            new: !prev.new,
                          }))
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Minimum 6 characters required
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none text-sm pr-12 font-medium transition-all"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswords((prev) => ({
                            ...prev,
                            confirm: !prev.confirm,
                          }))
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleChangePassword}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 mt-2"
                  >
                    Update Password
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Add New Admin Modal */}
        <AnimatePresence>
          {showAddAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setShowAddAdmin(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg">
                      <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Add New Administrator
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Create a new admin account with custom permissions
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddAdmin(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Personal Information Section */}
                  <div className="md:col-span-2 mb-2">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-emerald-600" />
                      Personal Information
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAdmin.username}
                      onChange={(e) =>
                        setNewAdmin((prev) => ({
                          ...prev,
                          username: e.target.value
                            .toLowerCase()
                            .replace(/\s/g, ""),
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium transition-all"
                      placeholder="johndoe123"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Used for login. Lowercase, no spaces. Auto-formatted.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAdmin.name}
                      onChange={(e) =>
                        setNewAdmin((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium transition-all"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newAdmin.email}
                      onChange={(e) =>
                        setNewAdmin((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={newAdmin.phone}
                      onChange={(e) =>
                        setNewAdmin((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium transition-all"
                      placeholder="+91 9876543210"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Admin Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newAdmin.role}
                      onChange={(e) =>
                        setNewAdmin((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-bold transition-all"
                    >
                      <option value="">Select a role</option>
                      {getAvailableRoles().map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {newAdmin.role && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {
                          AVAILABLE_ROLES.find((r) => r.id === newAdmin.role)
                            ?.description
                        }
                      </p>
                    )}
                  </div>

                  {/* Security Section */}
                  <div className="md:col-span-2 mt-4 mb-2">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2 mb-3">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      Security Credentials
                    </h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newAdmin.password}
                      onChange={(e) =>
                        setNewAdmin((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium transition-all"
                      placeholder="Minimum 6 characters"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={newAdmin.confirmPassword}
                      onChange={(e) =>
                        setNewAdmin((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm font-medium transition-all"
                      placeholder="Re-enter password"
                    />
                  </div>

                  {/* Permissions Preview */}
                  {newAdmin.role && newAdmin.role !== "custom" && (
                    <div className="md:col-span-2 mt-2">
                      <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-2">
                        Assigned Permissions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(
                          AVAILABLE_ROLES.find((r) => r.id === newAdmin.role)
                            ?.permissions || []
                        ).map((perm) => {
                          const permConfig = PERMISSION_CONFIG[perm];
                          return (
                            <span
                              key={perm}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                                permConfig?.color ||
                                "bg-gray-100 text-gray-700 border-gray-200"
                              }`}
                            >
                              <CheckCircle className="w-3 h-3" />
                              {permConfig?.label || perm}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddAdmin}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-5 h-5" />
                    Create Administrator
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddAdmin(false)}
                    className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3.5 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirm(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full border-2 border-gray-100 dark:border-gray-700"
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900 dark:to-red-800 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-300 dark:border-red-700"
                  >
                    <Trash2 className="w-10 h-10 text-red-600 dark:text-red-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Delete Administrator?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    This action is permanent and cannot be undone. The
                    administrator will be completely removed from the system and
                    lose all access immediately.
                  </p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 py-3 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleDeleteAdmin(showDeleteConfirm);
                      setShowDeleteConfirm(null);
                    }}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300"
                  >
                    Delete Permanently
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
