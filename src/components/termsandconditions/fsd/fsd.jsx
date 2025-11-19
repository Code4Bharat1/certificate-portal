"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  Loader2,
  Award,
  Calendar,
  User,
  Copy,
  Shield,
  BadgeCheck,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

export default function Verify() {
  const router = useRouter();
  const [verifyId, setVerifyId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const certId = urlParams.get("id");
      if (certId) {
        setVerifyId(certId);
        handleVerify(certId);
      }
      const stored = localStorage.getItem("recentVerifications");
      if (stored) setRecentVerifications(JSON.parse(stored).slice(0, 5));
    }
  }, []);

  // const fetchCertificatePreview = async (id) => {
  //   try {
  //     const res = await axios.get(
  //       `${API_URL}/api/certificates/${id}/download/jpg`,
  //       { responseType: "blob" }
  //     );
  //     setPreviewImage(URL.createObjectURL(res.data));
  //   } catch {
  //     setPreviewImage(null);
  //   }
  // };

  const handleVerify = async (customId) => {
    const idToVerify = customId || verifyId.trim();
    if (!idToVerify) return toast.error("Please enter a certificate ID");

    setIsVerifying(true);
    setVerificationResult(null);
    setPreviewImage(null);

    try {
      const res = await axios.post(`${API_URL}/api/certificates/verify`, {
        certificateId: idToVerify,
      });
      console.log("Verification response:", res);

      const { valid, data } = res.data;
      const result = {
        valid,
        id: data?.certificateId || idToVerify,
        name: data?.name,
        course: data?.course,
        date: data?.issueDate,
      };
      setVerificationResult(result);
      updateRecent(result);

      if (valid) {
        toast.success("Certificate verified successfully!");
        // fetchCertificatePreview(result.id);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      } else toast.error("Invalid certificate!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to verify certificate. Try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const updateRecent = (r) => {
    const stored = localStorage.getItem("recentVerifications");
    const existing = stored ? JSON.parse(stored) : [];
    const updated = [
      {
        id: r.id,
        name: r.name,
        valid: r.valid,
        timestamp: new Date().toISOString(),
      },
      ...existing.filter((v) => v.id !== r.id).slice(0, 4),
    ];
    localStorage.setItem("recentVerifications", JSON.stringify(updated));
    setRecentVerifications(updated);
  };

  const copyToClipboard = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied!");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 via-green-50 to-emerald-100 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="text-center py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
        >
          Certificate Verification Portal
        </motion.h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-base sm:text-lg">
          Verify your certificate issued by <strong>Code4Bharat</strong> under{" "}
          <strong className="text-emerald-600">Nexcore Alliance</strong>.
        </p>
      </div>

      {/* MAIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto bg-white dark:bg-gray-800/90 backdrop-blur-xl border border-emerald-100 dark:border-gray-700 shadow-2xl rounded-3xl p-8 md:p-12 mb-20"
      >
        {/* Input Row */}
        <div className="flex flex-col md:flex-row gap-3 relative">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
            <input
              type="text"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              placeholder="Enter Certificate ID"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              disabled={isVerifying}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-emerald-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-gray-800 shadow-sm dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleVerify()}
            disabled={isVerifying || !verifyId.trim()}
            className={`px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
              isVerifying
                ? "bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg"
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying...
              </>
            ) : (
              <>
                <BadgeCheck className="w-5 h-5" /> Verify
              </>
            )}
          </motion.button>
        </div>

        {/* Verification Result */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className={`mt-10 rounded-2xl p-8 ${
                verificationResult.valid
                  ? "bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 dark:from-emerald-900/30 dark:to-gray-900"
                  : "bg-gradient-to-br from-red-50 to-pink-100 border border-red-200 dark:from-red-900/30 dark:to-gray-900"
              }`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`p-4 rounded-xl ${
                    verificationResult.valid
                      ? "bg-gradient-to-br from-green-500 to-emerald-600"
                      : "bg-gradient-to-br from-red-500 to-pink-600"
                  }`}
                >
                  {verificationResult.valid ? (
                    <CheckCircle className="w-8 h-8 text-white" />
                  ) : (
                    <XCircle className="w-8 h-8 text-white" />
                  )}
                </div>
                <h2
                  className={`text-2xl font-bold ${
                    verificationResult.valid
                      ? "text-green-800 dark:text-green-300"
                      : "text-red-800 dark:text-red-300"
                  }`}
                >
                  {verificationResult.valid
                    ? "Authentic Certificate"
                    : "Invalid Certificate"}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-xl border border-emerald-100 dark:border-gray-700 p-4 shadow-sm">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300 text-sm">
                      Certificate ID
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-700 dark:text-gray-100 font-semibold">
                        {verificationResult.id}
                      </p>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer hover:text-emerald-600"
                        onClick={() => copyToClipboard(verificationResult.id)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-xl border border-emerald-100 dark:border-gray-700 p-4 shadow-sm">
                  <User className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300 text-sm">
                      Recipient
                    </p>
                    <p className="text-gray-700 dark:text-gray-100 font-semibold">
                      {verificationResult.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-xl border border-emerald-100 dark:border-gray-700 p-4 shadow-sm">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300 text-sm">
                      Course/Program
                    </p>
                    <p className="text-gray-700 dark:text-gray-100 font-semibold">
                      {verificationResult.course}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-xl border border-emerald-100 dark:border-gray-700 p-4 shadow-sm">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-300 text-sm">
                      Issue Date
                    </p>
                    <p className="text-gray-700 dark:text-gray-100 font-semibold">
                      {verificationResult.date
                        ? new Date(verificationResult.date).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* NEXT Button */}
              {verificationResult.valid ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    localStorage.setItem(
                      "verifiedCredentialId",
                      verificationResult.id
                    );
                    router.push("/termsandconditions/C4B/t&c");
                  }}
                  className="mt-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                >
                  Proceed to Terms & Conditions →
                </motion.button>
              ) : (
                <p className="text-red-700 dark:text-red-400">
                  Certificate not found. Please verify again.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* FOOTER */}
      <footer className="text-center text-sm text-gray-600 dark:text-gray-400 py-6">
        <div className="bg-neutral-900 text-white px-8 py-6 text-center border-t-4 border-blue-600">
          <p className="font-bold text-sm mb-1 uppercase tracking-widest">© 2024 Nexcore Alliance</p>
          <p className="text-neutral-400 text-xs">All rights reserved. For queries, contact administration.</p>
        </div>
      </footer>
    </div>
  );
}
