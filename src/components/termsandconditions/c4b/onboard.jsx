"use client";

import { motion } from "framer-motion";

export default function OnboardingChecklist() {
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
              <span>Collect necessary documents (ID proof - Aadhar Card, PAN Card, Bank details).</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Provide company policies and code of conduct.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Assign mentor or buddy for smoother integration.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Biometric Access Control.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Tracky Onboarding and Login Credentials.</span>
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
              <span>Issue work assets (ID card, credentials if required).</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Explain roles, KPIs, and performance expectations.</span>
            </li>
            <li className="flex items-start gap-3">
              <input type="checkbox" disabled className="w-5 h-5 accent-indigo-600 cursor-not-allowed mt-1" />
              <span>Sign Non-Disclosure Agreement (NDA).</span>
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
            <div className="border-b border-gray-400 dark:border-gray-600 w-3/4 mx-auto mb-2"></div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Intern</p>
          </div>
        </div>
      </motion.div>

      <p className="text-center mt-6 text-gray-400 text-sm">
        © {new Date().getFullYear()} Kurla West Office. All rights reserved.
      </p>
    </div>
  );
}
