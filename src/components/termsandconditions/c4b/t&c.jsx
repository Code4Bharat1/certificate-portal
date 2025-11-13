"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSignature, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
export default function TermsAndConditions() {
  const [signature, setSignature] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) setSignature(URL.createObjectURL(file));
  };
 const handleSubmit = () => {
    if (accepted && signature) {
      router.push("/termsandconditions/C4B/pdf"); // ✅ redirects after submit
    
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100 flex flex-col items-center py-10 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-700"
      >
        <h1 className="text-4xl font-bold text-center mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          Terms & Conditions
        </h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-10">
          Intern Staff Rules, Regulations & Promotion Policy — Kurla West Office
        </p>

        {/* MAIN TERMS CONTENT */}
        <div className="space-y-8 text-lg leading-relaxed">
          {/* Staff Rules */}
          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">
              Welcome to Our Team!
            </h2>
            <p>
              At our Kurla West office, we aim to provide a professional yet enjoyable environment
              for our interns. The workspace includes separate facilities for female staff, a Namaz
              room, and a safe, comfortable area designed for learning and collaboration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">
              1. Work Hours and Attendance
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Flexible start time between 8:00 AM and 11:00 AM (recommended 9 AM to 5 PM).</li>
              <li>Minimum 8 hours per day, 6 days a week, with a 45-minute break.</li>
              <li>Punctuality is essential — adhere to your chosen schedule consistently.</li>
              <li>All leaves must be pre-approved by both your college and the company.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">2. Dress Code</h2>
            <p>
              Maintain formal and professional attire at all times. Occasional flexibility is fine,
              as long as your attire remains appropriate for a work environment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">3. Work Environment</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>CCTV cameras are installed for safety and accountability.</li>
              <li>Maintain cleanliness and respect shared office spaces.</li>
              <li>Use the workspace responsibly and productively.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">4. Code of Conduct</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Respect is mandatory — toward colleagues, timelines, and property.</li>
              <li>Encourage teamwork, positivity, and collaboration.</li>
              <li>Maintain professionalism and avoid gossip or conflicts.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">5. Confidentiality</h2>
            <p>
              All interns must sign an NDA. Any company-related data, project work, or
              communication must not be shared outside the organization without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">6. Learning and Growth</h2>
            <p>
              Mistakes are a part of learning — take responsibility, seek feedback, and grow.
              Constructive feedback helps both you and your team develop professionally.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">7. Perks of the Job</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Namaz room for prayer and reflection.</li>
              <li>Dedicated female washrooms for comfort and safety.</li>
              <li>Flexible timings to ensure work-life balance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">8. General Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Keep your workspace organized and tidy.</li>
              <li>Use office resources responsibly (including Wi-Fi usage).</li>
              <li>Communicate openly with supervisors and HR regarding concerns.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-2 text-indigo-500">Our Golden Rule</h2>
            <p>
              Work hard, learn harder, and enjoy your journey here. Maintain discipline with
              professionalism, and balance it with humor and positivity. You’re here to grow — not
              just clock in and out.
            </p>
          </section>

          {/* =========================
              INTERN PROMOTION RULES
          ========================== */}
          <section>
            <h2 className="text-3xl font-bold mt-12 mb-6 text-purple-500">
              Intern Promotion Rules and Format
            </h2>

            <h3 className="text-xl font-semibold mb-2 text-indigo-500">
              Internship Levels and Stipends
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Trainee (Unpaid): Entry-level for learning foundational skills.</li>
              <li>Trainee (Paid): ₹3,000/month.</li>
              <li>Assistant: ₹5,000/month.</li>
              <li>Associate: ₹7,000/month.</li>
              <li>Executive: ₹10,000/month.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2 text-indigo-500">
              Promotion Criteria
            </h3>
            <p>Intern promotions are based on one of the following:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Completion of 800+ Hours:</strong> Verified via attendance and live project
                logs.
              </li>
              <li>
                <strong>Performance Consistency:</strong> Maintain an average of 8/10 or higher for
                3 consecutive months.
              </li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2 text-indigo-500">Rules & Regulations</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Weekly evaluations by mentors ensure performance transparency.</li>
              <li>A final review meeting with the Director and supervisor is mandatory.</li>
              <li>Violations of policy may disqualify interns from promotions.</li>
              <li>
                Interns must submit a summary of project contributions during evaluation.
              </li>
              <li>
                Grievances must be emailed to{" "}
                <span className="text-indigo-400 font-medium">hr@nexcorealliance.com</span> within
                5 working days.
              </li>
              <li>Stipend increments apply from the next payment cycle post-promotion.</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-2 text-indigo-500">
              Promotion Pathway
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 dark:border-gray-700 text-left border-collapse">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border p-3">Current Level</th>
                    <th className="border p-3">Next Level</th>
                    <th className="border p-3">Stipend</th>
                    <th className="border p-3">Eligibility</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-3">Trainee (Unpaid)</td>
                    <td className="border p-3">Trainee (Paid)</td>
                    <td className="border p-3">₹3,000</td>
                    <td className="border p-3">As per Director’s remark</td>
                  </tr>
                  <tr>
                    <td className="border p-3">Trainee (Paid)</td>
                    <td className="border p-3">Assistant</td>
                    <td className="border p-3">₹5,000</td>
                    <td className="border p-3">
                      800 hours OR 8+ average score for 3 months
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-3">Assistant</td>
                    <td className="border p-3">Associate</td>
                    <td className="border p-3">₹7,000</td>
                    <td className="border p-3">
                      1000 hours OR 8+ average score for 5 months
                    </td>
                  </tr>
                  <tr>
                    <td className="border p-3">Associate</td>
                    <td className="border p-3">Executive</td>
                    <td className="border p-3">₹10,000</td>
                    <td className="border p-3">
                      1200 hours OR 8+ average score for 6 months
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-2 text-indigo-500">Additional Notes</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Promotions reward consistent effort and active participation.</li>
              <li>Interns should track their hours and progress regularly.</li>
              <li>HR reserves the final decision in special circumstances.</li>
            </ul>
          </section>
        </div>

        {/* Acceptance Section */}
        <div className="mt-12 border-t border-gray-300 dark:border-gray-700 pt-8 space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="accept"
              checked={accepted}
              onChange={() => setAccepted(!accepted)}
              className="w-5 h-5 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="accept" className="text-base cursor-pointer">
              I have read and agree to the Terms, Regulations, and Promotion Policy
            </label>
          </div>

          {/* Signature Upload */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-500">
              <FileSignature className="w-6 h-6" /> Upload Your Signature
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-4">
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
              {signature && (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={signature}
                  alt="Signature"
                  className="w-40 h-20 object-contain border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-center">
  <button
          onClick={handleSubmit} // ✅ added click handler
          disabled={!accepted}
          className={`${
            accepted
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "bg-gray-400 cursor-not-allowed"
          } text-white font-medium px-6 py-2 rounded-xl shadow-md transition`}
        >
          <CheckCircle className="inline mr-2 w-5 h-5" />
          Submit & Accept
        </button>
          </div>
        </div>
      </motion.div>

      <p className="text-center mt-6 text-gray-400 text-sm">
        © {new Date().getFullYear()} Kurla West Office. All rights reserved.
      </p>
    </div>
  );
}
