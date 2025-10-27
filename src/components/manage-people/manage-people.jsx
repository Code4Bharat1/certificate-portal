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
  UserX, // For disable icon
  UserCheck, // For enable icon
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
  
  // State for disabled view mode: "all", "active", "disabled"
  const [viewMode, setViewMode] = useState("active");

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

  // Client-side filtering
  useEffect(() => {
    if (!Array.isArray(people)) {
      setFilteredPeople([]);
      return;
    }

    let filtered = people;

    // Filter by disabled status based on viewMode
    if (viewMode === "active") {
      // Show only active (non-disabled) people
      filtered = filtered.filter((person) => !person.disabled);
      console.log("✅ Showing only ACTIVE people. Count:", filtered.length);
    } else if (viewMode === "disabled") {
      // Show only disabled people
      filtered = filtered.filter((person) => person.disabled);
      console.log("🚫 Showing only DISABLED people. Count:", filtered.length);
    } else {
      // Show all people (both active and disabled)
      console.log("👁️ Showing ALL people (active + disabled). Count:", filtered.length);
    }

    // Filter by search query (client-side only)
    if (searchQuery) {
      filtered = filtered.filter(
        (person) =>
          person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.phone?.includes(searchQuery)
      );
      console.log("🔍 After search filter. Count:", filtered.length);
    }

    setFilteredPeople(filtered);
  }, [searchQuery, people, viewMode]);

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

      const totalCount = peopleData.length;
      const activeCount = peopleData.filter(p => !p.disabled).length;
      const disabledCount = peopleData.filter(p => p.disabled).length;

      console.log("👥 People fetched:", {
        total: totalCount,
        active: activeCount,
        disabled: disabledCount
      });
      
      setPeople(peopleData);

      if (peopleData.length === 0) {
        const filterText =
          selectedCategory !== "all" || selectedBatch !== "all"
            ? " with current filters"
            : "";
        toast.error(`No people found${filterText}`);
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch people data";
      setApiError(errorMessage);
      toast.error(errorMessage);
      setPeople([]);
      setFilteredPeople([]);
    } finally {
      setFetchLoading(false);
    }
  };

  // ========== BACKEND: Add batch ==========
  const handleAddBatch = async () => {
    const { category, batchName } = batchForm;

    if (!batchName.trim()) {
      toast.error("Please enter a batch name");
      return;
    }

    // Validate batch format
    const batchRegex = /^B-\d+$/;
    if (!batchRegex.test(batchName.trim())) {
      toast.error("Batch name must be in format: B-1, B-2, etc.");
      return;
    }

    if (batches[category].includes(batchName.trim())) {
      toast.error(`Batch ${batchName} already exists in ${category}`);
      return;
    }

    try {
      setBatchLoading(true);
      console.log("📡 Adding batch to backend:", { category, batchName });

      const res = await axios.post(`${API_URL}/api/batches`, {
        category,
        batchName: batchName.trim(),
      });

      if (res.data.success) {
        console.log("✅ Batch added successfully");
        const updatedBatches = {
          ...batches,
          [category]: [...batches[category], batchName.trim()].sort(),
        };
        setBatches(updatedBatches);
        saveBatchesToLocalStorage(updatedBatches);
        toast.success(`Batch ${batchName} added to ${category}`);
        setBatchForm({ ...batchForm, batchName: "" });
      }
    } catch (err) {
      console.error("❌ Error adding batch:", err);
      toast.error(err.response?.data?.message || "Failed to add batch");
    } finally {
      setBatchLoading(false);
    }
  };

  // ========== BACKEND: Delete batch ==========
  const handleDeleteBatch = async (category, batchName) => {
    // Check if any person is using this batch
    const isUsed = people.some(
      (person) => person.category === category && person.batch === batchName
    );

    if (isUsed) {
      toast.error(
        `Cannot delete batch ${batchName}. People are assigned to it.`
      );
      return;
    }

    if (!confirm(`Delete batch ${batchName} from ${category}?`)) return;

    try {
      setBatchLoading(true);
      console.log("📡 Deleting batch from backend:", { category, batchName });

      const res = await axios.delete(`${API_URL}/api/batches`, {
        data: { category, batchName },
      });

      if (res.data.success) {
        console.log("✅ Batch deleted successfully");
        const updatedBatches = {
          ...batches,
          [category]: batches[category].filter((b) => b !== batchName),
        };
        setBatches(updatedBatches);
        saveBatchesToLocalStorage(updatedBatches);
        toast.success(`Batch ${batchName} deleted from ${category}`);
      }
    } catch (err) {
      console.error("❌ Error deleting batch:", err);
      toast.error(err.response?.data?.message || "Failed to delete batch");
    } finally {
      setBatchLoading(false);
    }
  };

  // ========== NEW: Toggle disable/enable person ==========
  const handleToggleDisable = async (person) => {
    const newDisabledState = !person.disabled;
    const action = newDisabledState ? "disable" : "enable";
    
    console.log(`🔄 Attempting to ${action} person:`, {
      id: person._id,
      name: person.name,
      currentState: person.disabled ? "disabled" : "enabled",
      newState: newDisabledState ? "disabled" : "enabled"
    });

    if (!confirm(`Are you sure you want to ${action} ${person.name}?`)) {
      console.log("❌ User cancelled the action");
      return;
    }

    try {
      setLoading(true);
      console.log(`📡 Sending ${action} request to backend...`);

      const res = await axios.patch(`${API_URL}/api/people/${person._id}`, {
        disabled: newDisabledState,
      });

      if (res.data.success) {
        console.log(`✅ Person ${action}d successfully:`, res.data);
        
        // Update local state
        const updatedPeople = people.map((p) =>
          p._id === person._id ? { ...p, disabled: newDisabledState } : p
        );
        setPeople(updatedPeople);
        
        toast.success(`${person.name} has been ${action}d successfully`);
        console.log(`✨ Updated people list. Total: ${updatedPeople.length}, Disabled: ${updatedPeople.filter(p => p.disabled).length}`);
      }
    } catch (err) {
      console.error(`❌ Error ${action}ing person:`, err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      toast.error(err.response?.data?.message || `Failed to ${action} person`);
    } finally {
      setLoading(false);
    }
  };

  // ========== BACKEND: Add/Edit person ==========
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.category ||
      !formData.phone
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    // Batch required for FSD and BVOC
    if (
      (formData.category === "FSD" || formData.category === "BVOC") &&
      !formData.batch
    ) {
      toast.error("Please select a batch for FSD/BVOC category");
      return;
    }

    try {
      setLoading(true);

      const personData = {
        name: formData.name.trim(),
        category: formData.category,
        batch: formData.batch || null,
        phone: `+91${formData.phone}`,
      };

      if (isEditMode) {
        console.log("📡 Updating person:", formData._id);
        const res = await axios.put(
          `${API_URL}/api/people/${formData._id}`,
          personData
        );

        if (res.data.success) {
          console.log("✅ Person updated successfully");
          toast.success(`${personData.name} updated successfully`);
          fetchPeople();
          closeModal();
        }
      } else {
        console.log("📡 Adding new person");
        const res = await axios.post(`${API_URL}/api/people`, personData);

        if (res.data.success) {
          console.log("✅ Person added successfully");
          toast.success(`${personData.name} added successfully`);
          fetchPeople();
          closeModal();
        }
      }
    } catch (err) {
      console.error("❌ Submit Error:", err);
      toast.error(
        err.response?.data?.message || "Failed to save person data"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========== BACKEND: Delete person ==========
  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      console.log("📡 Deleting person:", id);

      const res = await axios.delete(`${API_URL}/api/people/${id}`);

      if (res.data.success) {
        console.log("✅ Person deleted successfully");
        toast.success(`${name} deleted successfully`);
        fetchPeople();
      }
    } catch (err) {
      console.error("❌ Delete Error:", err);
      toast.error(err.response?.data?.message || "Failed to delete person");
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormData({
      _id: "",
      name: "",
      category: "",
      batch: "",
      phone: "",
    });
  };

  const openBatchModal = () => setIsBatchModalOpen(true);
  const closeBatchModal = () => {
    setIsBatchModalOpen(false);
    setBatchForm({ category: "FSD", batchName: "" });
  };

  const handleEdit = (person) => {
    console.log("✏️ Editing person:", person);
    setIsEditMode(true);
    setFormData({
      _id: person._id,
      name: person.name,
      category: person.category,
      batch: person.batch || "",
      phone: person.phone.replace("+91", ""),
    });
    openModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, phone: numericValue });
    } else if (name === "category") {
      setFormData({ ...formData, category: value, batch: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getBatchOptions = () => {
    if (formData.category === "FSD") return batches.FSD;
    if (formData.category === "BVOC") return batches.BVOC;
    return [];
  };

  const getCategoryColor = (category) => {
    const colors = {
      code4bharat: "bg-blue-100 text-blue-700 border-blue-200",
      "marketing-junction": "bg-pink-100 text-pink-700 border-pink-200",
      FSD: "bg-purple-100 text-purple-700 border-purple-200",
      BVOC: "bg-green-100 text-green-700 border-green-200",
      HR: "bg-orange-100 text-orange-700 border-orange-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  // Get counts for display
  const totalPeople = people.length;
  const activePeople = people.filter(p => !p.disabled).length;
  const disabledPeople = people.filter(p => p.disabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4 relative">
      <Toaster position="top-right" />

      {/* Back Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboard")}
        className="fixed top-6 left-6 z-50 bg-white text-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all border border-gray-200"
      >
        <ArrowLeft className="w-6 h-6" />
      </motion.button>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Users className="w-12 h-12 text-orange-600" />
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Manage People
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Add, edit, and organize your team members
          </p>
        </motion.div>

        {/* API Error Banner */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Connection Error
              </h3>
              <p className="text-red-700 text-sm">{apiError}</p>
              <button
                onClick={fetchPeople}
                className="mt-2 text-red-600 hover:text-red-800 font-medium text-sm underline"
              >
                Retry Connection
              </button>
            </div>
          </motion.div>
        )}

        {/* Controls Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openModal}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Add New Person
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openBatchModal}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Layers className="w-5 h-5" />
              Manage Batches
            </motion.button>
            
            {/* View Mode Toggle Buttons */}
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setViewMode("active");
                  console.log("🟢 Switched to ACTIVE view mode");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === "active"
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Active ({activePeople})
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setViewMode("disabled");
                  console.log("🔴 Switched to DISABLED view mode");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === "disabled"
                    ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <UserX className="w-4 h-4" />
                Disabled ({disabledPeople})
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setViewMode("all");
                  console.log("👁️ Switched to ALL view mode");
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  viewMode === "all"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Users className="w-4 h-4" />
                All ({totalPeople})
              </motion.button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, category, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedBatch("all");
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800 appearance-none bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Filter */}
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-800 appearance-none bg-white"
                  disabled={
                    selectedCategory !== "FSD" && selectedCategory !== "BVOC"
                  }
                >
                  <option value="all">All Batches</option>
                  {selectedCategory === "FSD" &&
                    batches.FSD.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  {selectedCategory === "BVOC" &&
                    batches.BVOC.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-center"
        >
          <p className="text-gray-600">
            Showing{" "}
            <span className={`font-bold ${
              viewMode === "active" ? "text-green-600" :
              viewMode === "disabled" ? "text-red-600" :
              "text-blue-600"
            }`}>
              {filteredPeople.length}
            </span>{" "}
            {viewMode === "active" ? "active" : 
             viewMode === "disabled" ? "disabled" : 
             "total"} {filteredPeople.length === 1 ? "person" : "people"}
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-500">
              Total: {totalPeople} ({activePeople} active, {disabledPeople} disabled)
            </span>
          </p>
        </motion.div>

        {/* Loading State */}
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading people...</p>
          </div>
        ) : filteredPeople.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            {viewMode === "disabled" ? (
              <UserX className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            ) : (
              <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              {viewMode === "disabled" 
                ? "No Disabled People"
                : viewMode === "active"
                ? "No Active People"
                : "No People Found"}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory !== "all" || selectedBatch !== "all"
                ? "Try adjusting your filters or search query"
                : viewMode === "disabled"
                ? "Great! No one is currently disabled"
                : "Start by adding your first person"}
            </p>
            {!searchQuery && selectedCategory === "all" && selectedBatch === "all" && viewMode === "active" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openModal}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <UserPlus className="w-5 h-5" />
                Add First Person
              </motion.button>
            )}
          </motion.div>
        ) : (
          /* People Grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPeople.map((person, index) => (
              <motion.div
                key={person._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${
                  person.disabled 
                    ? "border-red-200 opacity-75" 
                    : "border-gray-100"
                }`}
              >
                <div className="p-6">
                  {/* Header with Category Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(
                        person.category
                      )}`}
                    >
                      {person.category}
                    </span>
                    {person.disabled && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                        DISABLED
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className={`text-xl font-bold mb-2 truncate ${
                    person.disabled ? "text-gray-500" : "text-gray-800"
                  }`}>
                    {person.name}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    {person.batch && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Layers className="w-4 h-4" />
                        <span className="text-sm">Batch: {person.batch}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="text-sm font-mono">{person.phone}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(person)}
                      disabled={person.disabled}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleToggleDisable(person)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${
                        person.disabled
                          ? "bg-green-50 text-green-600 hover:bg-green-100"
                          : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                      }`}
                    >
                      {person.disabled ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Enable
                        </>
                      ) : (
                        <>
                          <UserX className="w-4 h-4" />
                          Disable
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(person._id, person.name)}
                      className="flex items-center justify-center gap-2 bg-red-50 text-red-600 p-2 rounded-lg font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Add/Edit Person Modal */}
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
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-8 h-8 text-orange-600" />
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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-gray-800"
                    placeholder="John Doe"
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
                    <option value="marketing-junction">Marketing Junction</option>
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

      {/* Batch Management Modal */}
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