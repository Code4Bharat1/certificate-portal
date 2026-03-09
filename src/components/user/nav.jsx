import axios from "axios";
import { LogOut, RefreshCw, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { refreshData } from "../../utils/refresh"

export default function UserNav({ fetchUserDataDocs }) {

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";
    const router = useRouter()

    const [userData, setUserData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchUserData();
    }, [])

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchUserData(),
                fetchUserDataDocs(),
            ]);

        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserData = async () => {
        try {
            const token = sessionStorage.getItem("authToken");

            if (!token) {
                throw new Error("No authentication token found");
            }

            const response = await axios.get(`${API_URL}/api/student/student/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setUserData(response.data.user);
            } else {
                throw new Error(response.data.message || "Failed to load user data");
            }
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                handleLogout();
            } else {
                toast.error("Failed to load user profile");
            }
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        toast.loading("Refreshing data...", { id: "refresh" });

        try {
            await fetchAllData();
            toast.success("Data refreshed successfully!", { id: "refresh" });
        } catch (error) {
            toast.error("Failed to refresh data", { id: "refresh" });
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        toast.success("Logged out successfully");
        router.push("/login");
    };


    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b-2 border-blue-200 dark:border-gray-700 sticky top-0 z-40" >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Toaster position="top-right" />
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent">
                                Welcome back, {userData?.name || "User"}!
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Manage your certificates and letters
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refreshData(fetchAllData, setRefreshing)}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition font-semibold text-sm disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                            />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}