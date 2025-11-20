"use client";

import { useEffect, useState } from "react";

/**
 * AdminOnboardingRequests (Option 1)
 * - Two-step approval modal:
 *   Step 1: department / joiningDate / notes
 *   Step 2: checklist (10 HR items)
 *
 * - Finalize sends:
 *   { department, joiningDate, notes, checklist, reviewedBy }
 *
 * Backend endpoint: POST http://localhost:5235/api/onboarding-request/approve/:id
 */

export default function AdminOnboardingRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);

  // step: 1 => details form, 2 => checklist
  const [modalStep, setModalStep] = useState(1);

  const [form, setForm] = useState({
    department: "",
    joiningDate: "",
    notes: "",
  });

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

  // checklist state: [{label, checked}, ...]
  const [checklist, setChecklist] = useState(
    checklistItems.map((it) => ({ label: it, checked: false }))
  );

  const loadData = async () => {
    try {
      const res = await fetch("http://localhost:5235/api/onboarding-request");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to load requests", err);
      alert("Failed to load requests — check console");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openApprove = (req) => {
    setSelectedReq(req);
    setModalStep(1);
    setForm({ department: "", joiningDate: "", notes: "" });
    setChecklist(checklistItems.map((it) => ({ label: it, checked: false })));
  };

  const handleNextFromDetails = () => {
    // simple validation
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

  const finalizeOnboarding = async () => {
    if (!selectedReq) return;
    // Optionally: ensure at least essential items checked
    const requiredIndexes = [0, 1, 2]; // e.g., personal info, ID, offer signed
    const allRequiredChecked = requiredIndexes.every((i) => checklist[i].checked);
    if (!allRequiredChecked) {
      if (!confirm("Some critical checklist items are not checked. Continue anyway?")) {
        return;
      }
    }

    try {
      const payload = {
        department: form.department,
        joiningDate: form.joiningDate,
        notes: form.notes,
        checklist, // array of {label, checked}
        reviewedBy: JSON.parse(localStorage.getItem("user"))?.name || "admin",
      };

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

      alert("Onboarding finalized and saved.");
      setSelectedReq(null);
      setModalStep(1);
      setForm({ department: "", joiningDate: "", notes: "" });
      setChecklist(checklistItems.map((it) => ({ label: it, checked: false })));
      loadData();
    } catch (err) {
      console.error("Finalize error", err);
      alert("Failed to finalize — check console");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Pending Onboarding Requests</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requests.map((req) => (
          <div key={req._id} className="bg-white rounded-2xl p-6 shadow hover:shadow-lg transition">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{req.name}</h2>
                <p className="text-sm text-gray-500">{req.email}</p>
                <span className="inline-block mt-3 px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">{req.status}</span>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-400">Submitted</p>
                <p className="text-sm text-gray-600">{new Date(req.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {req.signature && (
              <img
                src={`http://localhost:5235${req.signature}`}
                alt="signature"
                className="w-36 h-auto mt-4 rounded-md border"
              />
            )}

            <div className="mt-4">
              <button
                onClick={() => openApprove(req)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium"
              >
                Approve Request
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: two-step */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Approve: {selectedReq.name}</h3>
                <button
                  onClick={() => setSelectedReq(null)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Follow the two-step approval — details, then checklist.</p>
            </div>

            <div className="p-6">
              {modalStep === 1 && (
                <>
                  <div className="space-y-4">
                    <label className="block">
                      <div className="text-sm text-gray-600 mb-1">Department</div>
                      <input
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full border rounded-lg p-3"
                        placeholder="e.g., Product / HR / Engineering"
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm text-gray-600 mb-1">Joining Date</div>
                      <input
                        type="date"
                        value={form.joiningDate}
                        onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                        className="w-full border rounded-lg p-3"
                      />
                    </label>

                    <label className="block">
                      <div className="text-sm text-gray-600 mb-1">Notes (optional)</div>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full border rounded-lg p-3 min-h-[90px]"
                        placeholder="Any admin notes..."
                      />
                    </label>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedReq(null)}
                      className="px-4 py-2 rounded-lg bg-gray-200"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleNextFromDetails}
                      className="px-5 py-2 rounded-lg bg-blue-600 text-white"
                    >
                      Next: Checklist →
                    </button>
                  </div>
                </>
              )}

              {modalStep === 2 && (
                <>
                  <p className="text-sm text-gray-600 mb-4">Tick each completed onboarding item.</p>
                  <div className="grid grid-cols-1 gap-3">
                    {checklist.map((c, idx) => (
                      <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          checked={c.checked}
                          onChange={() => toggleChecklist(idx)}
                          className="w-5 h-5"
                        />
                        <span className="text-gray-700">{c.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-between gap-3">
                    <button
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2 rounded-lg bg-gray-200"
                    >
                      ← Back
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setSelectedReq(null); setModalStep(1); }}
                        className="px-4 py-2 rounded-lg bg-red-100 text-red-700"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={finalizeOnboarding}
                        className="px-5 py-2 rounded-lg bg-green-600 text-white"
                      >
                        Finalize Onboarding
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
