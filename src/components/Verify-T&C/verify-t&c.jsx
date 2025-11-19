"use client";

import React, { useEffect, useState } from "react";
import { FileText, Clock, CheckCircle, XCircle, User, AlertCircle, Shield, Eye, Plus, Pencil, Sparkles } from "lucide-react";

export default function ManageTermsAdmin() {
  const [categories, setCategories] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTermsEditor, setShowTermsEditor] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryTerms, setCategoryTerms] = useState("");
  
  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    adminNotes: "",
    effectiveDate: "",
    expiryDate: "",
    version: "",
    approvalLevel: "standard",
  });

  const loadData = async () => {
    try {
      const categoriesRes = await fetch("/api/terms/categories");
      const pendingRes = await fetch("/api/terms/pending");
      
      const catData = await categoriesRes.json();
      const pendData = await pendingRes.json();
      
      setCategories(catData.categories || []);
      setPendingRequests(pendData.requests || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setApprovalForm({
      adminNotes: "",
      effectiveDate: new Date().toISOString().split('T')[0],
      expiryDate: "",
      version: "1.0",
      approvalLevel: "standard",
    });
    setShowApprovalModal(true);
  };

  const handleApprove = async () => {
    try {
      await fetch("/api/terms/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRequest.id,
          ...approvalForm,
        }),
      });
      setShowApprovalModal(false);
      setSelectedRequest(null);
      loadData();
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;
    
    try {
      await fetch("/api/terms/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason }),
      });
      loadData();
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    
    try {
      await fetch("/api/terms/add-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory }),
      });
      setShowCategoryModal(false);
      setNewCategory("");
      loadData();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  const openTermsEditor = async (category) => {
    try {
      const res = await fetch(`/api/terms/${category}`);
      const data = await res.json();
      setSelectedCategory(category);
      setCategoryTerms(data.terms || "");
      setShowTermsEditor(true);
    } catch (error) {
      console.error("Error loading terms:", error);
    }
  };

  const saveTerms = async () => {
    try {
      await fetch("/api/terms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          category: selectedCategory, 
          terms: categoryTerms 
        }),
      });
      setShowTermsEditor(false);
      alert("Terms updated successfully!");
    } catch (error) {
      console.error("Error saving terms:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg shadow-purple-500/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                Terms & Conditions Admin
              </h1>
              <p className="text-slate-400 text-sm mt-1">Manage categories and review user requests</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-bold text-white">{pendingRequests.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Pending Requests</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-white">{categories.length}</span>
            </div>
            <p className="text-slate-400 text-sm">Categories</p>
          </div>
          
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-2xl font-bold text-white">Active</span>
            </div>
            <p className="text-slate-400 text-sm">System Status</p>
          </div>
        </div>



        {/* Pending Requests */}
        <div>
          <h2 className="text-lg font-semibold text-white/90 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            Pending User Requests
            <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-lg text-xs font-medium">
              {pendingRequests.length}
            </span>
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {pendingRequests.map((request, idx) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 p-6 rounded-2xl hover:border-slate-600/50 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-700/50 rounded-lg">
                        <User className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{request.user}</h3>
                        <p className="text-slate-400 text-xs">{request.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Category</p>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-medium">
                          {request.category}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Submitted</p>
                        <p className="text-slate-300 text-xs">{request.date}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs mb-1">Company</p>
                        <p className="text-slate-300 text-xs">{request.company || "N/A"}</p>
                      </div>
                    </div>
                    
                    {request.message && (
                      <div className="bg-slate-900/50 rounded-lg p-3">
                        <p className="text-slate-500 text-xs mb-1">Message:</p>
                        <p className="text-slate-300 text-sm">{request.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                    <button
                      onClick={() => openApprovalModal(request)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl hover:bg-emerald-500/30 transition-all font-medium text-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-xl hover:bg-red-500/30 transition-all font-medium text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {pendingRequests.length === 0 && (
              <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 p-12 rounded-2xl text-center">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No pending requests at the moment</p>
                <p className="text-slate-500 text-sm mt-2">New user requests will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

   

      {/* Terms Editor Modal */}
      {showTermsEditor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-4xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-2xl font-bold text-white mb-2">Edit Terms: {selectedCategory}</h3>
              <p className="text-slate-400 text-sm">Update the terms and conditions for this category</p>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <textarea
                value={categoryTerms}
                onChange={(e) => setCategoryTerms(e.target.value)}
                className="w-full h-96 bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                placeholder="Enter terms and conditions..."
              />
            </div>

            <div className="p-6 border-t border-slate-700/50 flex gap-3 bg-slate-800/50">
              <button
                onClick={saveTerms}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-medium hover:from-emerald-500 hover:to-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50"
              >
                Save Terms
              </button>
              <button
                onClick={() => {
                  setShowTermsEditor(false);
                  setSelectedCategory("");
                  setCategoryTerms("");
                }}
                className="flex-1 bg-slate-700/50 text-slate-300 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-slate-800/95 backdrop-blur-xl">
              <h3 className="text-2xl font-bold text-white mb-2">Approve Terms Request</h3>
              <p className="text-slate-400 text-sm">Fill in the approval details for {selectedRequest.user}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Request Summary */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Request Summary
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">User</p>
                    <p className="text-slate-300">{selectedRequest.user}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Category</p>
                    <p className="text-slate-300">{selectedRequest.category}</p>
                  </div>
                  {selectedRequest.message && (
                    <div className="col-span-2">
                      <p className="text-slate-500 mb-1">Message</p>
                      <p className="text-slate-300">{selectedRequest.message}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">
                    Version Number *
                  </label>
                  <input
                    type="text"
                    value={approvalForm.version}
                    onChange={(e) => setApprovalForm({...approvalForm, version: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    placeholder="e.g., 1.0, 2.1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Effective Date *
                    </label>
                    <input
                      type="date"
                      value={approvalForm.effectiveDate}
                      onChange={(e) => setApprovalForm({...approvalForm, effectiveDate: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-2 block">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={approvalForm.expiryDate}
                      onChange={(e) => setApprovalForm({...approvalForm, expiryDate: e.target.value})}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">
                    Approval Level *
                  </label>
                  <select
                    value={approvalForm.approvalLevel}
                    onChange={(e) => setApprovalForm({...approvalForm, approvalLevel: e.target.value})}
                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  >
                    <option value="standard">Standard</option>
                    <option value="priority">Priority</option>
                    <option value="expedited">Expedited</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 text-sm font-medium mb-2 block">
                    Admin Notes
                  </label>
                  <textarea
                    value={approvalForm.adminNotes}
                    onChange={(e) => setApprovalForm({...approvalForm, adminNotes: e.target.value})}
                    className="w-full h-32 bg-slate-900/50 border border-slate-700/50 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all resize-none"
                    placeholder="Add any notes or comments about this approval..."
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-700/50 flex gap-3 bg-slate-800/50">
              <button
                onClick={handleApprove}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3 rounded-xl font-medium hover:from-emerald-500 hover:to-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve Request
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 bg-slate-700/50 text-slate-300 py-3 rounded-xl font-medium hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}