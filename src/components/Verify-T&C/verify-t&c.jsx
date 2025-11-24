"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, SortAsc, Users } from "lucide-react";

/**
 * AdminOnboardingRequests — Modern Dashboard Style
 * - Debounced search
 * - Status filter (all / pending / approved / rejected)
 * - Sort by: newest / oldest / name
 * - Table rows with actions and signature preview
 * - Two-step approve modal (details -> checklist)
 *
 * Backend assumptions:
 * - GET  http://localhost:5235/api/onboarding-request     -> returns { requests: [...] }
 * - POST http://localhost:5235/api/onboarding-request/approve/:id  -> accepts payload and returns updated request
 */

export default function AdminOnboardingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  // Controls
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Modal / approval flow
  const [selectedReq, setSelectedReq] = useState(null);
  const [modalStep, setModalStep] = useState(1);
  const [form, setForm] = useState({ department: "", joiningDate: "", notes: "" });

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

  // debounce query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [query]);

  // load data
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5235/api/onboarding-request");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to load requests", err);
      // optionally show a toast
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // derived filtered + sorted list
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

  // stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;
    return { total, pending, approved, rejected };
  }, [requests]);

  // open modal
  const openApprove = (req) => {
    setSelectedReq(req);
    setModalStep(1);
    setForm({
      department: req.department || "",
      joiningDate: req.joiningDate ? new Date(req.joiningDate).toISOString().slice(0, 10) : "",
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

  // finalize approval
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
        `http://localhost:5235/api/onboarding-request/approve/${selectedReq._id}`,
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

      // merge update into UI instantly
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

  // quick approve (without details) — optional
  const quickApprove = async (req) => {
    if (!confirm(`Quick approve ${req.name}?`)) return;
    try {
      const res = await fetch(
        `http://localhost:5235/api/onboarding-request/approve/${req._id}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ department: "TBD", joiningDate: new Date().toISOString(), notes: "Quick approved", checklist: [] }) }
      );
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r._id === req._id ? { ...r, status: "approved" } : r)));
      } else {
        alert(data.message || "Quick approve failed");
      }
    } catch (err) {
      console.error(err);
      alert("Quick approve failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">
              Onboarding Requests
            </h1>
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
            <button
              onClick={loadData}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow text-sm"
            >
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
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No requests found.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{r.name}</div>
                      <div className="text-xs text-slate-500 mt-1 md:hidden">{new Date(r.createdAt).toLocaleString()}</div>
                    </td>

                    <td className="px-6 py-4 text-slate-600">{r.email}</td>

                    <td className="px-6 py-4 text-slate-600 hidden md:table-cell">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          r.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {r.status?.toUpperCase() || "PENDING"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {r.status === "pending" && (
                          <button
                            onClick={() => openApprove(r)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"
                          >
                            Approve
                          </button>
                        )}

                        {r.status === "pending" && (
                          <button
                            onClick={() => quickApprove(r)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm border"
                            title="Quick approve"
                          >
                            Quick
                          </button>
                        )}

                        <a
                          href={r.signature ? `http://localhost:5235${r.signature}` : "#"}
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

      {/* Modal (two-step) */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Approve — {selectedReq.name}</h3>
                <p className="text-sm text-slate-500">Step {modalStep} of 2</p>
              </div>
              <div>
                <button onClick={() => setSelectedReq(null)} className="text-slate-500 hover:text-slate-800">✕</button>
              </div>
            </div>

            <div className="p-6">
              {modalStep === 1 ? (
                <>
                  <label className="block mb-3 text-sm">
                    <div className="text-slate-600 mb-1">Department</div>
                    <input
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full border rounded-lg p-3"
                      placeholder="e.g., HR / Engineering"
                    />
                  </label>

                  <label className="block mb-3 text-sm">
                    <div className="text-slate-600 mb-1">Joining Date</div>
                    <input
                      type="date"
                      value={form.joiningDate}
                      onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                      className="w-full border rounded-lg p-3"
                    />
                  </label>

                  <label className="block mb-3 text-sm">
                    <div className="text-slate-600 mb-1">Notes</div>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full border rounded-lg p-3 min-h-[100px]"
                    />
                  </label>

                  <div className="flex justify-end gap-3">
                    <button onClick={() => setSelectedReq(null)} className="px-4 py-2 rounded-lg bg-gray-100">Cancel</button>
                    <button onClick={handleNextFromDetails} className="px-5 py-2 rounded-lg bg-blue-600 text-white">Next →</button>
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
    </div>
  );
}
