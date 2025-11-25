"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

/**
 * AdminOnboardingRequests — Final single-file component (updated)
 * - Fixes typo bug in finalizeOnboarding
 * - Adds Offboard button when admin approved AND user accepted T&C
 * - Optimistic UI updates with rollback on API failure
 *
 * Notes:
 * - Expects NEXT_PUBLIC_API_URL env var or uses http://localhost:5235
 * - Requires authToken in sessionStorage for API requests
 * - Uses localStorage.user to read reviewer name for approvals
 */

export default function AdminOnboardingRequests() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

  // ---------- State
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Approve modal state
  const [selectedReq, setSelectedReq] = useState(null); // used for approve flow
  const [modalStep, setModalStep] = useState(1);
  const [form, setForm] = useState({
    department: "",
    joiningDate: "",
    notes: "",
  });

  // Edit modal state (separate from approve modal)
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null); // used for edit flow
  const [formData, setFormData] = useState({
    department: "",
    joiningDate: "",
    notes: "",
    checklist: [],
  });

  // Misc
  const [userData, setUserData] = useState(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedForOffboard, setSelectedForOffboard] = useState(null);
  const [showOffboardModal, setShowOffboardModal] = useState(false);
  const [offboardChecklist, setOffboardChecklist] = useState({
  returnAssets: false,
  submitDocs: false,
  handoverCompleted: false,
});

  // Checklist master list
  const checklistItems = [
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
  ];

  const [checklist, setChecklist] = useState(
    checklistItems.map((it) => ({ label: it, checked: false }))
  );

  // ---------- Derived stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => (r.status || "").toLowerCase() === "pending").length;
    const approved = requests.filter((r) => (r.status || "").toLowerCase() === "approved").length;
    const rejected = requests.filter((r) => (r.status || "").toLowerCase() === "rejected").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // ---------- Helpers
  const formatDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso || "-";
    }
  };

  const hasAcceptedTnC = (r) => {
    // Accept common backend field variations for a T&C flag
    if (!r) return false;
    return !!(
      r.termsAccepted ||
      r.acceptedTerms ||
      r.acceptedTnC ||
      r.tncAccepted ||
      r.accepted_terms
    );
  };

  const openOffboardForm = (req) => {
  setSelectedForOffboard(req);
  setOffboardChecklist({
    returnAssets: false,
    submitDocs: false,
    handoverCompleted: false,
  });
  setShowOffboardModal(true);
};

const openOffboardModal = (req) => {
  setSelectedOffboardUser(req);

  // If user already has previous offboard checklist, use it
  setOffboardChecklist(
    req.offboardDetails?.length > 0
      ? req.offboardDetails
      : checklistItems.map((label) => ({ label, checked: false }))
  );

  setShowOffboardModal(true);
};
const toggleOffboardItem = (index) => {
  setOffboardChecklist((prev) => {
    const copy = [...prev];
    copy[index] = { ...copy[index], checked: !copy[index].checked };
    return copy;
  });
};


  // ---------- Auth + fetch helpers
  const checkAuth = () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      window.location.href = "/login";
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const res = await axios.get(`${API_URL}/api/student/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setUserData(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        throw new Error(res.data?.message || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("fetchUserData error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      } else {
        toast.error("Could not load profile.");
      }
    }
  };

const fetchAllData = async () => {
  try {
    setLoading(true);
    const token = sessionStorage.getItem("authToken");
    if (!token) throw new Error("No authentication token found");

    const res = await axios.get(`${API_URL}/api/onboarding-request`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.data?.success) {
      let allRequests = res.data.requests || [];

      // merge with any static offboarded users in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("requests") || "[]");
        if (Array.isArray(stored)) {
          allRequests = allRequests.map((r) => {
            const offboarded = stored.find((s) => s._id === r._id && s.offboarded);
            return offboarded ? { ...r, ...offboarded } : r;
          });
        }
      } catch {}

      setRequests(allRequests);
    } else {
      throw new Error(res.data?.message || "Failed to load requests");
    }
  } catch (err) {
    console.error("fetchAllData error:", err);
    if (err?.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      handleLogout();
    } else {
      toast.error("Failed to load onboarding requests");
    }
  } finally {
    setLoading(false);
  }
};


  // initial load
  useEffect(() => {
    checkAuth();
    fetchUserData();
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim().toLowerCase());
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  // ---------- Filter + sort (memoized)
  const filtered = useMemo(() => {
    let list = [...requests];

    if (statusFilter !== "all") {
      list = list.filter((r) => (r.status || "").toLowerCase() === statusFilter);
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

  // ---------- UI actions
  const loadData = () => {
    fetchUserData();
    fetchAllData();
    toast.success("Data refreshed");
  };

  // quickApprove: optimistic update + API call
  const quickApprove = async (req) => {
    if (!confirm(`Quick-approve ${req.name}? This automatically marks all checklist items complete.`)) {
      return;
    }

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Not authenticated.");
      return;
    }

    const payload = {
      department: req.department || "Not Assigned",
      joiningDate: new Date().toISOString().slice(0, 10),
      notes: "Quick approved by admin",
      checklist: checklistItems.map((label) => ({ label, checked: true })),
      reviewedBy: JSON.parse(localStorage.getItem("user"))?.name || "admin",
    };

    // keep a snapshot for rollback
    const snapshot = [...requests];

    // optimistic update
    setRequests((prev) =>
      prev.map((r) =>
        r._id === req._id
          ? { ...r, status: "approved", ...payload, approvedAt: new Date().toISOString() }
          : r
      )
    );

    try {
      const res = await axios.post(
        `${API_URL}/api/onboarding-request/approve/${req._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data?.success) {
        // rollback if API returns an error
        setRequests(snapshot);
        toast.error(res.data?.message || "Quick approve failed");
        return;
      }

      toast.success("Request quick-approved!");
    } catch (err) {
      console.error("quickApprove error:", err);
      setRequests(snapshot);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      } else toast.error("Quick approve failed");
    }
  };

  // open modal and initialize form & checklist from request (approve flow)
  const openApprove = (req) => {
    setSelectedReq(req);
    setModalStep(1);

    setForm({
      department: req.department || "",
      joiningDate: req.joiningDate ? new Date(req.joiningDate).toISOString().slice(0, 10) : "",
      notes: req.notes || "",
    });

    setChecklist(
      checklistItems.map((item) => ({
        label: item,
        checked: req.checklist?.find((c) => c.label === item)?.checked || false,
      }))
    );
  };

  const handleNextFromDetails = () => {
    if (!form.department.trim()) return alert("Please enter Department");
    if (!form.joiningDate) return alert("Select Joining Date");
    setModalStep(2);
  };

  const toggleChecklist = (index) => {
    setChecklist((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], checked: !copy[index].checked };
      return copy;
    });
  };

  // finalize onboarding (from approve modal)
  const finalizeOnboarding = async () => {
    if (!selectedReq) return;
    if (!confirm(`Finalize onboarding for ${selectedReq.name}? This will mark request approved.`)) return;

    const token = sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Not authenticated.");
      return;
    }

    const payload = {
      department: form.department,
      joiningDate: form.joiningDate,
      notes: form.notes,
      checklist,
      reviewedBy: JSON.parse(localStorage.getItem("user"))?.name || "admin",
    };

    // snapshot for rollback
    const snapshot = [...requests];

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/api/onboarding-request/approve/${selectedReq._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data?.success) {
        toast.error(res.data?.message || "Approve failed");
        return;
      }

      // Update the specific request properly (optimistic)
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
                approvedAt: new Date().toISOString(),
              }
            : r
        )
      );

      setSelectedReq(null);
      setModalStep(1);
      toast.success("Onboarding finalized successfully.");
    } catch (err) {
      console.error("Finalize error:", err);
      // rollback
      setRequests(snapshot);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      } else {
        toast.error("Failed to finalize onboarding");
      }
    } finally {
      setLoading(false);
    }
  };

  // Edit feature
  const handleEdit = (req) => {
    setSelectedRequest(req);
    setFormData({
      department: req.department || "",
      joiningDate: req.joiningDate ? new Date(req.joiningDate).toISOString().slice(0, 10) : "",
      notes: req.notes || "",
      checklist:
        req.checklist?.length > 0
          ? req.checklist
          : checklistItems.map((label) => ({ label, checked: false })),
    });

    setShowEditModal(true);
  };

  const updateRequest = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        toast.error("Not authenticated.");
        return;
      }

      const payload = {
        department: formData.department,
        joiningDate: formData.joiningDate,
        notes: formData.notes,
        checklist: formData.checklist,
      };

      // snapshot for rollback
      const snapshot = [...requests];

      // Use axios.put; endpoint path should match your backend
      const res = await axios.put(
        `${API_URL}/api/onboarding-request/update/${selectedRequest._id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.data?.success) {
        toast.error(res.data?.message || "Failed updating");
        return;
      }

      // Update UI instantly
      setRequests((prev) =>
        prev.map((r) => (r._id === selectedRequest._id ? { ...r, ...payload } : r))
      );

      toast.success("Request updated successfully");
      setShowEditModal(false);
      setSelectedRequest(null);
    } catch (err) {
      console.error("updateRequest error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        handleLogout();
      } else {
        toast.error("Update failed");
      }
    }
  };

const staticOffboard = (req) => {
  setRequests((prev) =>
    prev.map((item) =>
      item._id === req._id
        ? {
            ...item,
            status: "offboarded",
            offboardDetails: offboardChecklist,
            offboarded: true,      // ✅ new flag
          }
        : item
    )
  );

  // save to localStorage so refresh keeps it
  try {
    const stored = JSON.parse(localStorage.getItem("requests") || "[]");
    const updated = stored.map((item) =>
      item._id === req._id
        ? {
            ...item,
            status: "offboarded",
            offboardDetails: offboardChecklist,
            offboarded: true,
          }
        : item
    );
    localStorage.setItem("requests", JSON.stringify(updated));
  } catch {}
  
  toast.success("User offboarded (static)");
};


  // ---------- Skeleton row for loading state
  const SkeletonRows = ({ rows = 5 }) => (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 rounded w-36" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 rounded w-48" />
          </td>
          <td className="px-6 py-4 hidden md:table-cell">
            <div className="h-4 bg-slate-200 rounded w-36" />
          </td>
          <td className="px-6 py-4">
            <div className="h-4 bg-slate-200 rounded w-24" />
          </td>
          <td className="px-6 py-4">
            <div className="h-8 bg-slate-200 rounded w-32" />
          </td>
        </tr>
      ))}
    </>
  );

  // ---------- Render
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">Onboarding Requests</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and approve incoming onboarding requests.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-4">
              <div className="text-center px-4 py-2 bg-white rounded-lg shadow border">
                <p className="text-sm text-slate-500">Total</p>
                <p className="text-lg font-semibold text-slate-800">{stats.total}</p>
              </div>
              <div className="text-center px-4 py-2 bg-white rounded-lg shadow border">
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-lg font-semibold text-amber-600">{stats.pending}</p>
              </div>
              <div className="text-center px-4 py-2 bg-white rounded-lg shadow border">
                <p className="text-sm text-slate-500">Approved</p>
                <p className="text-lg font-semibold text-emerald-600">{stats.approved}</p>
              </div>
            </div>

            {/* search */}
            <div className="flex items-center bg-white border rounded-lg shadow px-3 py-2">
              <Search className="text-slate-400 mr-2" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name or email..."
                className="w-56 md:w-80 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-6">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border rounded-lg shadow text-sm"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
        
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white border rounded-lg shadow text-sm"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name (A→Z)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={loadData} className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow text-sm">
              Refresh
            </button>
          </div>
        </div>

        {/* TABLE / LIST */}
        <div className="bg-white rounded-2xl shadow border overflow-hidden">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left">
                <th className="px-6 py-4 text-sm text-slate-600">Name</th>
                <th className="px-6 py-4 text-sm text-slate-600">Email</th>
                <th className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">Submitted</th>
                <th className="px-6 py-4 text-sm text-slate-600">Status</th>
                <th className="px-6 py-4 text-sm text-slate-600">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <SkeletonRows rows={5} />
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No requests found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{r.name}</div>
                      <div className="text-xs text-slate-500 mt-1 md:hidden">{formatDateTime(r.createdAt)}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">{r.email}</td>

                    <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{formatDateTime(r.createdAt)}</td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (r.status || "").toLowerCase() === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : (r.status || "").toLowerCase() === "rejected"
                            ? "bg-red-100 text-red-700"
                  
                      
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {(r.status || "pending").toUpperCase()}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* Show Approve & Quick only for pending */}
                        {(r.status || "pending").toLowerCase() === "pending" && (
                          <>
                            <button onClick={() => openApprove(r)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm">
                              Approve
                            </button>

                            <button
                              onClick={() => quickApprove(r)}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm border"
                              title="Quick approve"
                            >
                              Quick
                            </button>
                          </>
                        )}

                        {/* Edit should be visible for pending AND approved */}
                        {((r.status || "pending").toLowerCase() === "pending" ||
                          (r.status || "").toLowerCase() === "approved") && (
                          <button onClick={() => handleEdit(r)} className="px-3 py-1 text-blue-600 hover:underline">
                            Edit
                          </button>
                        )}

                        {/* Offboard button appears only when approved AND T&C accepted */}
                       
{r.status === "approved" && (
  <button
    onClick={() => openOffboardForm(r)}
    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
  >
    Offboard
  </button>
)}

                    

                        {/* View signature / form */}
                        <a
                          href={r.signature ? `${API_URL}${r.signature}` : "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-sm border"
                        >
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal (two-step) */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Approve — {selectedReq.name}</h3>
                <p className="text-sm text-slate-500">Step {modalStep} of 2</p>
              </div>
              <div>
                <button
                  onClick={() => {
                    setSelectedReq(null);
                    setModalStep(1);
                  }}
                  className="text-slate-500 hover:text-slate-800"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {modalStep === 1 ? (
                <>
                  <label className="block mb-3 text-sm">
                    <div className="text-slate-600 mb-1">Department</div>
                    <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full border rounded-lg p-3" placeholder="e.g., HR / Engineering" />
                  </label>

                  <label className="block mb-3 text-sm">
                    <div className="text-slate-600 mb-1">Joining Date</div>
                    <input type="date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} className="w-full border rounded-lg p-3" />
                  </label>

                  <label className="block mb-3 text-sm">
                    <div className="text-slate-600 mb-1">Notes</div>
                    <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border rounded-lg p-3 min-h-[100px]" />
                  </label>

                  <div className="flex justify-end gap-3">
                    <button onClick={() => { setSelectedReq(null); setModalStep(1); }} className="px-4 py-2 rounded-lg bg-gray-100">
                      Cancel
                    </button>
                    <button onClick={handleNextFromDetails} className="px-5 py-2 rounded-lg bg-blue-600 text-white">
                      Next →
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-slate-600 mb-4">Tick completed onboarding items</p>

                  <div className="grid grid-cols-1 gap-2 max-h-[360px] overflow-auto mb-4">
                    {checklist.map((c, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                        <input type="checkbox" checked={c.checked} onChange={() => toggleChecklist(i)} className="w-5 h-5" />
                        <span>{c.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <button onClick={() => setModalStep(1)} className="px-4 py-2 rounded-lg bg-gray-100">← Back</button>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedReq(null); setModalStep(1); }} className="px-4 py-2 rounded-lg bg-red-100 text-red-700">Cancel</button>
                      <button onClick={finalizeOnboarding} className="px-5 py-2 rounded-lg bg-green-600 text-white">Finalize</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit Modal (separate from Approve modal) */}
      {showEditModal && selectedRequest && (
        <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-xl rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Edit Request — {selectedRequest.name}</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRequest(null);
                }}
                className="text-slate-600 hover:text-slate-900"
              >
                ✕
              </button>
            </div>

            {/* Department */}
            <label className="block mb-3 text-sm">
              <div className="text-slate-600 mb-1">Department</div>
              <input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border rounded-lg p-3"
                placeholder="e.g., HR / Engineering"
              />
            </label>

            {/* Joining Date */}
            <label className="block mb-3 text-sm">
              <div className="text-slate-600 mb-1">Joining Date</div>
              <input type="date" value={formData.joiningDate} onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })} className="w-full border rounded-lg p-3" />
            </label>

            {/* Notes */}
            <label className="block mb-3 text-sm">
              <div className="text-slate-600 mb-1">Notes</div>
              <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full border rounded-lg p-3 min-h-[100px]" />
            </label>

            {/* Checklist */}
            <div className="mb-4">
              <p className="text-slate-600 text-sm mb-2">Checklist</p>

              <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-auto">
                {formData.checklist.map((item, i) => (
                  <label key={i} className="flex items-center gap-2 p-3 border rounded-lg">
                    <input
                      type="checkbox"
                      checked={!!item.checked}
                      onChange={() => {
                        const updated = [...formData.checklist];
                        updated[i] = { ...updated[i], checked: !updated[i].checked };
                        setFormData({ ...formData, checklist: updated });
                      }}
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowEditModal(false); setSelectedRequest(null); }} className="px-4 py-2 bg-gray-100 rounded-lg">
                Cancel
              </button>

              <button onClick={updateRequest} className="px-5 py-2 bg-blue-600 text-white rounded-lg">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

{showOffboardModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center text-white justify-center z-50">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-black p-6 rounded-xl max-w-md w-full shadow-xl"
    >
      <h2 className="text-lg font-semibold text-red-600">
        Offboard {selectedForOffboard?.firstName} {selectedForOffboard?.lastName}
      </h2>

      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Please complete the offboarding checklist before confirming.
      </p>

      {/* CHECKBOXES */}
      <div className="mt-5 space-y-4">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={offboardChecklist.returnAssets}
            onChange={(e) =>
              setOffboardChecklist({
                ...offboardChecklist,
                returnAssets: e.target.checked,
              })
            }
          />
         Transfer ongoing work responsibilities and prepare required documents.
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={offboardChecklist.submitDocs}
            onChange={(e) =>
              setOffboardChecklist({
                ...offboardChecklist,
                submitDocs: e.target.checked,
              })
            }
          />
          Collect office assets (ID card, company documents).
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={offboardChecklist.handoverCompleted}
            onChange={(e) =>
              setOffboardChecklist({
                ...offboardChecklist,
                handoverCompleted: e.target.checked,
              })
            }
          />
        Revoke access to emails, software, and internal systems.
        </label>
               <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={offboardChecklist.handoverCompleted}
            onChange={(e) =>
              setOffboardChecklist({
                ...offboardChecklist,
                handoverCompleted: e.target.checked,
              })
            }
          />
       Inform teams about the transition.
        </label>
               <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={offboardChecklist.handoverCompleted}
            onChange={(e) =>
              setOffboardChecklist({
                ...offboardChecklist,
                handoverCompleted: e.target.checked,
              })
            }
          />
      Biometric Removal.
        </label>
               <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={offboardChecklist.handoverCompleted}
            onChange={(e) =>
              setOffboardChecklist({
                ...offboardChecklist,
                handoverCompleted: e.target.checked,
              })
            }
          />
        Revoke access to emails, software, and internal systems.
        </label>
      </div>

      {/* BUTTONS */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setShowOffboardModal(false)}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
        >
          Cancel
        </button>

        <button
          disabled={
            !offboardChecklist.returnAssets ||
            !offboardChecklist.submitDocs ||
            !offboardChecklist.handoverCompleted
          }
          onClick={() => {
            staticOffboard(selectedForOffboard);
            setShowOffboardModal(false);
          }}
          className={`px-4 py-2 rounded text-white ${
            !offboardChecklist.returnAssets ||
            !offboardChecklist.submitDocs ||
            !offboardChecklist.handoverCompleted
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          Confirm Offboard
        </button>
      </div>
    </motion.div>
  </div>
)}

    </div>
  );
}
