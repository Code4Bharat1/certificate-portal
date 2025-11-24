"use client";

import { motion } from "framer-motion";
import { Upload, FileSignature } from "lucide-react";
import { useState, useEffect } from "react";

export default function OnboardingChecklist() {
  const [signature, setSignature] = useState(null);

  // USER DATA (example: stored after login)
  const [user, setUser] = useState(null);

  // Load user & signature
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedSignature = localStorage.getItem("internSignature");

    if (storedUser) setUser(storedUser);
    if (storedSignature) setSignature(storedSignature);
  }, []);

  // Send onboarding request to admin when signature is uploaded
  const notifyAdminPendingRequest = async (fileUrl) => {
    try {
      const res = await fetch("/api/onboarding-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?._id || "unknown",
          name: user?.name || "Unnamed User",
          signature: fileUrl,
          requestType: "onboarding",
          status: "pending",
          submittedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      console.log("Request Submitted:", data);
    } catch (error) {
      console.error("Error sending onboarding request:", error);
    }
  };

  // Handle signature upload
const handleSignatureUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Show preview to user
  const previewUrl = URL.createObjectURL(file);
  setSignature(previewUrl);
  localStorage.setItem("internSignature", previewUrl);

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  // Build FormData → IMPORTANT
  const formData = new FormData();
  formData.append("name", storedUser.name);
  formData.append("email", storedUser.email);
  formData.append("signature", file);

  // SEND MULTIPART request
  const res = await fetch("http://localhost:5235/api/onboarding-request", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (data.success) {
    alert("Your onboarding signature has been submitted!");

    // Redirect to dashboard or exit page
    window.location.href = "/dashboard"; 
  } else {
    alert("Something went wrong. Try again.");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Onboarding Process Checklist
        </h1>

        {/* Pre-Onboarding Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-indigo-500 mb-4">
            Pre-Onboarding (Before Joining)
          </h2>
          <ul className="space-y-3 text-lg leading-relaxed">
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Share offer letter and job description.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Collect necessary documents (Aadhar, PAN, bank details).</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Provide company policies and code of conduct.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Assign mentor or buddy for integration.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Biometric Access Control.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Tracky Onboarding Login Credentials.</span>
            </li>
          </ul>
        </section>

        {/* First Day & Training Section */}
        <section>
          <h2 className="text-2xl font-semibold text-indigo-500 mb-4">
            First Day & Training
          </h2>
          <ul className="space-y-3 text-lg leading-relaxed">
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Conduct HR and team introduction.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Provide workspace.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Issue credentials or ID card.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Explain KPIs & performance expectations.</span>
            </li>

            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Sign NDA.</span>
            </li>
          </ul>
        </section>

        {/* Signature Section */}
        <div className="mt-16 border-t border-gray-300 dark:border-gray-700 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          <div>
            <div className="border-b border-gray-400 dark:border-gray-600 w-3/4 mx-auto mb-2"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">HR</p>
          </div>

          <div>
            {signature ? (
              <motion.img
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={signature}
                alt="Signature"
                className="w-40 h-20 object-contain border border-gray-300 dark:border-gray-600 rounded-lg mx-auto mb-2"
              />
            ) : (
              <div className="border-b border-gray-400 dark:border-gray-600 w-3/4 mx-auto mb-2"></div>
            )}
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Intern</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mt-10 text-center">
          <h3 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2 text-purple-500">
            <FileSignature className="w-6 h-6" /> Upload Your Signature
          </h3>

          <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-400 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <Upload className="w-5 h-5" />
            <span>Choose File</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              className="hidden"
            />
          </label>
        </div>
      </motion.div>

      <div className="bg-neutral-900 text-white px-8 py-6 text-center border-t-4 border-blue-600">
        <p className="font-bold text-sm mb-1 uppercase tracking-widest">© 2025 Nexcore Alliance</p>
        <p className="text-neutral-400 text-xs">All rights reserved. For queries, contact administration.</p>
      </div>
    </div>
  );
}
