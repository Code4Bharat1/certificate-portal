"use client"

import { Award, Eye, FileText, LogOut, RefreshCw, Upload, User } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import UserNav from '../user/nav';
import { motion } from "framer-motion";
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

// Helper: returns Tailwind color class based on individual doc status
const getStatusColor = (status) => {
    const s = status?.toLowerCase().trim();
    if (s === 'approved') return 'text-green-500';
    if (s === 'rejected') return 'text-red-500';
    return 'text-yellow-400';
};

// Helper: is this specific doc disabled (pending or approved)?
const isDocDisabled = (docStatus) => {
    const s = docStatus?.toLowerCase().trim();
    return s === 'pending' || s === 'approved';
};

const UserDocument = () => {

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";
    // const [userData, setUserData] = useState(null);
    const [userDocData, setUserDocData] = useState(null)
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [currentDocType, setCurrentDocType] = useState(null);

    const [doc, setDoc] = useState({
        aadhaarFront: "",
        aadhaarBack: "",
        panCard: "",
        bankPassbook: "",
    });

    // Document rows config
    const docRows = [
        { label: "Aadhar Card (Front)", key: "aadhaarFront" },
        { label: "Aadhar Card (Back)", key: "aadhaarBack" },
        { label: "Pan Card", key: "panCard" },
        { label: "Bank Passbook", key: "bankPassbook" },
    ];

    useEffect(() => {
        fetchUserDataDocs()
    }, []);

    useEffect(() => {
        if (userDocData?.documents) {
            setDoc({
                aadhaarFront: userDocData.documents.aadhaarFront || "",
                aadhaarBack: userDocData.documents.aadhaarBack || "",
                panCard: userDocData.documents.panCard || "",
                bankPassbook: userDocData.documents.bankPassbook || "",
            });
        }
    }, [userDocData?.documents]);

    const fetchUserDataDocs = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("authToken");
            if (!token) throw new Error("No authentication token found");

            const response = await axios.get(`${API_URL}/api/student/student/doc`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success) {
                setUserDocData(response.data.user);

            } else {
                throw new Error(response.data.message || "Failed to load user data");
            }
        } catch (error) {
            console.error("❌ Error fetching user data:", error);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
            } else {
                toast.error("Failed to load user profile");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewDoc = (url) => {
        if (!url) {
            toast.error("Document not found");
            return;
        }
        window.open(url, "_blank", "noopener,noreferrer");
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSingleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file");
            return;
        }

        const token = sessionStorage.getItem("authToken");

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("document", selectedFile);
            formData.append("docType", currentDocType);

            const response = await axios.put(
                `${API_URL}/api/auth/student/reupload-document`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                toast.success("Document uploaded successfully ✅");
                fetchUserDataDocs(); // refresh data after upload
            }

            setIsOpen(false);
            setSelectedFile(null);
            setCurrentDocType(null);

        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        toast.loading("Refreshing data...", { id: "refresh" });

        try {
            await fetchAllData();
            toast.success("Data refreshed successfully!", { id: "refresh" });
        } catch (error) {
            toast.error("Failed to refresh data", { id: "refresh" });
        } finally {
            setRefreshing(false);
        }
    };


    return (
        <div>
            <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
                <UserNav fetchUserDataDocs={fetchUserDataDocs} />
                <Toaster position="top-right" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-lg mb-8 border-2 border-blue-200 dark:border-gray-700"
                    >
                        {/* Header */}
                        <div className="mb-4">
                            <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-800 dark:from-blue-400 dark:to-blue-500 bg-clip-text text-transparent flex items-center gap-2">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                                <div>
                                    <h1>Documents</h1>
                                    <h5 className="text-xs text-gray-600 dark:text-gray-400 font-normal">
                                        View and manage your uploaded documents
                                    </h5>
                                </div>
                            </h3>
                        </div>

                        {/* Column headers */}
                        <div className="grid grid-cols-3 items-center px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                            <span>Document</span>
                            <span className="text-center">Status</span>
                            <span className="text-right">Actions</span>
                        </div>

                        {/* Document rows */}
                        {docRows.map(({ label, key }) => {
                            const docStatus = userDocData?.documentStatus?.[key]?.status;
                            const rejectedReason = userDocData?.documentStatus?.[key]?.rejectionReason;
                            const docUrl = doc?.[key];
                            const disabled = isDocDisabled(docStatus);

                            return (
                                <div
                                    key={key}
                                    className="shadow-sm p-5 grid grid-cols-3 items-center w-full border-t border-gray-100 dark:border-gray-800"
                                >
                                    {/* Label — fixed: explicit dark text color */}
                                    <span className="text-gray-800 dark:text-gray-100 font-medium text-sm">
                                        {label}
                                    </span>

                                    {/* Status — each doc gets its OWN color, not bankPassbook's */}
                                    <span className={`text-center text-sm font-semibold capitalize ${getStatusColor(docStatus)}`}>
                                        {docStatus ? <>
                                            <div className="flex flex-col">
                                                <span>{docStatus}</span>
                                                <span>{rejectedReason}</span>
                                            </div>
                                        </> : (
                                            <>
                                                <span className="text-gray-400 dark:text-gray-500 font-normal italic">
                                                    No document
                                                </span>

                                            </>

                                        )}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3">
                                        {/* View — only show if doc URL exists */}
                                        {docUrl ? (
                                            <button
                                                onClick={() => handleViewDoc(docUrl)}
                                                className="cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                                title="View document"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <span
                                                className="text-gray-300 dark:text-gray-700 cursor-not-allowed"
                                                title="No document uploaded"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </span>
                                        )}

                                        {/* Upload */}
                                        <button
                                            onClick={() => {
                                                setCurrentDocType(key);
                                                setIsOpen(true);
                                            }}
                                            className={`transition-colors ${disabled
                                                ? 'cursor-not-allowed opacity-40 text-gray-400 dark:text-gray-600'
                                                : 'cursor-pointer text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400'
                                                }`}
                                            disabled={disabled}
                                            title={disabled ? `Cannot re-upload: ${docStatus}` : "Upload document"}
                                        >
                                            <Upload className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                </div>

                {/* Upload Modal
                {isOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
                            <div className="text-center mb-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: 360 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
                                >
                                    <Upload className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    Upload Your Document
                                </h2>
                            </div>
                            <div className="flex flex-col gap-5">

                                <label className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition h-[150px] w-full'>
                                    <Upload className="w-8 h-8 mx-auto mb-2 mt-4 text-gray-400 dark:text-gray-500 " />
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                        JPG, PNG or PDF (Max 5MB)
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className='hidden'
                                    />
                                </label>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setSelectedFile(null);
                                            setCurrentDocType(null);
                                        }}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleSingleUpload}
                                        disabled={loading}
                                        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700 transition-colors"
                                    >
                                        {loading ? "Uploading..." : "Upload"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )} */}

                {/* Upload Modal */}
                {isOpen && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
                            <div className="text-center mb-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: 360 }}
                                    transition={{ type: "spring", duration: 0.8 }}
                                    className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl"
                                >
                                    <Upload className="w-10 h-10 text-white" />
                                </motion.div>
                                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    Upload Your Document
                                </h2>
                            </div>

                            <div className="flex flex-col gap-5">

                                {/* Upload Zone */}
                                <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition h-[150px] w-full cursor-pointer flex flex-col items-center justify-center">
                                    {selectedFile && selectedFile.type.startsWith("image/") ? (
                                        // Image Preview
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Preview"
                                            className="h-full max-h-[110px] object-contain rounded-md"
                                        />
                                    ) : selectedFile ? (
                                        // PDF / non-image file
                                        <div className="flex flex-col items-center gap-2">
                                            <FileText className="w-10 h-10 text-blue-400" />
                                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-[220px]">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    ) : (
                                        // Default state
                                        <>
                                            <Upload className="w-8 h-8 mb-2 text-gray-400 dark:text-gray-500" />
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                Click to upload
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                JPG, PNG or PDF (Max 5MB)
                                            </p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </label>

                                {/* File name + size strip — shows after selection */}
                                {selectedFile && (
                                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                {selectedFile.name}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2 shrink-0">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setSelectedFile(null);
                                            setCurrentDocType(null);
                                        }}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleSingleUpload}
                                        disabled={loading || !selectedFile}
                                        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50 hover:bg-green-700 transition-colors"
                                    >
                                        {loading ? "Uploading..." : "Upload"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDocument;