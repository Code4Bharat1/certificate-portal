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
  Tag,
  CheckCircle,
  Loader2,
  Layers,
  Plus,
  AlertCircle,
  Filter,
  ArrowLeft,
  UserX,
  UserCheck,
  Upload,
  Download,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

// ✅ UTILITY FUNCTIONS (no component state)
const normalizeCategory = (category) => {
  if (!category) return "";
  const lower = category.toLowerCase().trim();
  const categoryMap = {
    "it-nexcore": "IT-Nexcore",
    itnexcore: "IT-Nexcore",
    code4bharat: "Code4Bharat",
    "code 4 bharat": "Code4Bharat",
    "marketing-junction": "marketing-junction",
    marketingjunction: "marketing-junction",
    fsd: "FSD",
    bvoc: "BVOC",
    hr: "HR",
    dm: "DM",
    // od: "OD",
    "operations department": "Operations Department",
    // operationsdepartment: "OD",
    client: "client",
  };
  return categoryMap[lower] || category;
};

// const getCategoryDisplayName = (category) => {
//   const displayMap = {
//     "IT-Nexcore": "IT-Nexcore",
//     Code4Bharat: "Code4Bharat",
//     "marketing-junction": "Marketing Junction",
//     FSD: "FSD",
//     BVOC: "BVOC",
//     HR: "HR",
//     DM: "DM",
//     OD: "Operations Department",
//     client: "Client",
//   };
//   return displayMap[category] || category;
// };

// ✅ MAIN COMPONENT


export default function ManagePeople() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ✅ ALL STATE DECLARATIONS
  const [people, setPeople] = useState([]);
  const [dynamicCategories, setDynamicCategories] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBatch, setSelectedBatch] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [batchLoading, setBatchLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [bulkFile, setBulkFile] = useState(null);
  const [batches, setBatches] = useState({ FSD: [], BVOC: [] });
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [viewMode, setViewMode] = useState("active");
  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [editingBatchData, setEditingBatchData] = useState({
    category: "",
    oldBatchName: "",
    newBatchName: "",
    month: "June",
    year: "2025",
  });

  const [batchForm, setBatchForm] = useState({
    category: "FSD",
    batchName: "",
    month: "June",
    year: "2025",
  });

  const [formData, setFormData] = useState({
    originalName: "",
    originalPhone: "",
    name: "",
    category: "",
    batch: "",
    phone: "",
    parentPhone1: "",
    parentPhone2: "",
    aadhaarCard: "",
    address: "",
    email: "",
    parentEmail: "",
    clientEmail1: "",
    clientEmail2: "",
    clientPhone1: "",
    clientPhone2: "",
  });

  const MAX_NAME_LENGTH = 50;
  const MAX_ADDRESS_LENGTH = 200;

  // ✅ USEEFFECT HOOKS
  useEffect(() => {
    if (!API_URL) {
      console.error("❌ API_URL not defined");
      setApiError("API URL not configured");
    } else {
      fetchPeople();
      loadCategories();
      loadBatchesFromBackend();
    }
  }, [API_URL]);

  useEffect(() => {
    let filtered = [...people];

    if (viewMode === "active") filtered = filtered.filter((p) => !p.disabled);
    else if (viewMode === "disabled")
      filtered = filtered.filter((p) => p.disabled);

    if (selectedCategory !== "all") {
      const normalizedSelected = normalizeCategory(selectedCategory);
      filtered = filtered.filter((p) => {
        const normalizedPersonCategory = normalizeCategory(p.category);
        return normalizedPersonCategory === normalizedSelected;
      });
    }

    if (selectedBatch !== "all")
      filtered = filtered.filter((p) => p.batch === selectedBatch);

    if (searchQuery)
      filtered = filtered.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.phone?.includes(searchQuery)
      );

    setFilteredPeople(filtered);
  }, [people, searchQuery, selectedCategory, selectedBatch, viewMode]);

  // ✅ ALL FUNCTION DECLARATIONS
  const loadCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      if (res.data.success) setDynamicCategories(res.data.categories);
    } catch (err) {
      console.error("❌ Error loading categories:", err);
    }
  };

  const fetchPeople = async () => {
    if (!API_URL) return;
    try {
      setFetchLoading(true);
      const res = await axios.get(`${API_URL}/api/people/`);
      const peopleData = res.data.names || res.data.data || [];
      if (res.data.success) setPeople(peopleData);
      else toast.error("Failed to load people");
    } catch (err) {
      console.error("❌ Fetch error:", err);
      toast.error("Failed to fetch people");
    } finally {
      setFetchLoading(false);
    }
  };

  const loadBatchesFromBackend = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/batches`);
      if (res.data.success) setBatches(res.data.batches);
    } catch (err) {
      console.error("❌ Error loading batches:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      name,
      category,
      batch,
      phone,
      parentPhone1,
      parentPhone2,
      aadhaarCard,
      address,
      email,
      parentEmail,
      clientEmail1,
      clientEmail2,
      clientPhone1,
      clientPhone2,
    } = formData;

    if (!name || !category || !phone)
      return toast.error("Missing required fields");
    if (!/^\d{10}$/.test(phone)) return toast.error("Phone must be 10 digits");

    const normalizedCategory = normalizeCategory(category);

    if (
      (normalizedCategory === "FSD" || normalizedCategory === "BVOC") &&
      !batch
    )
      return toast.error("Select a batch for this category");

    const payload = {
      name: name.trim(),
      category: normalizedCategory,
      batch: batch || null,
      phone,
      parentPhone1: parentPhone1 || null,
      parentPhone2: parentPhone2 || null,
      aadhaarCard: aadhaarCard || null,
      address: address?.trim() || null,
      email: email || null,
      parentEmail: parentEmail || null,
      clientEmail1: clientEmail1 || null,
      clientEmail2: clientEmail2 || null,
      clientPhone1: clientPhone1 || null,
      clientPhone2: clientPhone2 || null,
    };

    try {
      setLoading(true);
      if (isEditMode) {
        const res = await axios.put(`${API_URL}/api/people/update-by-name`, {
          originalName: formData.originalName,
          originalPhone: formData.originalPhone,
          ...payload,
        });
        if (res.data.success) toast.success(`${name} updated`);
      } else {
        const res = await axios.post(`${API_URL}/api/people`, payload);
        if (res.data.success) toast.success(`${name} added`);
      }
      fetchPeople();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save data");
    } finally {
      setLoading(false);
    }
  };

  const getBatchOptions = () => {
    const normalizedCategory = normalizeCategory(formData.category);
    if (normalizedCategory === "FSD") return batches.FSD || [];
    if (normalizedCategory === "BVOC") return batches.BVOC || [];
    return [];
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setFormData({
      originalName: "",
      originalPhone: "",
      name: "",
      category: "",
      batch: "",
      phone: "",
      parentPhone1: "",
      parentPhone2: "",
      aadhaarCard: "",
      address: "",
      email: "",
      parentEmail: "",
      clientEmail1: "",
      clientEmail2: "",
      clientPhone1: "",
      clientPhone2: "",
    });
  };

  const closeBatchModal = () => setIsBatchModalOpen(false);
  const closeBulkUpload = () => {
    setShowBulkUpload(false);
    setBulkFile(null);
  };

  const handleAddBatch = async () => {
    const { category, batchName, month, year } = batchForm;

    if (!batchName.trim()) return toast.error("Enter a batch name");
    if (!/^B-\d+$/.test(batchName.trim()))
      return toast.error("Batch must be in format: B-1, B-2");

    const fullName =
      category === "FSD"
        ? `${batchName.trim()} (${month}-${year})`
        : `${batchName.trim()} ${year}`;

    if (batches[category]?.includes(fullName))
      return toast.error(`Batch ${fullName} already exists`);

    try {
      setBatchLoading(true);
      const res = await axios.post(`${API_URL}/api/batches`, {
        category,
        batchName: fullName,
      });
      if (res.data.success) {
        toast.success(`Batch ${fullName} added`);
        setBatches({
          ...batches,
          [category]: [...batches[category], fullName],
        });
        setBatchForm({ ...batchForm, batchName: "" });
      }
    } catch (err) {
      toast.error("Failed to add batch");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDeleteBatch = async (category, batchName) => {
    if (!confirm(`Delete ${batchName}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/batches`, {
        data: { category, batchName },
      });
      toast.success(`Batch ${batchName} deleted`);
      setBatches({
        ...batches,
        [category]: batches[category].filter((b) => b !== batchName),
      });
    } catch (err) {
      toast.error("Failed to delete batch");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      return toast.error("Category name is required");
    }

    try {
      const res = await axios.post(`${API_URL}/api/categories`, {
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim(),
      });

      if (res.data.success) {
        toast.success(`Category "${newCategoryName}" added successfully`);
        loadCategories();
        setShowAddCategory(false);
        setNewCategoryName("");
        setNewCategoryDesc("");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add category");
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await axios.delete(`${API_URL}/api/people/${id}`);
      toast.success(`${name} deleted`);
      fetchPeople();
    } catch {
      toast.error("Failed to delete person");
    }
  };

  const handleToggleDisable = async (person) => {
    const newDisabled = !person.disabled;
    if (!confirm(`${newDisabled ? "Disable" : "Enable"} ${person.name}?`))
      return;
    try {
      await axios.patch(`${API_URL}/api/people/${person.name}`, {
        disabled: newDisabled,
      });
      toast.success(`${person.name} ${newDisabled ? "disabled" : "enabled"}`);
      fetchPeople();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/people/bulk-upload`,
        formDataUpload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (res.data.success) {
        toast.success(`Bulk upload successful (${res.data.count} records)`);
        fetchPeople();
      } else toast.error("Bulk upload failed");
    } catch (err) {
      console.error("❌ Bulk upload error:", err);
      toast.error(err.response?.data?.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Code4Bharat: "bg-blue-100 text-blue-700 border-blue-200",
      "IT-Nexcore": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "marketing-junction": "bg-pink-100 text-pink-700 border-pink-200",
      FSD: "bg-purple-100 text-purple-700 border-purple-200",
      BVOC: "bg-green-100 text-green-700 border-green-200",
      HR: "bg-orange-100 text-orange-700 border-orange-200",
      DM: "bg-yellow-100 text-yellow-700 border-yellow-200",
      OD: "bg-teal-100 text-teal-700 border-teal-200",
    };
    return colors[category] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "phone" ||
      name === "parentPhone1" ||
      name === "parentPhone2" ||
      name === "clientPhone1" ||
      name === "clientPhone2"
    ) {
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

  const handleEditBatch = (category, batchName) => {
    let month = "June";
    let year = "2025";
    let batchNumber = "";

    if (category === "FSD") {
      const match = batchName.match(/^(B-\d+)\s+\(([A-Za-z]+)-(\d{4})\)$/);
      if (match) {
        batchNumber = match[1];
        month = match[2];
        year = match[3];
      }
    } else if (category === "BVOC") {
      const match = batchName.match(/^(B-\d+)\s+(\d{4})$/);
      if (match) {
        batchNumber = match[1];
        year = match[2];
      }
    }

    setEditingBatchData({
      category,
      oldBatchName: batchName,
      newBatchName: batchNumber,
      month,
      year,
    });
    setIsEditingBatch(true);
  };

  const handleUpdateBatch = async () => {
    const { category, oldBatchName, newBatchName, month, year } =
      editingBatchData;

    if (!newBatchName.trim()) return toast.error("Enter a batch name");
    if (!/^B-\d+$/.test(newBatchName.trim()))
      return toast.error("Batch must be in format: B-1, B-2");

    const fullNewName =
      category === "FSD"
        ? `${newBatchName.trim()} (${month}-${year})`
        : `${newBatchName.trim()} ${year}`;

    if (
      fullNewName !== oldBatchName &&
      batches[category]?.includes(fullNewName)
    ) {
      return toast.error(`Batch ${fullNewName} already exists`);
    }

    try {
      setBatchLoading(true);
      const res = await axios.put(`${API_URL}/api/batches/update-by-name`, {
        category,
        oldBatchName,
        newBatchName: fullNewName,
      });

      if (res.data.success) {
        toast.success(`Batch updated: ${oldBatchName} → ${fullNewName}`);
        setBatches({
          ...batches,
          [category]: batches[category].map((b) =>
            b === oldBatchName ? fullNewName : b
          ),
        });
        fetchPeople();
        setIsEditingBatch(false);
        setEditingBatchData({
          category: "",
          oldBatchName: "",
          newBatchName: "",
          month: "June",
          year: "2025",
        });
      }
    } catch (err) {
      console.error("❌ Error updating batch:", err);
      toast.error(err.response?.data?.message || "Failed to update batch");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleEdit = (person) => {
    setFormData({
      originalName: person.name,
      originalPhone: person.phone,
      name: person.name,
      category: person.category,
      batch: person.batch || "",
      email: person.email || "",
      parentEmail: person.parentEmail || "",
      phone: person.phone,
      parentPhone1: person.parentPhone1 || "",
      parentPhone2: person.parentPhone2 || "",
      aadhaarCard: person.aadhaarCard || "",
      address: person.address || "",
      clientEmail1: person.clientEmail1 || "",
      clientEmail2: person.clientEmail2 || "",
      clientPhone1: person.clientPhone1 || "",
      clientPhone2: person.clientPhone2 || "",
    });

    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const totalPeople = people.length;
  const activePeople = people.filter((p) => !p.disabled).length;
  const disabledPeople = people.filter((p) => p.disabled).length;

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-orange-50 via-white to-red-50 py-8 px-4">
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
            Add, edit, and organize your team with bulk upload support
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 space-y-4"
        >
          <div className="flex flex-wrap gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <UserPlus className="w-5 h-5" />
              Add Person
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsBatchModalOpen(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <Layers className="w-5 h-5" />
              Manage Batches
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddCategory(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
            >
              <Tag className="w-5 h-5" />
              Add Category
            </motion.button>

            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-lg border border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode("active")}
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
                onClick={() => setViewMode("disabled")}
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
                onClick={() => setViewMode("all")}
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

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setSelectedBatch("all");
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl"
                >
                  <option value="all">All Categories</option>
                  {dynamicCategories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                  disabled={
                    selectedCategory !== "FSD" && selectedCategory !== "BVOC"
                  }
                >
                  <option value="all">All Batches</option>
                  {selectedCategory === "FSD" &&
                    batches.FSD?.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch}
                      </option>
                    ))}
                  {selectedCategory === "BVOC" &&
                    batches.BVOC?.map((batch) => (
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
            <span
              className={`font-bold ${
                viewMode === "active"
                  ? "text-green-600"
                  : viewMode === "disabled"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {filteredPeople.length}
            </span>{" "}
            {viewMode === "active"
              ? "active"
              : viewMode === "disabled"
              ? "disabled"
              : "total"}{" "}
            {filteredPeople.length === 1 ? "person" : "people"}
            <span className="text-gray-400 mx-2">•</span>
            <span className="text-gray-500">
              Total: {totalPeople} ({activePeople} active, {disabledPeople}{" "}
              disabled)
            </span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeople.map((person, index) => (
            <motion.div
              key={person._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border ${
                person.disabled
                  ? "border-red-200 opacity-75"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryColor(
                    person.category
                  )}`}
                >
                  {person.category}
                </span>
                {person.disabled && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    DISABLED
                  </span>
                )}
              </div>

              <h3
                className={`text-xl font-bold mb-2 ${
                  person.disabled ? "text-gray-500" : "text-gray-800"
                }`}
              >
                {person.name}
              </h3>

              <div className="space-y-2 mb-4">
                {person.batch && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Batch: {person.batch}</span>
                  </div>
                )}
                <div className="text-sm text-gray-600 font-mono">
                  {person.phone}
                </div>
                {person.email && (
                  <div className="text-xs bg-indigo-50 px-2 py-1 rounded-md text-indigo-600 font-semibold">
                    Email: {person.email}
                  </div>
                )}
                {person.aadhaarCard && (
                  <div className="text-xs bg-indigo-50 px-2 py-1 rounded-md text-indigo-600 font-semibold">
                    🆔 Aadhaar: {person.aadhaarCard}
                  </div>
                )}
                {person.address && (
                  <div className="text-xs bg-gray-50 px-2 py-1 rounded-md text-gray-600">
                    📍 {person.address}
                  </div>
                )}
                {person.parentPhone1 && (
                  <div className="text-xs bg-green-50 px-2 py-1 rounded-md text-green-600 font-semibold">
                    👨 Parent 1: {person.parentPhone1}
                  </div>
                )}
                {person.parentPhone2 && (
                  <div className="text-xs bg-blue-50 px-2 py-1 rounded-md text-blue-600 font-semibold">
                    👩 Parent 2: {person.parentPhone2}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(person)}
                  disabled={person.disabled}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-100 disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleToggleDisable(person)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium ${
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
                </button>
                <button
                  onClick={() => handleDelete(person._id, person.name)}
                  className="flex items-center justify-center bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add/Edit Person Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  {isEditMode ? "Edit Person" : "Add Person"}
                </h2>
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
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
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
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  >
                    <option value="">Select</option>
                    {dynamicCategories.map((cat) => (
                      <option key={cat._id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
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
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                      required
                    >
                      <option value="">Select batch</option>
                      {getBatchOptions().map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Phone *{" "}
                    <span className="text-sm text-gray-500">(10 digits)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                    maxLength={10}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Aadhaar{" "}
                    <span className="text-sm text-gray-500">(12 digits)</span>
                  </label>
                  <input
                    type="tel"
                    name="aadhaarCard"
                    value={formData.aadhaarCard}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    maxLength={12}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Address{" "}
                    <span className="text-sm text-gray-500">(max 200)</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                    maxLength={MAX_ADDRESS_LENGTH}
                    rows={3}
                  />
                </div>

                {formData.category === "BVOC" && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Parent Email *
                      </label>
                      <input
                        type="email"
                        name="parentEmail"
                        value={formData.parentEmail}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                        required={formData.category === "BVOC"}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Parent 1 Phone{" "}
                        <span className="text-sm text-gray-500">
                          (10 digits)
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="parentPhone1"
                        value={formData.parentPhone1}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Parent 2 Phone{" "}
                        <span className="text-sm text-gray-500">
                          (10 digits)
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="parentPhone2"
                        value={formData.parentPhone2}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        maxLength={10}
                      />
                    </div>
                  </>
                )}

                {formData.category === "Client" && (
                  <>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Client Email 1
                      </label>
                      <input
                        type="email"
                        name="clientEmail1"
                        value={formData.clientEmail1}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Client Email 2
                      </label>
                      <input
                        type="email"
                        name="clientEmail2"
                        value={formData.clientEmail2}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Client Phone 1{" "}
                        <span className="text-sm text-gray-500">
                          (10 digits)
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="clientPhone1"
                        value={formData.clientPhone1}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        maxLength={10}
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Client Phone 2{" "}
                        <span className="text-sm text-gray-500">
                          (10 digits)
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="clientPhone2"
                        value={formData.clientPhone2}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        maxLength={10}
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <CheckCircle className="w-6 h-6" />
                  )}
                  {isEditMode ? "Update" : "Add"} Person
                </button>
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
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={closeBatchModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  Manage Batches
                </h2>
                <button
                  onClick={closeBatchModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Batch
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Category
                    </label>
                    <select
                      value={batchForm.category}
                      onChange={(e) =>
                        setBatchForm({ ...batchForm, category: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="FSD">FSD</option>
                      <option value="BVOC">BVOC</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Batch Number{" "}
                      <span className="text-sm text-gray-500">
                        (e.g., B-1, B-2)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={batchForm.batchName}
                      onChange={(e) =>
                        setBatchForm({
                          ...batchForm,
                          batchName: e.target.value,
                        })
                      }
                      placeholder="B-1"
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  {batchForm.category === "FSD" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">
                          Month
                        </label>
                        <select
                          value={batchForm.month}
                          onChange={(e) =>
                            setBatchForm({
                              ...batchForm,
                              month: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                          {[
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December",
                          ].map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-1">
                          Year
                        </label>
                        <input
                          type="text"
                          value={batchForm.year}
                          onChange={(e) =>
                            setBatchForm({ ...batchForm, year: e.target.value })
                          }
                          className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {batchForm.category === "BVOC" && (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={batchForm.year}
                        onChange={(e) =>
                          setBatchForm({ ...batchForm, year: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleAddBatch}
                    disabled={batchLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {batchLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    Add Batch
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-600" />
                    FSD Batches
                  </h3>
                  <div className="space-y-2">
                    {batches.FSD?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No FSD batches yet
                      </p>
                    ) : (
                      batches.FSD?.map((batch) => (
                        <div
                          key={batch}
                          className="flex items-center justify-between bg-purple-50 rounded-xl p-4 border border-purple-200"
                        >
                          <span className="font-semibold text-gray-800">
                            {batch}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditBatch("FSD", batch)}
                              className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                              title="Edit Batch"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch("FSD", batch)}
                              className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-green-600" />
                    BVOC Batches
                  </h3>
                  <div className="space-y-2">
                    {batches.BVOC?.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">
                        No BVOC batches yet
                      </p>
                    ) : (
                      batches.BVOC?.map((batch) => (
                        <div
                          key={batch}
                          className="flex items-center justify-between bg-green-50 rounded-xl p-4 border border-green-200"
                        >
                          <span className="font-semibold text-gray-800">
                            {batch}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditBatch("BVOC", batch)}
                              className="text-blue-600 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                              title="Edit Batch"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch("BVOC", batch)}
                              className="text-red-600 hover:bg-red-100 p-2 rounded-lg transition-colors"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Batch Modal */}
      <AnimatePresence>
        {isEditingBatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"
            onClick={() => setIsEditingBatch(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Edit Batch</h2>
                <button
                  onClick={() => setIsEditingBatch(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-4 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Current:</span>{" "}
                  {editingBatchData.oldBatchName}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingBatchData.category}
                    disabled
                    className="w-full border border-gray-300 rounded-xl p-3 bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Batch Number{" "}
                    <span className="text-sm text-gray-500">
                      (e.g., B-1, B-2)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editingBatchData.newBatchName}
                    onChange={(e) =>
                      setEditingBatchData({
                        ...editingBatchData,
                        newBatchName: e.target.value,
                      })
                    }
                    placeholder="B-1"
                    className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {editingBatchData.category === "FSD" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Month
                      </label>
                      <select
                        value={editingBatchData.month}
                        onChange={(e) =>
                          setEditingBatchData({
                            ...editingBatchData,
                            month: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ].map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        value={editingBatchData.year}
                        onChange={(e) =>
                          setEditingBatchData({
                            ...editingBatchData,
                            year: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {editingBatchData.category === "BVOC" && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">
                      Year
                    </label>
                    <input
                      type="text"
                      value={editingBatchData.year}
                      onChange={(e) =>
                        setEditingBatchData({
                          ...editingBatchData,
                          year: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}

                <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                  <p className="text-sm text-yellow-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      This will update the batch name for all people assigned to
                      this batch.
                    </span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditingBatch(false)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateBatch}
                    disabled={batchLoading}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {batchLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Update Batch
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddCategory(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                  Add Category
                </h2>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold text-gray-700">
                    Description (optional)
                  </label>
                  <textarea
                    placeholder="Short description..."
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24"
                  ></textarea>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="w-1/2 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleAddCategory}
                  className="w-1/2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
                >
                  Add Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
