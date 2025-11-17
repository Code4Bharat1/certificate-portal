"use client";

import { motion } from "framer-motion";
import { Upload, FileSignature, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function OnboardingChecklist() {
  const [signature, setSignature] = useState(null);

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setSignature(fileUrl);
      localStorage.setItem("internSignature", fileUrl); // store for dashboard retrieval
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
          Offboarding Process Checklist
        </h1>

        {/* Pre-Offboarding Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-indigo-500 mb-4">
            Pre-Offboarding (Before Leaving)
          </h2>
          <h3 className="text-xl font-medium text-indigo-400 mb-2">
            Knowledge & Asset Handover
          </h3>
          <ul className="space-y-3 text-lg leading-relaxed">
            {[
              "Transfer ongoing work responsibilities and prepare required documents.",
              "Collect office assets (ID card, company documents).",
              "Revoke access to emails, software, and internal systems.",
              "Inform teams about the transition.",
              "Biometric Removal.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="text-indigo-500 mt-1 w-5 h-5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Documentation Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-indigo-500 mb-4">
            Documentation
          </h2>
          <ul className="space-y-3 text-lg leading-relaxed">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-indigo-500 mt-1 w-5 h-5" />
              <span>Issue experience certificate and relieving letter (if any).</span>
            </li>
          </ul>
        </section>

        {/* Signatures Section */}
        <div className="mt-16 border-t border-gray-300 dark:border-gray-700 pt-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-center">
          {/* HR Section */}
          <div>
            <div className="border-b border-gray-400 dark:border-gray-600 w-3/4 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">HR</p>
            <p className="text-sm text-gray-400 mt-1">(Authorized Signatory)</p>
          </div>

          {/* Intern Section */}
          <div>
            {signature ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <img
                  src={signature}
                  alt="Intern Signature"
                  className="w-48 h-24 object-contain mx-auto mb-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-50 dark:bg-gray-900"
                />
              </motion.div>
            ) : (
              <label className="cursor-pointer inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-400 font-medium transition-all">
                <Upload className="w-5 h-5" />
                Upload Signature
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="hidden"
                />
              </label>
            )}
            <div className="border-b border-gray-400 dark:border-gray-600 w-3/4 mx-auto mb-2 mt-3"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Intern</p>
          </div>
        </div>
      </motion.div>

        <div className="bg-neutral-900 text-white px-8 py-6 text-center border-t-4 border-blue-600">
          <p className="font-bold text-sm mb-1 uppercase tracking-widest">© 2024 Nexcore Alliance</p>
          <p className="text-neutral-400 text-xs">All rights reserved. For queries, contact administration.</p>
        </div>
   
    </div>
  );
}
