//StatsCards.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Settings,
  Calendar,
  TrendingUp,
  Download,
  Clock,
  RefreshCw,
  Layers,
  Package,
  BarChart3,
  Code2,
  Rocket,
  GraduationCap,
  Zap,
  Users,
  ChevronRight,
  FileText,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
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

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = (currentTime - startTime) / duration;

      if (progress < 1) {
        setCount(Math.floor(value * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <>{count}</>;
};

// StatsCards.jsx - Replace the entire StatCard component
const StatCard = ({
  title,
  icon: Icon,
  total,
  mj,
  NEX,
  fsd,
  hr,
  bc,
  bvoc,
  dm,
  operations,
  monthlyReport,
  client,
  gradient,
  bg,
  iconBg,
  glowColor,
  index,
  router,
  categories,
}) => {
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    const adminData = sessionStorage.getItem("adminData");
    if (adminData) {
      try {
        const data = JSON.parse(adminData);
        console.log("📋 User Permissions:", data.permissions);
        setUserPermissions(data.permissions || []);
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    }
  }, []);

  const getCategory = (key) =>
    categories.find((cat) => cat.key.toLowerCase() === key.toLowerCase());

  const createCategoryRow = (label, value, key) => {
    const category = getCategory(key);

    // ✅ FIXED: Check if user has permission for this category
    const hasPermission = category
      ? userPermissions.includes(category.permission)
      : true;

    // ✅ ALWAYS SHOW THE ROW - just disable clicking if no permission
    const isClickable = hasPermission && value > 0;

    return (
      <motion.div
        key={key}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 + 0.2 }}
        className={`flex items-center justify-between py-2 px-3 rounded-lg transition-all duration-300 ${
          isClickable
            ? "bg-white/60 dark:bg-gray-800/60 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer hover:shadow-md"
            : value > 0
            ? "bg-gray-100/50 dark:bg-gray-800/30 opacity-60 cursor-not-allowed"
            : "bg-gray-50/50 dark:bg-gray-800/30"
        }`}
        onClick={() => isClickable && router.push(category.route)}
        title={
          !hasPermission && value > 0
            ? "You don't have permission to view this category"
            : ""
        }
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}:
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-bold ${
              value > 0
                ? hasPermission
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {value}
          </span>
          {isClickable && (
            <ChevronRight className="w-4 h-4 text-blue-500 dark:text-blue-400" />
          )}
          {!hasPermission && value > 0 && (
            <span className="text-xs text-gray-400">🔒</span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
        </div>

        <div className="text-4xl font-bold text-white mb-2">
          <AnimatedCounter value={total} />
        </div>
        <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">
          Total Certificates
        </p>
      </div>

      <div className="p-5 space-y-2 bg-gray-50/50 dark:bg-gray-900/50">
        {createCategoryRow("MJ", mj, "marketing-junction")}
        {createCategoryRow("NEX", NEX, "it-nexcore")}
        {createCategoryRow("FSD", fsd, "fsd")}
        {createCategoryRow("HR", hr, "hr")}
        {createCategoryRow("BOOTCAMP", bc, "bootcamp")}
        {createCategoryRow("BVOC", bvoc, "bvoc")}
        {createCategoryRow("DM", dm, "dm")}
        {createCategoryRow("OPS", operations, "operations")}
        {createCategoryRow("Client", client, "client")}
      </div>
    </motion.div>
  );
};

const BulkStatCard = ({
  title,
  icon: Icon,
  operations,
  certificates,
  gradient,
  bg,
  iconBg,
  glowColor,
  index,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
  >
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-4xl font-bold text-white">
          <AnimatedCounter value={operations} />
        </div>
        <span className="text-blue-100 dark:text-blue-200 text-sm font-medium">
          ops
        </span>
      </div>
    </div>

    <div className="p-5 space-y-3 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/60 dark:bg-gray-800/60">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Total Certificates
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {certificates}
        </span>
      </div>
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/60 dark:bg-gray-800/60">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Avg per operation
        </span>
        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
          {operations > 0 ? Math.round(certificates / operations) : 0}
        </span>
      </div>
    </div>
  </motion.div>
);

const CreationRatioCard = ({ individual, bulk, total, index }) => {
  let bulkPercentage = total > 0 ? Math.round((bulk / total) * 100) : 0;
  let individualPercentage =
    total > 0 ? Math.round((individual / total) * 100) : 0;

  if (bulkPercentage + individualPercentage > 100) {
    const sum = bulkPercentage + individualPercentage;
    bulkPercentage = Math.round((bulkPercentage / sum) * 100);
    individualPercentage = Math.round((individualPercentage / sum) * 100);
  }

  bulkPercentage = Math.max(0, Math.min(100, bulkPercentage));
  individualPercentage = Math.max(0, Math.min(100, individualPercentage));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-white">Creation Ratio</h3>
        </div>

        <div className="text-4xl font-bold text-white mb-2">
          <AnimatedCounter value={total} />
        </div>
        <p className="text-blue-100 dark:text-blue-200 text-sm font-medium">
          Total Created
        </p>
      </div>

      <div className="p-5 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Individual
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {individual}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                {individualPercentage}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${individualPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Bulk
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {bulk}
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                {bulkPercentage}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${bulkPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 dark:from-blue-300 dark:to-cyan-400 rounded-full"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function StatsCards() {
  const router = useRouter();
  const isFetchingRef = useRef(false); // ✅ Prevent duplicate calls

  const [stats, setStats] = useState([
    {
      title: "Last 7 Days",
      icon: Calendar,
      total: 0,
      mj: 0,
      NEX: 0,
      gradient: "from-blue-600 via-blue-500 to-cyan-500",
      bg: "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      glowColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Last Month",
      icon: TrendingUp,
      total: 0,
      mj: 0,
      NEX: 0,
      gradient: "from-orange-600 via-orange-500 to-amber-500",
      bg: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900",
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
      glowColor: "border-orange-200 dark:border-orange-800",
    },
    {
      title: "Downloaded",
      icon: Download,
      total: 0,
      mj: 0,
      NEX: 0,
      gradient: "from-blue-600 via-indigo-600 to-purple-600",
      bg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-900",
      iconBg: "bg-blue-100 dark:bg-blue-900/50",
      glowColor: "border-blue-200 dark:border-blue-800",
    },
    {
      title: "Pending",
      icon: Clock,
      total: 0,
      mj: 0,
      NEX: 0,
      gradient: "from-orange-600 via-red-600 to-pink-600",
      bg: "bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 dark:from-orange-950 dark:via-red-950 dark:to-pink-900",
      iconBg: "bg-orange-100 dark:bg-orange-900/50",
      glowColor: "border-orange-200 dark:border-orange-800",
    },
  ]);

  const [bulkStats, setBulkStats] = useState({
    last7Days: { operations: 0, certificates: 0 },
    lastMonth: { operations: 0, certificates: 0 },
    downloads: { operations: 0, certificates: 0 },
  });

  const [creationRatio, setCreationRatio] = useState({
    individual: 0,
    bulk: 0,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    {
      title: "it-nexcore",
      key: "it-nexcore",
      gradient: "from-blue-600 to-cyan-500",
      buttonTextColor: "text-blue-600",
      route: "/certificates/it-nexcore",
      icon: Code2,
      permission: "it-nexcore", // Backend uses this
    },
    {
      title: "Marketing Junction",
      key: "marketing-junction",
      gradient: "from-orange-500 to-amber-500",
      buttonTextColor: "text-orange-600",
      route: "/certificates/marketing-junction",
      icon: BarChart3,
      permission: "marketing-junction",
    },
    {
      title: "Digital Marketing",
      key: "dm",
      gradient: "from-cyan-500 to-blue-600",
      buttonTextColor: "text-cyan-600",
      route: "/certificates/dm",
      icon: Megaphone,
      permission: "dm",
    },
    {
      title: "fsd",
      key: "fsd",
      gradient: "from-blue-500 to-indigo-600",
      buttonTextColor: "text-blue-600",
      route: "/certificates/fsd",
      icon: Zap,
      permission: "fsd",
    },
    {
      title: "hr",
      key: "hr",
      gradient: "from-orange-600 to-red-500",
      buttonTextColor: "text-orange-600",
      route: "/certificates/hr",
      icon: Users,
      permission: "hr",
    },
    {
      title: "bootcamp",
      key: "bootcamp",
      gradient: "from-blue-600 to-purple-600",
      buttonTextColor: "text-blue-600",
      route: "/certificates/bootcamp",
      icon: Rocket,
      permission: "bootcamp",
    },
    {
      title: "bvoc",
      key: "bvoc",
      gradient: "from-orange-500 to-pink-600",
      buttonTextColor: "text-orange-600",
      route: "/certificates/bvoc",
      icon: GraduationCap,
      permission: "bvoc",
    },
    {
      title: "operations Department",
      key: "operations",
      gradient: "from-gray-600 to-gray-800",
      buttonTextColor: "text-gray-600",
      route: "/certificates/operations",
      icon: Settings,
      permission: "operations",
    },
    {
      title: "client",
      key: "client",
      gradient: "from-teal-500 to-emerald-600",
      buttonTextColor: "text-teal-600",
      route: "/certificates/client",
      icon: FileText,
      permission: "client",
    },
  ];
  const fetchStats = async () => {
    if (isFetchingRef.current) {
      c
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

    try {
      const token =
        typeof window !== "undefined"
          ? sessionStorage.getItem("authToken")
          : null;
      

      const response = await axios.get(`${API_URL}/api/stats/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = response.data.data;

     

      setStats([
        {
          title: "Last 7 Days",
          icon: Calendar,
          total: data.last7Days?.total || 0,
          mj: data.last7Days?.["marketing-junction"] || 0,
          NEX: data.last7Days?.["it-nexcore"] || 0,
          fsd: data.last7Days?.fsd || 0,
          hr: data.last7Days?.hr || 0,
          bc: data.last7Days?.bootcamp || 0, // ✅ Fixed: was BOOTCAMP
          bvoc: data.last7Days?.bvoc || 0,
          dm: data.last7Days?.dm || 0,
          operations: data.last7Days?.operations || 0,
          monthlyReport: data.last7Days?.MonthlyReport || 0,
          client: data.last7Days?.client || 0,
          gradient: "from-blue-600 via-blue-500 to-cyan-500",
          bg: "bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950 dark:via-cyan-950 dark:to-blue-900",
          iconBg: "bg-blue-100 dark:bg-blue-900/50",
          glowColor: "border-blue-200 dark:border-blue-800",
        },
        {
          title: "Last Month",
          icon: TrendingUp,
          total: data.lastMonth?.total || 0,
          mj: data.lastMonth?.["marketing-junction"] || 0,
          NEX: data.lastMonth?.["it-nexcore"] || 0,
          fsd: data.lastMonth?.fsd || 0,
          hr: data.lastMonth?.hr || 0,
          bc: data.lastMonth?.bootcamp || 0, // ✅ Fixed
          bvoc: data.lastMonth?.bvoc || 0,
          dm: data.lastMonth?.dm || 0,
          operations: data.lastMonth?.operations || 0,
          monthlyReport: data.lastMonth?.MonthlyReport || 0,
          client: data.lastMonth?.client || 0,
          gradient: "from-orange-600 via-orange-500 to-amber-500",
          bg: "bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950 dark:via-amber-950 dark:to-orange-900",
          iconBg: "bg-orange-100 dark:bg-orange-900/50",
          glowColor: "border-orange-200 dark:border-orange-800",
        },
        {
          title: "Downloaded",
          icon: Download,
          total: data.downloaded?.total || 0,
          mj: data.downloaded?.["marketing-junction"] || 0,
          NEX: data.downloaded?.["it-nexcore"] || 0,
          fsd: data.downloaded?.fsd || 0,
          hr: data.downloaded?.hr || 0,
          bc: data.downloaded?.bootcamp || 0, // ✅ Fixed
          bvoc: data.downloaded?.bvoc || 0,
          dm: data.downloaded?.dm || 0,
          operations: data.downloaded?.operations || 0,
          monthlyReport: data.downloaded?.MonthlyReport || 0,
          client: data.downloaded?.client || 0,
          gradient: "from-blue-600 via-indigo-600 to-purple-600",
          bg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-900",
          iconBg: "bg-blue-100 dark:bg-blue-900/50",
          glowColor: "border-blue-200 dark:border-blue-800",
        },
        {
          title: "Pending",
          icon: Clock,
          total: data.pending?.total || 0,
          mj: data.pending?.["marketing-junction"] || 0,
          NEX: data.pending?.["it-nexcore"] || 0,
          fsd: data.pending?.fsd || 0,
          hr: data.pending?.hr || 0,
          bc: data.pending?.bootcamp || 0, // ✅ Fixed
          bvoc: data.pending?.bvoc || 0,
          dm: data.pending?.dm || 0,
          operations: data.pending?.operations || 0,
          monthlyReport: data.pending?.MonthlyReport || 0,
          client: data.pending?.client || 0,
          gradient: "from-orange-600 via-red-600 to-pink-600",
          bg: "bg-gradient-to-br from-orange-50 via-red-50 to-pink-100 dark:from-orange-950 dark:via-red-950 dark:to-pink-900",
          iconBg: "bg-orange-100 dark:bg-orange-900/50",
          glowColor: "border-orange-200 dark:border-orange-800",
        },
      ]);

      if (data.bulk) {
        setBulkStats(data.bulk);
      }

      if (data.creationRatio) {
        setCreationRatio(data.creationRatio);
      }

     
    } catch (err) {
      console.error("❌ Error fetching stats:", err);
      setError(err.response?.data?.message || "Failed to load statistics");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchStats();
      }
    };

    loadData();

    return () => {
      mounted = false;
      isFetchingRef.current = false; // ✅ Clean up on unmount
    };
  }, []); // ✅ Empty dependency array is correct

  if (loading) {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse border border-gray-200 dark:border-gray-700"
            >
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse border border-gray-200 dark:border-gray-700"
            >
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-xl font-medium transition-colors duration-200"
        >
          <RefreshCw className="w-5 h-5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
            router={router}
            categories={categories}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BulkStatCard
          title="Last 7 Days Bulk"
          icon={Package}
          operations={bulkStats.last7Days.operations}
          certificates={bulkStats.last7Days.certificates}
          gradient="from-blue-600 to-cyan-500"
          bg="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900"
          iconBg="bg-blue-100 dark:bg-blue-900/50"
          glowColor="border-blue-200 dark:border-blue-800"
          index={0}
        />
        <BulkStatCard
          title="Last Month Bulk"
          icon={Package}
          operations={bulkStats.lastMonth.operations}
          certificates={bulkStats.lastMonth.certificates}
          gradient="from-blue-600 to-cyan-500"
          bg="bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-blue-950 dark:to-cyan-900"
          iconBg="bg-blue-100 dark:bg-blue-900/50"
          glowColor="border-blue-200 dark:border-blue-800"
          index={1}
        />
        <CreationRatioCard
          individual={creationRatio.individual}
          bulk={creationRatio.bulk}
          total={creationRatio.total}
          index={2}
        />
      </div>
    </>
  );
}
