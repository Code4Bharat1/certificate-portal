"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  Code2,
  Rocket,
  GraduationCap,
  Zap,
  Users,
  AlertCircle,
  FileText,
  ArrowRight,
  Megaphone,
  Settings,
  Loader2,
} from "lucide-react";

// ============================================
// PERMISSION HELPER FUNCTIONS
// ============================================

const normalizePermission = (permission) => {
  const normalized = permission.toLowerCase().trim();
  if (["code4bharat", "c4b", "code-4-bharat"].includes(normalized)) {
    return "it-nexcore";
  }
  return normalized;
};

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return permissions.map(normalizePermission);
};

const getCrossAccessPermissions = (permission) => {
  const crossAccessMap = {
    "it-nexcore": ["fsd"],
    fsd: ["it-nexcore"],
  };
  return crossAccessMap[permission] || [];
};

const isAdmin = (permissions) => {
  const normalized = normalizePermissions(permissions);
  return (
    normalized.includes("admin") ||
    normalized.includes("super_admin") ||
    normalized.includes("admin_management")
  );
};

const getAccessiblePermissions = (userPermissions) => {
  if (!Array.isArray(userPermissions)) return [];

  const normalized = normalizePermissions(userPermissions);

  if (isAdmin(normalized)) {
    return ["all"];
  }

  const accessible = new Set(normalized);

  normalized.forEach((perm) => {
    const crossAccess = getCrossAccessPermissions(perm);
    crossAccess.forEach((ca) => accessible.add(ca));
  });

  return Array.from(accessible);
};

const canAccessCategory = (userPermissions, categoryPermission) => {
  const accessible = getAccessiblePermissions(userPermissions);

  // Admins can access everything
  if (accessible.includes("all")) return true;

  const normalizedCategory = normalizePermission(categoryPermission);

  return accessible.includes(normalizedCategory);
};
// ============================================
// COMPONENT
// ============================================

export default function CategoryOverview() {
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

  // Load permissions first
  useEffect(() => {
    const loadPermissions = () => {
      try {
        const adminData = sessionStorage.getItem("adminData");

       
        console.log("📦 Raw adminData:", adminData);

        if (adminData) {
          const data = JSON.parse(adminData);
  

          setUserPermissions(data.permissions || []);
        } else {
        
          setUserPermissions([]);
        }
      } catch (error) {
       
        setUserPermissions([]);
      } finally {
        setPermissionsLoaded(true);
      }
    };

    loadPermissions();
  }, []);

  // Load stats after permissions are loaded
  useEffect(() => {
    if (permissionsLoaded) {
      fetchStats();
    }
  }, [permissionsLoaded]);

  const fetchStats = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      setLoading(true);

      const response = await axios.get(`${API_URL}/api/stats/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.success) {
        setStats(response.data.data.categories);
      }
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const allCategories = [
    {
      title: "IT-Nexcore / Code4Bharat",
      key: "it-nexcore",
      gradient: "from-blue-600 via-indigo-600 to-blue-700",
      darkGradient: "dark:from-gray-800 dark:via-gray-900 dark:to-gray-950",
      buttonTextColor: "text-blue-700 dark:text-blue-600",
      route: "/certificates/it-nexcore",
      icon: Code2,
      permission: "it-nexcore",
    },
    {
      title: "Marketing Junction",
      key: "marketing-junction",
      gradient: "from-blue-500 via-blue-600 to-blue-700",
      darkGradient: "dark:from-gray-700 dark:via-gray-800 dark:to-gray-900",
      buttonTextColor: "text-blue-700 dark:text-blue-600",
      route: "/certificates/marketing-junction",
      icon: BarChart3,
      permission: "marketing-junction",
    },
    {
      title: "Digital Marketing",
      key: "dm",
      gradient: "from-cyan-600 via-blue-600 to-blue-700",
      darkGradient: "dark:from-gray-700 dark:via-gray-800 dark:to-gray-900",
      buttonTextColor: "text-cyan-700 dark:text-blue-600",
      route: "/certificates/dm",
      icon: Megaphone,
      permission: "dm",
    },
    {
      title: "FSD",
      key: "fsd",
      gradient: "from-blue-600 via-blue-700 to-indigo-700",
      darkGradient: "dark:from-gray-700 dark:via-gray-800 dark:to-gray-900",
      buttonTextColor: "text-blue-700 dark:text-blue-600",
      route: "/certificates/fsd",
      icon: Zap,
      permission: "fsd",
    },
    {
      title: "HR",
      key: "hr",
      gradient: "from-blue-500 via-indigo-500 to-blue-600",
      darkGradient: "dark:from-gray-800 dark:via-gray-900 dark:to-gray-950",
      buttonTextColor: "text-blue-700 dark:text-blue-600",
      route: "/certificates/hr",
      icon: Users,
      permission: "hr",
    },
    {
      title: "Bootcamp",
      key: "bootcamp",
      gradient: "from-blue-500 via-blue-600 to-indigo-600",
      darkGradient: "dark:from-gray-700 dark:via-gray-800 dark:to-gray-900",
      buttonTextColor: "text-blue-700 dark:text-blue-600",
      route: "/certificates/bootcamp",
      icon: Rocket,
      permission: "bootcamp",
    },
    {
      title: "BVOC",
      key: "bvoc",
      gradient: "from-indigo-600 via-blue-600 to-blue-700",
      darkGradient: "dark:from-gray-800 dark:via-gray-900 dark:to-gray-950",
      buttonTextColor: "text-indigo-700 dark:text-blue-600",
      route: "/certificates/bvoc",
      icon: GraduationCap,
      permission: "bvoc",
    },
    {
      title: "Operations Department",
      key: "operations",
      gradient: "from-slate-600 via-blue-600 to-blue-700",
      darkGradient: "dark:from-gray-800 dark:via-gray-900 dark:to-gray-950",
      buttonTextColor: "text-slate-700 dark:text-gray-400",
      route: "/certificates/operations",
      icon: Settings,
      permission: "operations",
    },
    {
      title: "Client",
      key: "client",
      gradient: "from-teal-600 via-emerald-600 to-teal-700",
      darkGradient: "dark:from-gray-800 dark:via-gray-900 dark:to-gray-950",
      buttonTextColor: "text-teal-700 dark:text-teal-400",
      route: "/certificates/client",
      icon: FileText,
      permission: "client",
    },
  ];

  // Filter categories using the new permission system
  const categories = allCategories.filter((category) => {
    const hasAccess = canAccessCategory(userPermissions, category.permission);
    // console.log(`📦 ${category.title}:`, {
    //   permission: category.permission,
    //   hasAccess: hasAccess,
    //   userPerms: userPermissions,
    //   accessible: getAccessiblePermissions(userPermissions),
    // });
    return hasAccess;
  });


  // Show loading state
  if (!permissionsLoaded || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 w-16 h-16 mx-auto rounded-full bg-blue-400/20 animate-ping"></div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
            Loading your dashboard...
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-red-700 dark:text-red-300 shadow-lg">
        <div className="flex items-center gap-3">
          <AlertCircle size={28} />
          <div>
            <h3 className="font-bold text-lg">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // No access message
  if (categories.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center shadow-lg">
        <div className="flex items-center justify-center gap-3 mb-4">
          <AlertCircle
            size={32}
            className="text-yellow-600 dark:text-yellow-400"
          />
          <h3 className="font-bold text-xl text-yellow-800 dark:text-yellow-200">
            No Access
          </h3>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          You don't have permission to access any certificate categories.
        </p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-4">
          Your current permissions:{" "}
          <strong>{userPermissions.join(", ") || "None"}</strong>
        </p>
        <p className="text-sm text-yellow-600 dark:text-yellow-400">
          Please contact your administrator to grant you access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isAdmin(userPermissions) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex justify-end"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/templates")}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 group mt-10"
          >
            <FileText
              size={24}
              className="group-hover:rotate-12 transition-transform duration-300"
            />
            <span>Manage Templates</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-2 transition-transform duration-300"
            />
          </motion.button>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
      >
        {categories.map((category, index) => {
          const IconComponent = category.icon;

          return (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`bg-gradient-to-br ${category.gradient} ${category.darkGradient} rounded-2xl shadow-lg p-8 text-white relative overflow-hidden group`}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full -ml-12 -mb-12"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold drop-shadow-md">
                    {category.title}
                  </h3>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 group-hover:bg-white/30 transition-all duration-300">
                    <IconComponent
                      size={40}
                      className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center bg-white/15 backdrop-blur-sm rounded-xl p-3.5 hover:bg-white/25 transition-all duration-300 border border-white/10">
                    <span className="text-sm font-semibold">
                      Total Certificates
                    </span>
                    <span className="text-2xl font-black">
                      {stats[category.key]?.total || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/15 backdrop-blur-sm rounded-xl p-3.5 hover:bg-white/25 transition-all duration-300 border border-white/10">
                    <span className="text-sm font-semibold">Downloaded</span>
                    <span className="text-2xl font-black text-green-100">
                      {stats[category.key]?.downloaded || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white/15 backdrop-blur-sm rounded-xl p-3.5 hover:bg-white/25 transition-all duration-300 border border-white/10">
                    <span className="text-sm font-semibold">Pending</span>
                    <span className="text-2xl font-black text-yellow-100">
                      {stats[category.key]?.pending || 0}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs mb-2 opacity-90 font-medium">
                    <span>Completion</span>
                    <span className="font-bold">
                      {stats[category.key]?.total > 0
                        ? Math.round(
                            (stats[category.key]?.downloaded /
                              stats[category.key]?.total) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-white/25 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width:
                          stats[category.key]?.total > 0
                            ? `${
                                (stats[category.key]?.downloaded /
                                  stats[category.key]?.total) *
                                100
                              }%`
                            : "0%",
                      }}
                      transition={{
                        delay: 0.5 + 0.1 * index,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className="bg-white h-full rounded-full shadow-lg"
                    ></motion.div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(category.route)}
                  className={`w-full bg-white ${category.buttonTextColor} font-bold py-3.5 rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group/button`}
                >
                  <span>View Details</span>
                  <ArrowRight
                    size={20}
                    className="group-hover/button:translate-x-1 transition-transform duration-300"
                  />
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
