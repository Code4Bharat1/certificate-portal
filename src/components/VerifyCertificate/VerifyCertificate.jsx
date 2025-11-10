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
  Download,
  Share2,
  BadgeCheck,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

export default function VerifyCertificate() {
  const router = useRouter();
  const [verifyId, setVerifyId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
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

  const fetchCertificatePreview = async (id) => {
    setLoadingPreview(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/certificates/${id}/download/jpg`,
        {
          responseType: "blob",
        }
      );
      setPreviewImage(URL.createObjectURL(res.data));
    } catch {
      setPreviewImage(null);
    } finally {
      setLoadingPreview(false);
    }
  };

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
      const { valid, data } = res.data;
      const result = {
        valid,
        id: data?.certificateId || idToVerify,
        name: data?.name,
        course: data?.course,
        date: data?.issueDate,
        category: data?.category,
        status: data?.status,
      };
      setVerificationResult(result);
      updateRecent(result);
      if (valid) {
        toast.success("Certificate verified successfully!");
        fetchCertificatePreview(result.id);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3500);
      } else toast.error("Invalid certificate!");
    } catch {
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

  const reset = () => {
    setVerificationResult(null);
    setVerifyId("");
    setPreviewImage(null);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
      <Toaster position="top-right" />

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-10 left-20 w-72 h-72 bg-emerald-300/20 blur-3xl rounded-full animate-pulse-slow" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-green-300/20 blur-3xl rounded-full animate-pulse-slow" />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left mb-8 px-4 md:px-16 mt-8 gap-4">
        {typeof window !== "undefined" &&
          sessionStorage.getItem("authToken") && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="fixed top-6 left-6 z-50 bg-white text-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all border border-gray-200"
            >
              <ArrowLeft className="w-6 h-6" />
            </motion.button>
          )}
        <div className="flex-1 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Certificate Verification Portal
          </h1>
          <p className="text-gray-600 mt-3 text-sm sm:text-base md:text-lg">
            Verify certificates issued by <strong>Code4Bharat</strong> under{" "}
            <strong className="text-emerald-600">Nexcore Alliance</strong>.
          </p>
        </div>
      </div>

      {/* Verification Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl border border-emerald-100 rounded-3xl shadow-2xl p-8 relative overflow-hidden"
      >
        {/* Confetti animation */}
        {confetti && (
          <motion.div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            animate={{
              y: [0, -20, 0],
              opacity: [1, 0.5, 0],
            }}
            transition={{ duration: 3 }}
          >
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `float ${
                    1 + Math.random() * 3
                  }s ease-in-out infinite`,
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Input */}
        <div className="flex flex-col md:flex-row gap-3 relative z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 w-6 h-6" />
            <input
              type="text"
              value={verifyId}
              onChange={(e) => setVerifyId(e.target.value)}
              placeholder="Enter Certificate ID"
              onKeyPress={(e) => e.key === "Enter" && handleVerify()}
              disabled={isVerifying}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-emerald-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 outline-none text-gray-800 shadow-sm"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleVerify()}
            disabled={isVerifying || !verifyId.trim()}
            className={`px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all ${
              isVerifying
                ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:shadow-lg"
            }`}
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Verifying
              </>
            ) : (
              <>
                <BadgeCheck className="w-5 h-5" /> Verify
              </>
            )}
          </motion.button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {verificationResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className={`mt-10 rounded-2xl p-6 ${
                verificationResult.valid
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200"
                  : "bg-gradient-to-br from-red-50 to-pink-50 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
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
                  className={`text-xl font-bold ${
                    verificationResult.valid ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {verificationResult.valid
                    ? "Authentic Certificate"
                    : "Invalid Certificate"}
                </h2>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div className="flex items-start gap-3 bg-white rounded-xl border border-emerald-100 p-4 shadow-sm hover:shadow-md transition-all">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Certificate ID
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-700 font-semibold">
                        {verificationResult.id}
                      </p>
                      <Copy
                        className="w-4 h-4 text-gray-500 cursor-pointer hover:text-emerald-600"
                        onClick={() => copyToClipboard(verificationResult.id)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white rounded-xl border border-emerald-100 p-4 shadow-sm hover:shadow-md transition-all">
                  <User className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Recipient
                    </p>
                    <p className="text-gray-700 font-semibold">
                      {verificationResult.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white rounded-xl border border-emerald-100 p-4 shadow-sm hover:shadow-md transition-all">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Course/Program
                    </p>
                    <p className="text-gray-700 font-semibold">
                      {verificationResult.course}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white rounded-xl border border-emerald-100 p-4 shadow-sm hover:shadow-md transition-all">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">
                      Issue Date
                    </p>
                    <p className="text-gray-700 font-semibold">
                      {verificationResult.date
                        ? new Date(verificationResult.date).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              {/* <-- fixed: closing div for Info Grid added here */}

              {verificationResult.valid ? (
                <>
                  <p className="text-gray-700 mb-5">
                    Verified successfully! Issued by{" "}
                    <strong>Code4Bharat</strong> under{" "}
                    <strong>Nexcore Alliance</strong>.
                  </p>

                  {loadingPreview ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    </div>
                  ) : previewImage ? (
                    <motion.img
                      src={previewImage}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-2xl border border-emerald-100 shadow-xl"
                      alt="Certificate"
                      onClick={() => window.open(previewImage, "_blank")}
                    />
                  ) : (
                    <div className="p-6 border border-dashed border-gray-300 text-center text-gray-600 rounded-xl">
                      Preview not available
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <a
                      href={`${API_URL}/api/certificates/${verificationResult.id}/download/pdf`}
                      target="_blank"
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" /> Download PDF
                    </a>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}${window.location.pathname}?id=${verificationResult.id}`;
                        copyToClipboard(link);
                      }}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg flex items-center gap-2"
                    >
                      <Copy className="w-5 h-5" /> Copy Link
                    </button>
                    <button
                      onClick={() =>
                        window.open(
                          `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.origin}${window.location.pathname}?id=${verificationResult.id}`,
                          "_blank"
                        )
                      }
                      className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg flex items-center gap-2"
                    >
                      <Share2 className="w-5 h-5" /> Share
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-red-700">
                  Certificate ID not found. Please recheck and try again.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Company Info Carousel */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mt-20 max-w-6xl mx-auto bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-emerald-100 p-10"
      >
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-6">
          Powered by Nexcore Alliance
        </h2>

        <div className="overflow-hidden relative">
          <div className="flex animate-scroll-x space-x-12 items-center">
            {[
              "Code4Bharat",
              "Marketiq Junction",
              "Student Alliance",
              "Edu Momentum",
            ].map((n, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 min-w-[250px] text-center hover:shadow-xl transition-all"
              >
                <Sparkles className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800">{n}</h3>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Floating Footer */}
      <footer className="fixed bottom-5 left-1/2 -translate-x-1/2 backdrop-blur-md bg-white/70 border border-emerald-100 rounded-full px-6 py-2 shadow-lg flex items-center gap-2 text-sm text-gray-700">
        <Shield className="w-4 h-4 text-emerald-500" />
        <span>
          Secured by Nexcore Alliance | Code4Bharat © {new Date().getFullYear()}
        </span>
      </footer>
    </div>
  );
}

