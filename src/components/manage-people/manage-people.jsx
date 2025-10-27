"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  Loader2,
  Layers,
  Plus,
  AlertCircle,
  Filter,
  Home,
  ArrowLeft,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ManagePeople() {
  const router = useRouter();

  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [batches, setBatches] = useState({
    FSD: [],
    BVOC: [],
  });
  const [batchForm, setBatchForm] = useState({
    category: "FSD",
    batchName: "",
  });
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    category: "",
    batch: "",
    phone: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "code4bharat", label: "Code4Bharat" },
    { value: "marketing-junction", label: "Marketing Junction" },
    { value: "FSD", label: "FSD" },
    { value: "BVOC", label: "BVOC" },
    { value: "HR", label: "HR" },
  ];

  // Debug: Check API URL
  useEffect(() => {
    console.log("🔍 API_URL:", API_URL);
    if (!API_URL) {
      console.error("❌ API_URL is not defined! Check your .env.local file");
      setApiError(
        "API URL not configured. Please set NEXT_PUBLIC_API_URL in .env.local"
      );
    }
  }, [API_URL]);

  // Fetch all people and batches on mount
  useEffect(() => {
    if (API_URL) {
      fetchPeople();
      loadBatchesFromBackend();
    }
  }, [API_URL]);

  // Fetch when category or batch filter changes
  useEffect(() => {
    if (API_URL) {
      fetchPeople();
    }
  }, [selectedCategory, selectedBatch]);

  // Client-side search filter only
  useEffect(() => {
    if (!Array.isArray(people)) {
      setFilteredPeople([]);
      return;
    }

    let filtered = people;

    // Filter by search query (client-side only)
    if (searchQuery) {
      filtered = filtered.filter(
        (person) =>
          person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.phone?.includes(searchQuery)
      );
    }

    setFilteredPeople(filtered);
  }, [searchQuery, people]);

  // ========== BACKEND: Load batches from backend ==========
  const loadBatchesFromBackend = async () => {
    if (!API_URL) return;

    try {
      console.log("📡 Fetching batches from backend...");
      const res = await axios.get(`${API_URL}/api/batches`);

      if (res.data.success && res.data.batches) {
        console.log("✅ Batches loaded:", res.data.batches);
        setBatches(res.data.batches);
        // Also save to localStorage as backup
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "customBatches",
            JSON.stringify(res.data.batches)
          );
        }
      }
    } catch (err) {
      console.error("❌ Error loading batches:", err);
      // Fallback to localStorage if backend fails
      loadBatchesFromLocalStorage();
    }
  };

  // Fallback: Load batches from localStorage
  const loadBatchesFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customBatches");
      if (saved) {
        try {
          setBatches(JSON.parse(saved));
        } catch (err) {
          console.error("Error loading batches from localStorage:", err);
        }
      }
    }
  };

  // Save batches to localStorage (backup only)
  const saveBatchesToLocalStorage = (newBatches) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customBatches", JSON.stringify(newBatches));
    }
  };

  // ========== BACKEND: Fetch people ==========
  const fetchPeople = async () => {
    if (!API_URL) {
      console.error("❌ Cannot fetch: API_URL is undefined");
      setApiError("API URL not configured");
      setFetchLoading(false);
      return;
    }

    try {
      setFetchLoading(true);
      setApiError(null);

      // Build URL with query parameters for backend filtering
      let url = `${API_URL}/api/people`;
      const params = new URLSearchParams();

      // Only add filters if not 'all'
      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }
      if (selectedBatch && selectedBatch !== "all") {
        params.append("batch", selectedBatch);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      console.log("📡 Fetching from:", url);

      const res = await axios.get(url, {
        timeout: 10000,
      });

      console.log("✅ Response received:", res.data);

      // Backend returns { success: true, names: [...] }
      let peopleData = [];
      if (res.data.success && Array.isArray(res.data.names)) {
        peopleData = res.data.names;
        console.log("📦 Data from res.data.names");
      } else if (res.data.data && Array.isArray(res.data.data)) {
        peopleData = res.data.data;
        console.log("📦 Data from res.data.data");
      } else if (Array.isArray(res.data)) {
        peopleData = res.data;
        console.log("📦 Data from res.data");
      } else {
        console.warn("⚠️ Unexpected response format:", res.data);
      }

      console.log("👥 People fetched:", peopleData.length);
      setPeople(peopleData);
      setFilteredPeople(peopleData);

      if (peopleData.length === 0) {
        const filterText =
          selectedCategory !== "all" || selectedBatch !== "all"
            ? "No people found with selected filters"
            : "No people found in database";
        toast(filterText, { icon: "ℹ️" });
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);

      let errorMessage = "Failed to fetch people";

      if (err.code === "ECONNABORTED") {
        errorMessage = "Request timeout - Backend might be slow or down";
      } else if (err.response) {
        console.error("Server Error:", err.response.status, err.response.data);
        errorMessage = `Server Error: ${err.response.status} - ${
          err.response.data?.message || "Unknown error"
        }`;
      } else if (err.request) {
        console.error("No Response:", err.request);
        errorMessage = "No response from server. Check if backend is running.";
      } else {
        console.error("Error:", err.message);
        errorMessage = err.message;
      }

      setApiError(errorMessage);
      toast.error(errorMessage);
      setPeople([]);
      setFilteredPeople([]);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "category") {
      setFormData({ ...formData, [name]: value, batch: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ========== BACKEND: Submit (Create/Update) person ==========
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!API_URL) {
      toast.error("API URL not configured");
      return;
    }

    // Validations
    if (!formData.name || !formData.category || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    const categoryNeedsBatch = ["FSD", "BVOC"].includes(formData.category);
    if (categoryNeedsBatch && !formData.batch) {
      toast.error("Please select a batch");
      return;
    }

    // Phone validation (10 digits only, backend adds 91)
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Phone must be a 10-digit number");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        // Update person
        console.log("🔄 Updating person:", formData._id);
        const res = await axios.put(
          `${API_URL}/api/people/${formData._id}`,
          {
            name: formData.name,
            category: formData.category,
            batch: formData.batch,
            phone: formData.phone,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ Update response:", res.data);

        if (res.data.success || res.data.message || res.status === 200) {
          toast.success(res.data.message || "Person updated successfully!");
          fetchPeople();
          closeModal();
        }
      } else {
        // Create person
        console.log("➕ Creating person:", formData);
        const res = await axios.post(
          `${API_URL}/api/people`,
          {
            name: formData.name,
            category: formData.category,
            batch: formData.batch,
            phone: formData.phone,
          },
          { headers: { "Content-Type": "application/json" } }
        );

        console.log("✅ Create response:", res.data);

        if (res.data.success || res.data.message || res.status === 201) {
          toast.success(res.data.message || "Person added successfully!");
          fetchPeople();
          closeModal();
        }
      }
    } catch (err) {
      console.error("❌ Submit error:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (person) => {
    // Remove country code (91) from phone for display
    let displayPhone = person.phone;
    if (person.phone && person.phone.startsWith("91") && person.phone.length === 12) {
      displayPhone = person.phone.substring(2);
    }

    setFormData({
      _id: person._id || person.internId,
      name: person.name,
      category: person.category,
      batch: person.batch || "",
      phone: displayPhone,
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // ========== BACKEND: Delete person ==========
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this person?")) return;

    if (!API_URL) {
      toast.error("API URL not configured");
      return;
    }

    try {
      console.log("🗑️ Deleting person:", id);
      const res = await axios.delete(`${API_URL}/api/people/${id}`);
      console.log("✅ Delete response:", res.data);

      if (res.data.success || res.data.message || res.status === 200 || res.status === 204) {
        toast.success(res.data.message || "Person deleted successfully!");
        fetchPeople();
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error(err.response?.data?.message || "Failed to delete person");
    }
  };

  const openAddModal = () => {
    setFormData({ _id: "", name: "", category: "", batch: "", phone: "" });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ _id: "", name: "", category: "", batch: "", phone: "" });
    setIsEditMode(false);
  };

  const openBatchModal = () => {
    setBatchForm({ category: "FSD", batchName: "" });
    setIsBatchModalOpen(true);
  };

  const closeBatchModal = () => {
    setIsBatchModalOpen(false);
    setBatchForm({ category: "FSD", batchName: "" });
  };

  // ========== BACKEND: Add batch ==========
  const handleAddBatch = async () => {
    if (!batchForm.batchName.trim()) {
      toast.error("Please enter a batch name");
      return;
    }

    const batchPattern = /^B-\d+$/;
    if (!batchPattern.test(batchForm.batchName)) {
      toast.error("Batch name must be in format B-1, B-2, etc.");
      return;
    }

    if (batches[batchForm.category].includes(batchForm.batchName)) {
      toast.error("This batch already exists");
      return;
    }

    if (!API_URL) {
      toast.error("API URL not configured");
      return;
    }

    try {
      setBatchLoading(true);

      console.log("➕ Creating batch:", {
        category: batchForm.category,
        name: batchForm.batchName,
      });

      const res = await axios.post(
        `${API_URL}/api/batches`,
        {
          category: batchForm.category,
          name: batchForm.batchName,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Batch created:", res.data);

      if (res.data.success) {
        // Update local state
        const newBatches = {
          ...batches,
          [batchForm.category]: [
            ...batches[batchForm.category],
            batchForm.batchName,
          ].sort(),
        };

        setBatches(newBatches);

        // Save to localStorage as backup
        saveBatchesToLocalStorage(newBatches);

        toast.success(
          res.data.message ||
            `Batch ${batchForm.batchName} added to ${batchForm.category}`
        );
        setBatchForm({ category: "FSD", batchName: "" });
      }
    } catch (err) {
      console.error("❌ Error creating batch:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to create batch";
      toast.error(errorMsg);
    } finally {
      setBatchLoading(false);
    }
  };

  // ========== BACKEND: Delete batch ==========
  const handleDeleteBatch = async (category, batchName) => {
    if (!confirm(`Are you sure you want to delete batch ${batchName}?`)) return;

    if (!API_URL) {
      toast.error("API URL not configured");
      return;
    }

    try {
      console.log("🗑️ Deleting batch:", { category, name: batchName });

      const res = await axios.delete(
        `${API_URL}/api/batches/by-name/${category}/${batchName}`
      );

      console.log("✅ Batch deleted:", res.data);

      if (res.data.success) {
        // Update local state
        const newBatches = {
          ...batches,
          [category]: batches[category].filter((b) => b !== batchName),
        };

        setBatches(newBatches);

        // Save to localStorage as backup
        saveBatchesToLocalStorage(newBatches);

        toast.success(res.data.message || `Batch ${batchName} deleted`);
      }
    } catch (err) {
      console.error("❌ Error deleting batch:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to delete batch";
      toast.error(errorMsg);
    }
  };

  const getBatchOptions = () => {
    if (formData.category === "FSD") return batches.FSD;
    if (formData.category === "BVOC") return batches.BVOC;
    return [];
  };

  // Get available batches for filter dropdown
  const getAvailableBatches = () => {
    if (selectedCategory === "FSD") return batches.FSD;
    if (selectedCategory === "BVOC") return batches.BVOC;
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 p-6">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push("/")}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all text-gray-700 font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </motion.button>

        {/* API Error Alert */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl mb-6 flex items-start gap-4"
          >
            <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-red-800 font-bold text-lg mb-2">
                Backend Connection Error
              </h3>
              <p className="text-red-700 mb-3">{apiError}</p>
              <div className="bg-red-100 rounded-lg p-4 text-sm text-red-800">
                <p className="font-semibold mb-2">🔧 Troubleshooting Steps:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Check if backend server is running</li>
                  <li>Verify NEXT_PUBLIC_API_URL in .env.local file</li>
                  <li>Ensure CORS is enabled on backend</li>
                  <li>Check browser console for detailed errors</li>
                  <li>
                    Try:{" "}
                    <code className="bg-red-200 px-2 py-1 rounded">
                      curl {API_URL}/api/people
                    </code>
                  </li>
                </ul>
              </div>
              <button
                onClick={fetchPeople}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-10 h-10 text-orange-600" />
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Manage People
                </h1>
                <p className="text-gray-600 mt-1">
                  Add, edit, view, and delete participants
                </p>
                {API_URL && (
                  <p className="text-xs text-gray-400 mt-1">
                    Connected to: {API_URL}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openBatchModal}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Layers className="w-5 h-5" />
                Manage Batches
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Add New Person
              </motion.button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, category, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedBatch("all"); // Reset batch when category changes
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800 appearance-none bg-white cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Batch Filter Dropdown - Only show if FSD or BVOC selected */}
            {(selectedCategory === "FSD" || selectedCategory === "BVOC") && (
              <div className="relative">
                <Layers className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Batches</option>
                  {getAvailableBatches().map((batch) => (
                    <option key={batch} value={batch}>
                      {batch}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" ||
            selectedBatch !== "all" ||
            searchQuery) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600 font-semibold">
                Active Filters:
              </span>
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                  {
                    categories.find((c) => c.value === selectedCategory)
                      ?.label
                  }
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setSelectedBatch("all");
                    }}
                    className="hover:text-orange-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedBatch !== "all" && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                  Batch: {selectedBatch}
                  <button
                    onClick={() => setSelectedBatch("all")}
                    className="hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* People List */}
        {fetchLoading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading people from database...</p>
          </div>
        ) : !Array.isArray(filteredPeople) || filteredPeople.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No People Found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ||
              selectedCategory !== "all" ||
              selectedBatch !== "all"
                ? "Try adjusting your filters or search query"
                : "Start by adding your first person"}
            </p>
            {!searchQuery &&
              selectedCategory === "all" &&
              selectedBatch === "all" &&
              !apiError && (
                <button
                  onClick={openAddModal}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  Add Your First Person
                </button>
              )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeople.map((person, index) => (
              <motion.div
                key={person._id || person.internId || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:border-orange-300 transition-all"
              >
                {/* Header with Category Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {person.category && (
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full text-xs font-bold uppercase tracking-wide mb-2">
                        {person.category}
                      </span>
                    )}
                  </div>
                  {person.batch && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                      <Layers className="w-3 h-3" />
                      {person.batch}
                    </span>
                  )}
                </div>

                {/* Name and Phone - Prominent Display */}
                <div className="mb-5">
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">
                    {person.name}
                  </h3>

                  {person.phone && (
                    <div className="flex items-center gap-3 bg-blue-50 rounded-xl p-3 border border-blue-200">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium uppercase">
                          Phone
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          +{person.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(person)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      handleDelete(person._id || person.internId)
                    }
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Total Count */}
        {!fetchLoading &&
          Array.isArray(filteredPeople) &&
          filteredPeople.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-center text-gray-600 font-semibold"
            >
              Showing {filteredPeople.length} of {people.length} people
              {selectedCategory !== "all" &&
                ` in ${
                  categories.find((c) => c.value === selectedCategory)?.label
                }`}
              {selectedBatch !== "all" && ` - ${selectedBatch}`}
            </motion.div>
          )}
      </div>

        {/* Add/Edit Person Modal - Same as before */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  {isEditMode ? (
                    <Edit2 className="w-8 h-8 text-blue-600" />
                  ) : (
                    <UserPlus className="w-8 h-8 text-orange-600" />
                  )}
                  <h2 className="text-3xl font-bold text-gray-800">
                    {isEditMode ? "Edit Person" : "Add New Person"}
                  </h2>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                    placeholder="Enter name"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="code4bharat">Code4Bharat</option>
                    <option value="marketing-junction">
                      Marketing Junction
                    </option>
                    <option value="FSD">FSD</option>
                    <option value="BVOC">BVOC</option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                {/* Batch */}
                {getBatchOptions().length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Batch *
                    </label>
                    <select
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                      required
                    >
                      <option value="">Select batch</option>
                      {getBatchOptions().map((batch, idx) => (
                        <option key={idx} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Phone Number *{" "}
                    <span className="text-sm text-gray-500">
                      (10 digits, +91 will be added automatically)
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                    placeholder="9876543210"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      {isEditMode ? "Update Person" : "Add Person"}
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Management Modal - Same as before */}
      <AnimatePresence>
        {isBatchModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={closeBatchModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Layers className="w-8 h-8 text-purple-600" />
                  <h2 className="text-3xl font-bold text-gray-800">
                    Manage Batches
                  </h2>
                </div>
                <button
                  onClick={closeBatchModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Add New Batch */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Add New Batch
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={batchForm.category}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, category: e.target.value })
                    }
                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                  >
                    <option value="FSD">FSD</option>
                    <option value="BVOC">BVOC</option>
                  </select>

                  <input
                    type="text"
                    placeholder="e.g., B-5"
                    value={batchForm.batchName}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, batchName: e.target.value })
                    }
                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none text-gray-800"
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddBatch}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Add Batch
                  </motion.button>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  💡 Batch format must be: B-1, B-2, B-3, etc.
                </p>
              </div>

              {/* Existing Batches */}
              <div className="space-y-6">
                {/* FSD Batches */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
                      FSD
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({batches.FSD.length} batches)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {batches.FSD.map((batch) => (
                      <div
                        key={batch}
                        className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3"
                      >
                        <span className="font-semibold text-gray-800">
                          {batch}
                        </span>
                        <button
                          onClick={() => handleDeleteBatch("FSD", batch)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BVOC Batches */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                      BVOC
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({batches.BVOC.length} batches)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {batches.BVOC.map((batch) => (
                      <div
                        key={batch}
                        className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3"
                      >
                        <span className="font-semibold text-gray-800">
                          {batch}
                        </span>
                        <button
                          onClick={() => handleDeleteBatch("BVOC", batch)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}