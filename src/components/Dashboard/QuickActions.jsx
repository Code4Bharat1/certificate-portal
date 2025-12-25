"use client";

import { motion } from "framer-motion";
import {
  PlusCircle,
  Search,
  Sparkles,
  Users,
  FileText,
  ScrollText,
  FolderOpen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// ============================================
// PERMISSION HELPER FUNCTIONS
// ============================================


const normalizePermission = (permission) => {
  const normalized = permission.toLowerCase().trim();
  
  // Map all IT-Nexcore variants to the same key
  if (["code4bharat", "c4b", "code-4-bharat", "it-nexcore", "it_nexcore"].includes(normalized)) {
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
    "it-nexcore": ["fsd"],  // IT-Nexcore can access FSD
    "fsd": ["it-nexcore"],   // FSD can access IT-Nexcore
    "marketing-junction": ["dm"],  // Marketing Junction can access DM
    "dm": ["marketing-junction"],  // DM can access Marketing Junction
  };
  return crossAccessMap[permission] || [];
};

const isAdmin = (permissions) => {
  const normalized = normalizePermissions(permissions);
  return (
    normalized.includes("admin_management") ||
    normalized.includes("superadmin") ||
    normalized.includes("admin")
  );
};

const getAccessiblePermissions = (userPermissions) => {
  if (!Array.isArray(userPermissions)) return [];

  const normalized = normalizePermissions(userPermissions);

  // Super admin and admin have ALL access
  if (isAdmin(normalized)) {
    return ["all"];
  }

  const accessible = new Set(normalized);

  // Add cross-access permissions
  normalized.forEach((perm) => {
    const crossAccess = getCrossAccessPermissions(perm);
    crossAccess.forEach((ca) => accessible.add(ca));
  });

  return Array.from(accessible);
};

const canAccessAction = (userPermissions, requiredPermissions, requiresAny = true) => {
  if (!Array.isArray(requiredPermissions)) return false;

  const accessible = getAccessiblePermissions(userPermissions);

  // Admins can do everything
  if (accessible.includes("all")) return true;

  const normalizedRequired = normalizePermissions(requiredPermissions);

  if (requiresAny) {
    // User needs at least ONE of the required permissions
    return normalizedRequired.some((req) => accessible.includes(req));
  } else {
    // User needs ALL required permissions
    return normalizedRequired.every((req) => accessible.includes(req));
  }
};
// ============================================
// COMPONENT
// ============================================

export default function QuickActions() {
  const router = useRouter();
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const adminData = sessionStorage.getItem("adminData");
    if (adminData) {
      try {
        const data = JSON.parse(adminData);
        setUserPermissions(data.permissions || []);
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    }
  }, []);

  const handleCreateClick = () => router.push("/create-certificate");
  const handleVerifyClick = () => router.push("/verify-certificate");
  const handleManagePeopleClick = () => router.push("/manage-people");
  const handleCreateLetterClick = () => router.push("/create-letter");
  const handleViewTCClick = () => router.push("/verify-t&c");
  const handleViewDocumentsClick = () => router.push("/view-documents");
  const handleClientDocumentsClick = () => router.push("/Client");

  const allActions = [
    {
      title: "Create Certificate",
      description: "Generate new certificates for completed courses",
      icon: PlusCircle,
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleCreateClick,
      iconAnimation: "group-hover:scale-110 group-hover:rotate-90",
      permissions: [
        "it-nexcore",
        "marketing-junction",
        "dm",
        "fsd",
        "hr",
        "bootcamp",
        "bvoc",
        "operations",
      ],
      requiresAny: true,
    },
    {
      title: "Verify Certificate",
      description: "Verify the authenticity of issued certificates",
      icon: Search,
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleVerifyClick,
      iconAnimation: "group-hover:rotate-12 group-hover:scale-110",
      permissions: [
        "it-nexcore",
        "marketing-junction",
        "dm",
        "fsd",
        "hr",
        "bootcamp",
        "bvoc",
        "operations",
      ],
      requiresAny: true,
    },
    {
      title: "Manage People",
      description: "Add, edit, view, and remove participants",
      icon: Users,
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleManagePeopleClick,
      iconAnimation: "group-hover:scale-110",
      permissions: ["admin_management"],
      requiresAny: false,
    },
    {
      title: "Create Letter",
      description: "Design and generate official letters with ease",
      icon: FileText,
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleCreateLetterClick,
      iconAnimation: "group-hover:rotate-6 group-hover:scale-110",
      permissions: ["hr", "operations", "admin_management"],
      requiresAny: true,
    },
    {
      title: "View T&C",
      description: "Review the terms and conditions for certificate issuance",
      icon: ScrollText,
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleViewTCClick,
      iconAnimation: "group-hover:scale-110 group-hover:rotate-90",
      permissions: [
        "it-nexcore",
        "marketing-junction",
        "dm",
        "fsd",
        "hr",
        "bootcamp",
        "bvoc",
        "operations",
      ],
      requiresAny: true,
    },
    {
      title: "View Documents",
      description: "Access and review all user submitted documents",
      icon: FolderOpen,
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleViewDocumentsClick,
      iconAnimation: "group-hover:scale-110 group-hover:-rotate-12",
      permissions: ["hr", "operations", "admin_management"],
      requiresAny: true,
    },
    {
      title: "Client Documents",
      description: "Access and create all client related documents",
      icon: FolderOpen,
      iconColor: "text-blue-600 dark:text-blue-400",
      onClick: handleClientDocumentsClick,
      iconAnimation: "group-hover:scale-110 group-hover:-rotate-12",
      permissions: ["client"],
      requiresAny: false,
    },
  ];

  // Filter actions using the new permission system
  const actions = allActions.filter((action) =>
    canAccessAction(userPermissions, action.permissions, action.requiresAny)
  );

  if (actions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="relative bg-gradient-to-br from-white via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 overflow-hidden border-2 border-blue-100 dark:border-gray-700 mb-10 mt-10"
      >
        <div className="text-center py-8">
          <div className="inline-block p-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full shadow-lg mb-4">
            <Sparkles className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            No Quick Actions Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            You don't have permission to access any quick actions at this time.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="relative bg-gradient-to-br from-white via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 overflow-hidden border-2 border-blue-100 dark:border-gray-700 mb-10 mt-10"
    >
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/40 to-blue-200/40 dark:from-gray-800/30 dark:to-gray-700/30 rounded-full blur-3xl -z-0 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-50/40 to-blue-100/40 dark:from-gray-700/30 dark:to-gray-800/30 rounded-full blur-3xl -z-0 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-bl from-blue-100/30 to-gray-100/30 dark:from-gray-700/20 dark:to-gray-800/20 rounded-full blur-3xl -z-0 animate-pulse" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-2"
          >
            <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-300 dark:via-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
            Quick Actions
          </h2>
        </div>

        {/* Action Buttons Grid */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${
            actions.length >= 4
              ? "md:grid-cols-3 lg:grid-cols-4"
              : actions.length === 3
              ? "md:grid-cols-3"
              : "md:grid-cols-2"
          } gap-6`}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={action.onClick}
                className="group relative overflow-hidden flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 py-10 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-blue-100 dark:border-gray-600"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white dark:from-gray-700 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 bg-blue-100 dark:bg-gray-700 rounded-full p-3">
                  <Icon
                    className={`w-8 h-8 transition-transform duration-300 ${action.iconAnimation} ${action.iconColor}`}
                  />
                </div>

                <span className="relative z-10 text-center leading-tight font-bold text-gray-800 dark:text-gray-100 text-sm">
                  {action.title}
                </span>

                <p className="relative z-10 text-xs text-gray-600 dark:text-gray-400 leading-relaxed px-2 font-medium text-center">
                  {action.description}
                </p>

                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-700" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
