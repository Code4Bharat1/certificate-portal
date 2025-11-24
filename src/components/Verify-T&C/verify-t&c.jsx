"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  Eye,
  ChevronRight,
  Filter,
  Calendar,
  Building2,
  Mail,
  User,
  Edit3,
  Trash2,
  Save
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminOnboardingRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5235';

  // Controls
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modal / approval flow
  const [selectedReq, setSelectedReq] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [modalMode, setModalMode] = useState("approve"); // "approve" or "edit"
  const [form, setForm] = useState({
    department: "",
    joiningDate: "",
    notes: "",
  });

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const checklistItems = useMemo(
    () => [
      "Personal Information Verified",
      "ID & Address Proof Collected",
      "Offer Letter Signed",
      "NDA Signed",
      "Bank Details Submitted",
      "Emergency Contact Updated",
      "Employee Email Created",
      "Laptop & System Issued",
      "Access Permissions Given",
      "Orientation Completed",
    ],
    []
  );

  const [checklist, setChecklist] = useState(
    checklistItems.map((it) => ({ label: it, checked: false }))
  );

  // Debounce query
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedQuery(query.trim().toLowerCase()),
      350
    );
    return () => clearTimeout(t);
  }, [query]);

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/onboarding-request`);
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Derived filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...requests];

    if (statusFilter !== "all") {
      list = list.filter(
        (r) => (r.status || "").toLowerCase() === statusFilter
      );
    }

    if (debouncedQuery) {
      list = list.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(debouncedQuery) ||
          (r.email || "").toLowerCase().includes(debouncedQuery)
      );
    }

    if (sortBy === "newest") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "oldest") {
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return list;
  }, [requests, debouncedQuery, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // Open modal for approval
  const openApprove = (req) => {
    setSelectedReq(req);
    setModalMode("approve");
    setModalStep(1);
    setForm({
      department: req.department || "",
      joiningDate: req.joiningDate
        ? new Date(req.joiningDate).toISOString().slice(0, 10)
        : "",
      notes: req.notes || "",
    });
    setChecklist(
      checklistItems.map((it) => ({
        label: it,
        checked: req.checklist?.find((c) => c.label === it)?.checked || false,
      }))
    );
  };

  // Open modal for editing
  const openEdit = (req) => {
    setSelectedReq(req);
    setModalMode("edit");
    setModalStep(1);
    setForm({
      department: req.department || "",
      joiningDate: req.joiningDate
        ? new Date(req.joiningDate).toISOString().slice(0, 10)
        : "",
      notes: req.notes || "",
    });
    setChecklist(
      checklistItems.map((it) => ({
        label: it,
        checked: req.checklist?.find((c) => c.label === it)?.checked || false,
      }))
    );
  };

  const handleNextFromDetails = () => {
    if (!form.department.trim()) return alert("Please enter Department");
    if (!form.joiningDate) return alert("Please select Joining Date");
    setModalStep(2);
  };

  const toggleChecklist = (index) => {
    setChecklist((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], checked: !copy[index].checked };
      return copy;
    });
  };

  // Update/Edit existing request
  const updateRequest = async () => {
    if (!selectedReq) return;

    const payload = {
      department: form.department,
      joiningDate: form.joiningDate,
      notes: form.notes,
      checklist,
      reviewedBy: JSON.parse(localStorage.getItem("user"))?.name || "admin",
    };

    try {
      const res = await fetch(
        `${API_URL}/api/onboarding-request/update/${selectedReq._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Update error", data);
        alert(data.message || "Update failed — check console");
        return;
      }

      // Update UI
      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedReq._id
            ? {
                ...r,
                department: payload.department,
                joiningDate: payload.joiningDate,
                notes: payload.notes,
                checklist: payload.checklist,
                reviewedBy: payload.reviewedBy,
              }
            : r
        )
      );

      setSelectedReq(null);
      setModalStep(1);
      setForm({ department: "", joiningDate: "", notes: "" });
      setChecklist(checklistItems.map((it) => ({ label: it, checked: false })));

      alert("Request updated successfully.");
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update request");
    }
  };

  // Finalize approval
  const finalizeOnboarding = async () => {
    if (!selectedReq) return;

    const payload = {
      department: form.department,
      joiningDate: form.joiningDate,
      notes: form.notes,
      checklist,
      reviewedBy: JSON.parse(localStorage.getItem("user"))?.name || "admin",
    };

    try {
      const res = await fetch(
        `${API_URL}/api/onboarding-request/approve/${selectedReq._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error("Approve error", data);
        alert(data.message || "Approve failed — check console");
        return;
      }

      setRequests((prev) =>
        prev.map((r) =>
          r._id === selectedReq._id
            ? {
                ...r,
                status: "approved",
                department: payload.department,
                joiningDate: payload.joiningDate,
                notes: payload.notes,
                checklist: payload.checklist,
                reviewedBy: payload.reviewedBy,
                approvedAt: new Date().toISOString(),
              }
            : r
        )
      );

      setSelectedReq(null);
      setModalStep(1);
      setForm({ department: "", joiningDate: "", notes: "" });
      setChecklist(checklistItems.map((it) => ({ label: it, checked: false })));

      alert("Onboarding finalized successfully.");
    } catch (err) {
      console.error("Finalize error", err);
      alert("Failed to finalize onboarding");
    }
  };

  // Delete request
  const deleteRequest = async (id) => {
    try {
      const res = await fetch(
        `${API_URL}/api/onboarding-request/${id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r._id !== id));
        setDeleteConfirm(null);
        alert("Request deleted successfully.");
      } else {
        const data = await res.json();
        alert(data.message || "Delete failed");
      }
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete request");
    }
  };

  // Quick approve
  const quickApprove = async (req) => {
    if (!confirm(`Quick approve ${req.name}?`)) return;
    try {
      const res = await fetch(
        `${API_URL}/api/onboarding-request/approve/${req._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            department: "TBD",
            joiningDate: new Date().toISOString(),
            notes: "Quick approved",
            checklist: [],
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r._id === req._id ? { ...r, status: "approved" } : r
          )
        );
      } else {
        alert(data.message || "Quick approve failed");
      }
    } catch (err) {
      console.error(err);
      alert("Quick approve failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.button
            whileHover={{ scale: 1.05, x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/dashboard")}
            className="mb-6 bg-white/20 backdrop-blur-sm text-white rounded-full p-3 shadow-lg hover:bg-white/30 transition-all border border-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-bold mb-2"
              >
                Onboarding Requests
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-blue-100 text-sm md:text-base"
              >
                Manage, edit and approve incoming onboarding requests
              </motion.p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-white" />
                  <p className="text-xs text-blue-100">Total</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-300" />
                  <p className="text-xs text-blue-100">Pending</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-amber-300">{stats.pending}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/30"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-300" />
                  <p className="text-xs text-blue-100">Approved</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-green-300">{stats.approved}</p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A→Z)</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadData}
                disabled={loading}
                className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Requests Grid/List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center"
            >
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Loading requests...</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center"
            >
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4"
            >
              {filtered.map((req, index) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-6 transition-all group"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* User Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {req.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{req.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {req.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                            req.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : req.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {req.status === "approved" && <CheckCircle2 className="w-4 h-4" />}
                          {req.status === "rejected" && <XCircle className="w-4 h-4" />}
                          {req.status === "pending" && <Clock className="w-4 h-4" />}
                          {req.status?.toUpperCase() || "PENDING"}
                        </span>

                        {req.department && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                            <Building2 className="w-3 h-3" />
                            {req.department}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {req.status === "pending" && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openApprove(req)}
                            className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Approve
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => quickApprove(req)}
                            className="px-3 py-2.5 bg-blue-50 text-blue-600 rounded-xl border-2 border-blue-200 hover:bg-blue-100 transition-all font-medium"
                            title="Quick approve"
                          >
                            Quick
                          </motion.button>
                        </>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEdit(req)}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit
                      </motion.button>

                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={
                          req.signature
                            ? `http://localhost:5235${req.signature}`
                            : "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-200 transition-all font-medium flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </motion.a>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDeleteConfirm(req)}
                        className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl border-2 border-red-200 hover:bg-red-100 transition-all font-medium flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal for Approve/Edit */}
      <AnimatePresence>
        {selectedReq && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedReq(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">
                    {modalMode === "approve" ? "Approve Onboarding" : "Edit Request"}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedReq(null)}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-blue-100">{selectedReq.name}</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className={`flex-1 h-2 rounded-full ${modalStep >= 1 ? 'bg-white' : 'bg-white/30'}`} />
                  <div className={`flex-1 h-2 rounded-full ${modalStep >= 2 ? 'bg-white' : 'bg-white/30'}`} />
                </div>
                <p className="text-sm text-blue-100 mt-2">Step {modalStep} of 2</p>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {modalStep === 1 ? (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Department
                        </label>
                        <input
                          value={form.department}
                          onChange={(e) =>
                            setForm({ ...form, department: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="e.g., HR / Engineering / Sales"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          Joining Date
                        </label>
                        <input
                          type="date"
                          value={form.joiningDate}
                          onChange={(e) =>
                            setForm({ ...form, joiningDate: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          Notes (Optional)
                        </label>
                        <textarea
                          value={form.notes}
                          onChange={(e) =>
                            setForm({ ...form, notes: e.target.value })
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[120px] resize-none"
                          placeholder="Add any additional notes or comments..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedReq(null)}
                          className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNextFromDetails}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          Next Step
                          <ChevronRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                        <p className="text-sm font-semibold text-blue-900">
                          Complete the onboarding checklist below
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {checklist.filter(c => c.checked).length} of {checklist.length} items completed
                        </p>
                      </div>

                      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                        {checklist.map((item, index) => (
                          <motion.label
                            key={index}
                            whileHover={{ scale: 1.01 }}
                            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              item.checked
                                ? 'bg-green-50 border-green-300'
                                : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={() => toggleChecklist(index)}
                              className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className={`flex-1 font-medium ${
                              item.checked ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {item.label}
                            </span>
                            {item.checked && (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            )}
                          </motion.label>
                        ))}
                      </div>

                      <div className="flex gap-3 pt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setModalStep(1)}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSelectedReq(null);
                            setModalStep(1);
                          }}
                          className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold border-2 border-red-200 hover:bg-red-100 transition-all"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={modalMode === "approve" ? finalizeOnboarding : updateRequest}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          {modalMode === "approve" ? (
                            <>
                              <CheckCircle2 className="w-5 h-5" />
                              Finalize Onboarding
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Save Changes
                            </>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Request?</h3>
                <p className="text-gray-600">
                  Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span>'s onboarding request? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => deleteRequest(deleteConfirm._id)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}