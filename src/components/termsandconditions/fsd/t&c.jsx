"use client";
import React, { useState } from 'react';

export default function TermsAndConditions() {
  const [formData, setFormData] = useState({
    fullName: '',
    aadharNumber: '',
    date: ''
  });
  
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setSignatureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.fullName || !formData.aadharNumber || !formData.date) {
      alert('Please fill all required fields');
      return;
    }
    
    if (!signatureFile) {
      alert('Please upload your signature');
      return;
    }
    
    if (formData.aadharNumber.length !== 12) {
      alert('Aadhar number must be 12 digits');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Prepare form data
      const submitData = {
        fullName: formData.fullName,
        aadharNumber: formData.aadharNumber,
        date: formData.date,
        signatureFileName: signatureFile.name,
        signatureData: signaturePreview,
        submittedAt: new Date().toISOString()
      };
      
      // Replace this with your actual API endpoint
      // const response = await fetch('/api/submit-terms', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submitData)
      // });
      
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      // console.log('Form Data Submitted to Admin:', submitData);
      
      setSubmitStatus('success');
      alert('✅ Terms & Conditions submitted successfully! Admin will review your application.');
      
      // Reset form
      setFormData({ fullName: '', aadharNumber: '', date: '' });
      setSignatureFile(null);
      setSignaturePreview(null);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
      alert('❌ Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-slate-800 text-white p-8 md:p-12">
          <div className="border-l-4 border-amber-500 pl-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Terms & Conditions</h1>
            <p className="text-lg text-gray-300">Nexcore Alliance Training Program</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 md:p-12">
          {/* Program Duration */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              Program Duration
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              The program consists of 6 months total — 4 months of intensive training followed by 2 months of unpaid internship or live project work.
            </p>
          </div>

          {/* Performance & Live Projects */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              Performance & Live Projects
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              Only performing students who meet the evaluation benchmarks will get the opportunity to work on live industry projects under the supervision of the Nexcore Alliance technical team.
            </p>
          </div>

          {/* KPI Fulfillment */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              KPI Fulfillment
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              Each student is required to achieve Key Performance Indicators (KPIs) set by the company, including attendance, project submissions, and technical performance scores.
            </p>
          </div>

          {/* Attendance Policy */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              Attendance Policy
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              A minimum of 85% attendance is mandatory. Students with attendance below this threshold will not be eligible for placement assistance until they clear a technical audit conducted by the company.
            </p>
          </div>

          {/* Code of Conduct */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              Code of Conduct
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              Any form of misconduct, indiscipline, or violation of company rules may result in immediate suspension from sessions and/or disqualification from placement assistance. Nexcore Alliance reserves full rights to make such decisions.
            </p>
          </div>

          {/* Non-Refundable Policy - Highlighted */}
          <div className="mb-8 pb-6 border-b border-gray-200 bg-amber-50 -mx-8 md:-mx-12 px-8 md:px-12 py-6">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
              Non-Refundable Policy
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              <strong className="text-slate-900 font-bold">All fees paid are strictly non-refundable under any circumstances</strong> — including absence, withdrawal, or change of mind. However, students may attend future batches without extra cost (subject to approval and seat availability).
            </p>
          </div>

          {/* Company Rights & Intellectual Property */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              Company Rights & Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              All materials, projects, and software developed during the program remain the intellectual property of Nexcore Alliance. The company reserves the right to modify training schedules, trainers, or program structure as required for operational or academic reasons.
            </p>
          </div>

          {/* Compliance & Discipline */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              Compliance & Discipline
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              Students must maintain professional behavior, respect faculty, and follow all company rules, dress code, and communication protocols. Misuse of company resources, breach of confidentiality, or sharing of course material outside the organization is strictly prohibited.
            </p>
          </div>

          {/* Legal & Payment Assurance Clause */}
          <div className="mb-10 pb-6 border-b border-gray-200">
            <h2 className="text-slate-800 text-xl font-bold mb-3 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-3"></span>
              Legal & Payment Assurance Clause
            </h2>
            <p className="text-gray-700 leading-relaxed pl-5">
              Any default in payment or breach of the signed agreement may lead to termination of participation and legal recovery action as per company policy. All disputes will be subject to Mumbai jurisdiction.
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-12 p-8 bg-slate-50 border-2 border-slate-300">
            <h3 className="text-slate-800 text-2xl font-bold mb-6 pb-3 border-b-2 border-amber-500 inline-block">
              Declaration & Acknowledgment
            </h3>
            <p className="text-gray-700 leading-relaxed mb-8 mt-6">
              I have read and understood all the above terms and conditions. I agree to abide by the rules, policies, and payment terms of Nexcore Alliance. I acknowledge that the fee once paid is non-refundable and undertake to complete all KPIs and attendance requirements.
            </p>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-300 focus:border-slate-800 focus:outline-none transition bg-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">
                  Aadhar Card Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  maxLength="12"
                  className="w-full p-3 border-2 border-gray-300 focus:border-slate-800 focus:outline-none transition bg-white"
                  placeholder="Enter 12-digit Aadhar number"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">
                  Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-3 border-2 border-gray-300 focus:border-slate-800 focus:outline-none transition bg-white"
                />
              </div>

              {/* Signature Upload */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2 text-sm uppercase tracking-wide">
                  Upload Signature <span className="text-red-600">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-6 file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-900 file:cursor-pointer cursor-pointer border-2 border-gray-300 focus:border-slate-800"
                  />
                  <p className="text-xs text-gray-500 mt-2">Accepted formats: JPG, PNG, GIF (Max 5MB)</p>
                </div>
                
                {/* Signature Preview */}
                {signaturePreview && (
                  <div className="mt-4 p-4 border-2 border-slate-300 bg-white">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Signature Preview:</p>
                    <img 
                      src={signaturePreview} 
                      alt="Signature preview" 
                      className="max-h-32 border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              } text-white font-semibold py-4 px-12 transition duration-300 uppercase tracking-wider text-sm shadow-lg`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 px-12 transition duration-300 uppercase tracking-wider text-sm shadow-lg"
            >
              Print Document
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-900 text-white px-8 py-6 text-center border-t-4 border-blue-600">
          <p className="font-bold text-sm mb-1 uppercase tracking-widest">© 2024 Nexcore Alliance</p>
          <p className="text-neutral-400 text-xs">All rights reserved. For queries, contact administration.</p>
        </div>
      </div>
 

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body {
            background: white;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}