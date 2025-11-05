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
  ArrowLeft,
  UserX,
  UserCheck,
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
  originalName: "", // Add this - for searching in backend
  originalPhone: "", // Add this - backup search field
  name: "",
  category: "",
  batch: "",
  phone: "",
  parentPhone1: "",
  parentPhone2: "",
  aadhaarCard: "",
  address: "",
});

  const MAX_NAME_LENGTH = 50;
  const MAX_ADDRESS_LENGTH = 100;
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

  useEffect(() => {
    console.log("🔍 API_URL:", API_URL);
    if (!API_URL) {
      console.error("❌ API_URL is not defined! Check your .env.local file");
      setApiError(
        "API URL not configured. Please set NEXT_PUBLIC_API_URL in .env.local"
      );
    }
  }, [API_URL]);

  useEffect(() => {
    if (API_URL) {
      fetchPeople();
      loadBatchesFromBackend();
    }
  }, [API_URL]);

  useEffect(() => {
    if (API_URL) {
      fetchPeople();
    }
  }, [selectedCategory, selectedBatch]);

  useEffect(() => {
    if (!Array.isArray(people)) {
      setFilteredPeople([]);
      return;
    }

    let filtered = people;

    if (viewMode === "active") {
      filtered = filtered.filter((person) => !person.disabled);
    } else if (viewMode === "disabled") {
      filtered = filtered.filter((person) => person.disabled);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (person) =>
          person.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          person.phone?.includes(searchQuery)
      );
    }

    setFilteredPeople(filtered);
  }, [searchQuery, people, viewMode]);

  const loadBatchesFromBackend = async () => {
    if (!API_URL) return;

    try {
      console.log("📡 Fetching batches from backend...");
      const res = await axios.get(`${API_URL}/api/batches`);

      if (res.data.success && res.data.batches) {
        console.log("✅ Batches loaded:", res.data.batches);
        setBatches(res.data.batches);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "customBatches",
            JSON.stringify(res.data.batches)
          );
        }
      }
    } catch (err) {
      console.error("❌ Error loading batches:", err);
      loadBatchesFromLocalStorage();
    }
  };

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

  const saveBatchesToLocalStorage = (newBatches) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("customBatches", JSON.stringify(newBatches));
    }
  };

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

      let url = `${API_URL}/api/people`;
      const params = new URLSearchParams();

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

      let peopleData = [];
      if (res.data.success && Array.isArray(res.data.names)) {
        peopleData = res.data.names;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        peopleData = res.data.data;
      } else if (Array.isArray(res.data)) {
        peopleData = res.data;
      }

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

  const handleAddBatch = async () => {
    const { category, batchName } = batchForm;

    if (!batchName.trim()) {
      toast.error("Please enter a batch name");
      return;
    }

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

  const handleDeleteBatch = async (category, batchName) => {
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

  const handleToggleDisable = async (person) => {
    const newDisabledState = !person.disabled;
    const action = newDisabledState ? "disable" : "enable";

    if (!confirm(`Are you sure you want to ${action} ${person.name}?`)) {
      return;
    }

    try {
      setLoading(true);

      const res = await axios.patch(`${API_URL}/api/people/${person._id}`, {
        disabled: newDisabledState,
      });

      if (res.data.success) {
        const updatedPeople = people.map((p) =>
          p._id === person._id ? { ...p, disabled: newDisabledState } : p
        );
        setPeople(updatedPeople);

        toast.success(`${person.name} has been ${action}d successfully`);
      }
    } catch (err) {
      console.error(`❌ Error ${action}ing person:`, err);
      toast.error(err.response?.data?.message || `Failed to ${action} person`);
    } finally {
      setLoading(false);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.category || !formData.phone) {
    toast.error("Please fill all required fields");
    return;
  }

  if (!/^[0-9]{10}$/.test(formData.phone)) {
    toast.error("Phone number must be exactly 10 digits");
    return;
  }

  if (formData.parentPhone1 && !/^[0-9]{10}$/.test(formData.parentPhone1)) {
    toast.error("Parent 1's phone number must be exactly 10 digits");
    return;
  }

  if (formData.parentPhone2 && !/^[0-9]{10}$/.test(formData.parentPhone2)) {
    toast.error("Parent 2's phone number must be exactly 10 digits");
    return;
  }

  if (formData.aadhaarCard && !/^[0-9]{12}$/.test(formData.aadhaarCard)) {
    toast.error("Aadhaar card number must be exactly 12 digits");
    return;
  }

  if (formData.address && formData.address.length > MAX_ADDRESS_LENGTH) {
    toast.error(`Address must not exceed ${MAX_ADDRESS_LENGTH} characters`);
    return;
  }

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
      phone: `${formData.phone}`, // 10 digits without 91
      parentPhone1: formData.parentPhone1 ? `${formData.parentPhone1}` : null,
      parentPhone2: formData.parentPhone2 ? `${formData.parentPhone2}` : null,
      aadhaarCard: formData.aadhaarCard ? `${formData.aadhaarCard}` : null,
      address: formData.address ? formData.address.trim() : null,
    };

    if (isEditMode) {
      // Edit mode - name se search karke update karo
      console.log("📡 Updating person by name:", formData.originalName);
      console.log("📱 Original phone:", formData.originalPhone);
      console.log("📱 New phone:", personData.phone);
      
      const updateData = {
        originalName: formData.originalName,
        originalPhone: formData.originalPhone, // This should have 91 prefix already
        ...personData,
      };

      console.log("📤 Sending update data:", updateData);

      const res = await axios.put(
        `${API_URL}/api/people/update-by-name`,
        updateData
      );

      if (res.data.success) {
        console.log("✅ Person updated successfully");
        toast.success(`${personData.name} updated successfully`);
        fetchPeople();
        closeModal();
      }
    } else {
      // Add mode - new person add karo
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
    console.error("❌ Error response:", err.response?.data);
    
    // Show detailed error message
    const errorMessage = err.response?.data?.message || "Failed to save person data";
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

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

  const openModal = () => setIsModalOpen(true);
 const closeModal = () => {
  setIsModalOpen(false);
  setIsEditMode(false);
  setFormData({
    originalName: "", // Add this
    originalPhone: "", // Add this
    name: "",
    category: "",
    batch: "",
    phone: "",
    parentPhone1: "",
    parentPhone2: "",
    aadhaarCard: "",
    address: "",
  });
};
  const openBatchModal = () => setIsBatchModalOpen(true);
  const closeBatchModal = () => {
    setIsBatchModalOpen(false);
    setBatchForm({ category: "FSD", batchName: "" });
  };

const handleEdit = (person) => {
  console.log("✏️ Editing person:", person);
  console.log("📝 Person name:", person.name);
  console.log("📱 Original phone:", person.phone);
  
  // Helper function to remove 91 prefix properly
  const cleanPhoneNumber = (phone) => {
    if (!phone) return "";
    const cleaned = phone.toString().replace(/^(\+?91|0091)/, "").trim();
    console.log(`Cleaning phone: "${phone}" → "${cleaned}"`);
    return cleaned;
  };
  
  // Verify name exists
  if (!person.name) {
    console.error("❌ Person name is missing!");
    toast.error("Cannot edit: Person name is missing");
    return;
  }
  
  setIsEditMode(true);
  
  const cleanedData = {
    originalName: person.name, // Original name for searching
    originalPhone: person.phone, // Original phone for backup search
    name: person.name,
    category: person.category,
    batch: person.batch || "",
    phone: cleanPhoneNumber(person.phone),
    parentPhone1: cleanPhoneNumber(person.parentPhone1),
    parentPhone2: cleanPhoneNumber(person.parentPhone2),
    aadhaarCard: person.aadhaarCard || "",
    address: person.address || "",
  };
  
  console.log("✅ Cleaned form data:", cleanedData);
  setFormData(cleanedData);
  openModal();
};
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" || name === "parentPhone1" || name === "parentPhone2") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
    } else if (name === "aadhaarCard") {
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue });
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

  const totalPeople = people.length;
  const activePeople = people.filter(p => !p.disabled).length;
  const disabledPeople = people.filter(p => p.disabled).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4 relative">
      <Toaster position="top-right" />

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => router.push("/dashboard")}
        className="fixed top-6 left-6 z-50 bg-white text-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all border border-gray-200"
      >
        <ArrowLeft className="w-6 h-6" />
      </motion.button>

      <div className="max-w-7xl mx-auto">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
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

            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("active")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === "active"
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
                onClick={() => setViewMode("disabled")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === "disabled"
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
                onClick={() => setViewMode("all")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${viewMode === "all"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Users className="w-4 h-4" />
                All ({totalPeople})
              </motion.button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-center"
        >
          <p className="text-gray-600">
            Showing{" "}
            <span className={`font-bold ${viewMode === "active" ? "text-green-600" :
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

        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Loading people...</p>
          </div>
        ) : (
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
                className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${person.disabled
                    ? "border-red-200 opacity-75"
                    : "border-gray-100"
                  }`}
              >
                <div className="p-6">
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

                  <h3 className={`text-xl font-bold mb-2 truncate ${person.disabled ? "text-gray-500" : "text-gray-800"
                    }`}>
                    {person.name}
                  </h3>

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
                    {person.aadhaarCard && (
                      <div className="flex items-center gap-2 text-indigo-600">
                        <span className="text-xs bg-indigo-50 px-2 py-1 rounded-md font-semibold">🆔 Aadhaar: {person.aadhaarCard}</span>
                      </div>
                    )}
                    {person.address && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <span className="text-xs bg-gray-50 px-2 py-1 rounded-md">📍 {person.address}</span>
                      </div>
                    )}
                    {person.parentPhone1 && (
                      <div className="flex items-center gap-2 text-green-600">
                        <span className="text-xs bg-green-50 px-2 py-1 rounded-md font-semibold">👨 Parent 1: {person.parentPhone1}</span>
                      </div>
                    )}
                    {person.parentPhone2 && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <span className="text-xs bg-blue-50 px-2 py-1 rounded-md font-semibold">👩 Parent 2: {person.parentPhone2}</span>
                      </div>
                    )}
                  </div>

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
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors ${person.disabled
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
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 max-h-[90vh] overflow-y-auto"
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
                    maxLength={MAX_NAME_LENGTH}
                    required
                  />
                </div>

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

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Aadhaar Card Number{" "}
                    <span className="text-sm text-gray-500">
                      (Optional - 12 digits)
                    </span>
                  </label>
                  <input
                    type="tel"
                    name="aadhaarCard"
                    value={formData.aadhaarCard}
                    onChange={handleChange}
                    className="w-full border border-indigo-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800 bg-indigo-50"
                    placeholder="123456789012"
                    maxLength="12"
                    pattern="[0-9]{12}"
                  />
                  <p className="text-xs text-indigo-600 mt-1">
                    🆔 Enter 12-digit Aadhaar number
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Address{" "}
                    <span className="text-sm text-gray-500">
                      (Optional - max 100 characters)
                    </span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none text-gray-800 resize-none"
                    placeholder="Enter full address..."
                    maxLength={MAX_ADDRESS_LENGTH}
                    rows="3"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {formData.address.length}/{MAX_ADDRESS_LENGTH} characters
                  </p>
                </div>

                {formData.category === "BVOC" && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Parent 1's Phone Number{" "}
                        <span className="text-sm text-gray-500">
                          (Optional - 10 digits)
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="parentPhone1"
                        value={formData.parentPhone1}
                        onChange={handleChange}
                        className="w-full border border-green-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none text-gray-800 bg-green-50"
                        placeholder="9876543210"
                        maxLength="10"
                        pattern="[0-9]{10}"
                      />
                      <p className="text-xs text-green-600 mt-1">
                        👨 First parent's contact
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Parent 2's Phone Number{" "}
                        <span className="text-sm text-gray-500">
                          (Optional - 10 digits)
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="parentPhone2"
                        value={formData.parentPhone2}
                        onChange={handleChange}
                        className="w-full border border-blue-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 bg-blue-50"
                        placeholder="9876543210"
                        maxLength="10"
                        pattern="[0-9]{10}"
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        👩 Second parent's contact
                      </p>
                    </div>
                  </>
                )}

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

              <div className="space-y-6">
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
  );}
// } filteredPeople.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center py-20"
//           >
//             {viewMode === "disabled" ? (
//               <UserX className="w-24 h-24 text-gray-300 mx-auto mb-4" />
//             ) : (
//               <Users className="w-24 h-24 text-gray-300 mx-auto mb-4" />
//             )}
//             <h3 className="text-2xl font-bold text-gray-700 mb-2">
//               {viewMode === "disabled"
//                 ? "No Disabled People"
//                 : viewMode === "active"
//                   ? "No Active People"
//                   : "No People Found"}
//             </h3>
//             <p className="text-gray-500 mb-6">
//               {searchQuery || selectedCategory !== "all" || selectedBatch !== "all"
//                 ? "Try adjusting your filters or search query"
//                 : viewMode === "disabled"
//                   ? "Great! No one is currently disabled"
//                   : "Start by adding your first person"}
//             </p>
//             {!searchQuery && selectedCategory === "all" && selectedBatch === "all" && viewMode === "active" && (
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={openModal}
//                 className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
//               >
//                 <UserPlus className="w-5 h-5" />
//                 Add First Person
//               </motion.button>
//             )}
//           </motion.div>
//         ) :