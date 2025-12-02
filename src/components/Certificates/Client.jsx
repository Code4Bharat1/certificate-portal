"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2,
  Briefcase,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// Letter Configuration for Client
const getLetterTypesConfig = () => {
  return {
    "Project Completion": [],
    "Service Agreement": [],
    "Proposal Letter": [],
    "Thank You Letter": [],
    "Contract Agreement": [],
    "Invoice Cover Letter": [],
    "Project Update": [],
  };
};

export default function ClientPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [letterType, setLetterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [processingItem, setProcessingItem] = useState(null);
  const [sortBy, setSortBy] = useState("date-desc");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";
  const category = "Client";
  const letterConfig = getLetterTypesConfig();
  const letterMainTypes = Object.keys(letterConfig);

 useEffect(() => {
   const fetchAll = async () => {
     try {
       const token = sessionStorage.getItem("authToken");
       if (!token) {
         router.push("/login");
         return;
       }

       const res = await axios.get(`${API_URL}/api/client`, {
         headers: { Authorization: `Bearer ${token}` },
         params: { category },
       });

       console.log(res);
       

       if (res.data.success) {
         const clientletters = Array.isArray(res.data.clientletters)
           ? res.data.clientletters
           : [];
         const allItems = clientletters.map((l) => ({ ...l, type: "letter" }));

         allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
         setItems(allItems);
       } else {
         toast.error("Failed to fetch Client data");
       }
     } catch (error) {
       console.error(error);
       toast.error("Error fetching Client data");
     } finally {
       setLoading(false);
     }
   };

   fetchAll();
 }, [router, API_URL]);


  // Download PDF
  const handleDownloadPDF = async (item) => {
    setProcessingItem(item._id);
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const url = `${API_URL}/api/letters/${item._id}/download.pdf`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `${item.name}_client_letter.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (item.status !== "downloaded") {
        await updateItemStatus(item._id, "downloaded");
      }

      toast.success("Client letter PDF downloaded");
    } catch (error) {
      console.error(error);
      toast.error("Download failed");
    } finally {
      setProcessingItem(null);
    }
  };

  // Update status
  const updateItemStatus = async (id, status) => {
    try {
      const token = sessionStorage.getItem("authToken");
      const endpoint = `${API_URL}/api/letters/${id}/status`;

      await axios.put(
        endpoint,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems((prev) =>
        prev.map((it) => (it._id === id ? { ...it, status } : it))
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Delete item
 const handleDelete = async (id) => {
   try {
     const token = sessionStorage.getItem("authToken");
     if (!token) {
       router.push("/login");
       return;
     }

     // FIXED: Changed from /api/certificates to /api/client
     const res = await axios.delete(`${API_URL}/api/client/${id}`, {
       headers: { Authorization: `Bearer ${token}` },
     });

     if (res.data.success) {
       setItems((prev) => prev.filter((i) => i._id !== id));
       toast.success("Client letter deleted");
     } else {
       toast.error("Delete failed");
     }
   } catch (error) {
     console.error(error);
     toast.error("Error deleting item");
   } finally {
     setDeleteConfirm(null);
   }
 };
  // Sorting + Filtering
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setLetterType("");
    setSortBy("date-desc");
  };

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "date-asc":
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const filteredItems = sortedItems.filter((it) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      (it.name && it.name.toLowerCase().includes(search)) ||
      (it.letterId && it.letterId.toLowerCase().includes(search)) ||
      (it.projectName && it.projectName.toLowerCase().includes(search)) ||
      (it.subject && it.subject.toLowerCase().includes(search));

    const matchesStatus = statusFilter === "all" || it.status === statusFilter;
    const matchesLetterType =
      !letterType ||
      (it.letterType &&
        it.letterType.toLowerCase() === letterType.toLowerCase());

    return matchesSearch && matchesStatus && matchesLetterType;
  });

  // Stats
  const stats = {
    total: items.length,
    downloaded: items.filter((i) => i.status === "downloaded").length,
    pending: items.filter((i) => i.status === "pending").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Briefcase className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Client Letters</h1>
                <p className="text-cyan-100">
                  Manage all client correspondence
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <span className="text-sm text-cyan-100">Total</span>
              <span className="text-xl font-bold block">{stats.total}</span>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <span className="text-sm text-cyan-100">Downloaded</span>
              <span className="text-xl font-bold block">
                {stats.downloaded}
              </span>
            </div>
            <div className="bg-white/10 rounded-xl px-4 py-2 text-center">
              <span className="text-sm text-cyan-100">Pending</span>
              <span className="text-xl font-bold block">{stats.pending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, project, subject, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-black dark:text-white"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </motion.button>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-black dark:text-white"
            >
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["all", "downloaded", "pending"].map((status) => (
                        <button
                          key={status}
                          onClick={() => setStatusFilter(status)}
                          className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                            statusFilter === status
                              ? status === "downloaded"
                                ? "bg-green-500 text-white"
                                : status === "pending"
                                ? "bg-amber-500 text-white"
                                : "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                          <span className="ml-1 text-xs">
                            (
                            {status === "all"
                              ? items.length
                              : items.filter((i) => i.status === status).length}
                            )
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Letter Type
                    </label>
                    <select
                      value={letterType}
                      onChange={(e) => setLetterType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">All Letter Types</option>
                      {letterMainTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Loading...
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Fetching all client letters
            </p>
          </div>
        )}

        {/* Grid View */}
        {!loading && filteredItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((it, index) => (
              <motion.div
                key={it._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 flex flex-col"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">
                        {it.name}
                      </h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Letter
                      </span>
                    </div>
                    {it.projectName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {it.projectName}
                      </p>
                    )}
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-1 ${
                      it.status === "downloaded"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400"
                    }`}
                  >
                    {it.status === "downloaded" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {it.status || "pending"}
                  </span>
                </div>

                {/* Body */}
                <div className="space-y-3 mb-4 text-sm flex-grow">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Letter ID:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-right break-all">
                      {it.letterId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Issue Date:
                    </span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {it.issueDate
                        ? new Date(it.issueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                  </div>

                  {it.letterType && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-gray-400">
                        Type:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-right">
                        {it.letterType}
                      </span>
                    </div>
                  )}

                  {it.subject && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subject:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-right text-xs">
                        {it.subject.length > 50
                          ? it.subject.substring(0, 50) + "..."
                          : it.subject}
                      </span>
                    </div>
                  )}

                  {/* Signature Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Signature:
                    </span>
                    {it.signedUploaded ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-md text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-md text-xs font-semibold">
                        <AlertCircle className="w-3 h-3" />
                        Missing
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={processingItem === it._id}
                    onClick={() => handleDownloadPDF(it)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {processingItem === it._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    Download PDF
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setDeleteConfirm(it._id)}
                    className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No letters found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" || letterType
                ? "Try adjusting your filters or search criteria"
                : "No client letters have been created yet"}
            </p>
            {(searchTerm || statusFilter !== "all" || letterType) && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Clear filters
              </button>
            )}
          </motion.div>
        )}

        {/* Summary Bar */}
        {!loading && filteredItems.length > 0 && (
          <div className="mt-8 flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Showing{" "}
              <span className="font-semibold text-gray-800 dark:text-white">
                {filteredItems.length}
              </span>{" "}
              of {items.length} letters
            </p>
            {filteredItems.length !== items.length && (
              <button
                onClick={clearFilters}
                className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Delete Letter?
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this client letter? This
                  action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleDelete(deleteConfirm)}
                    className="flex-1 bg-red-500 dark:bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-600 dark:hover:bg-red-700 transition"
                  >
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
