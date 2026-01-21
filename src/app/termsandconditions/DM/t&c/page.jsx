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
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      
      setSignatureFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
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
      const submitData = {
        fullName: formData.fullName,
        aadharNumber: formData.aadharNumber,
        date: formData.date,
        signatureFileName: signatureFile.name,
        signatureData: signaturePreview,
        submittedAt: new Date().toISOString()
      };
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // console.log('Form Data Submitted to Admin:', submitData);
      
      setSubmitStatus('success');
      alert('✅ Terms & Conditions submitted successfully! Admin will review your application.');
      
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
    <div className="min-h-screen bg-neutral-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-sm border border-neutral-200">
        
        {/* Professional Header */}
        <div className="bg-neutral-900 text-white px-8 md:px-12 py-10">
          <div className="border-l-4 border-blue-600 pl-6">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-2">Legal Document</p>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Terms & Conditions</h1>
            <p className="text-neutral-300 text-lg">Nexcore Alliance Training Program</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 md:px-12 py-12">
          
          {/* Section 1 */}
          <div className="mb-10 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                01
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  Program Duration
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  The program consists of 6 months total — 4 months of intensive training followed by 2 months of unpaid internship or live project work.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-10 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                02
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  Performance & Live Projects
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  Only performing students who meet the evaluation benchmarks will get the opportunity to work on live industry projects under the supervision of the Nexcore Alliance technical team.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-10 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                03
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  KPI Fulfillment
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  Each student is required to achieve Key Performance Indicators (KPIs) set by the company, including attendance, project submissions, and technical performance scores.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-10 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                04
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  Attendance Policy
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  A minimum of 85% attendance is mandatory. Students with attendance below this threshold will not be eligible for placement assistance until they clear a technical audit conducted by the company.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-10 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                05
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  Code of Conduct
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  Any form of misconduct, indiscipline, or violation of company rules may result in immediate suspension from sessions and/or disqualification from placement assistance. Nexcore Alliance reserves full rights to make such decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Section 6 - Important */}
          <div className="mb-10 pb-8 border-b border-neutral-200 bg-amber-50 -mx-8 md:-mx-12 px-8 md:px-12 py-8 border-l-4 border-amber-600">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-amber-600 text-white font-bold text-lg flex items-center justify-center">
                06
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-neutral-900 text-xl font-bold uppercase tracking-wide">
                    Non-Refundable Policy
                  </h2>
                  <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">Critical</span>
                </div>
                <p className="text-neutral-700 leading-relaxed">
                  <strong className="text-neutral-900 font-bold">All fees paid are strictly non-refundable under any circumstances</strong> — including absence, withdrawal, or change of mind. However, students may attend future batches without extra cost (subject to approval and seat availability).
                </p>
              </div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-10 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                07
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  Company Rights & Intellectual Property
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  All materials, projects, and software developed during the program remain the intellectual property of Nexcore Alliance. The company reserves the right to modify training schedules, trainers, or program structure as required for operational or academic reasons.
                </p>
              </div>
            </div>
          </div>

          {/* Section 8 */}
          <div className="mb-10 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                08
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  Compliance & Discipline
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  Students must maintain professional behavior, respect faculty, and follow all company rules, dress code, and communication protocols. Misuse of company resources, breach of confidentiality, or sharing of course material outside the organization is strictly prohibited.
                </p>
              </div>
            </div>
          </div>

          {/* Section 9 */}
          <div className="mb-12 pb-8 border-b border-neutral-200">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-neutral-900 text-white font-bold text-lg flex items-center justify-center">
                09
              </div>
              <div className="flex-1">
                <h2 className="text-neutral-900 text-xl font-bold mb-3 uppercase tracking-wide">
                  Legal & Payment Assurance Clause
                </h2>
                <p className="text-neutral-700 leading-relaxed">
                  Any default in payment or breach of the signed agreement may lead to termination of participation and legal recovery action as per company policy. All disputes will be subject to Mumbai jurisdiction.
                </p>
              </div>
            </div>
          </div>

          {/* Declaration Section */}
          <div className="mt-16 border-t-4 border-neutral-900 pt-12">
            <div className="mb-10">
              <h3 className="text-neutral-900 text-2xl font-bold uppercase tracking-wide mb-4">
                Declaration & Acknowledgment
              </h3>
              <p className="text-neutral-700 leading-relaxed text-base">
                I have read and understood all the above terms and conditions. I agree to abide by the rules, policies, and payment terms of Nexcore Alliance. I acknowledge that the fee once paid is non-refundable and undertake to complete all KPIs and attendance requirements.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 bg-neutral-50 p-8 border border-neutral-200">
              <div>
                <label className="block font-bold text-neutral-900 mb-2 text-xs uppercase tracking-widest">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none transition bg-white text-neutral-900"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-900 mb-2 text-xs uppercase tracking-widest">
                  Aadhar Card Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  maxLength="12"
                  className="w-full p-4 border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none transition bg-white text-neutral-900"
                  placeholder="Enter 12-digit Aadhar number"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-900 mb-2 text-xs uppercase tracking-widest">
                  Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full p-4 border-2 border-neutral-300 focus:border-neutral-900 focus:outline-none transition bg-white text-neutral-900"
                />
              </div>

              {/* Signature Upload */}
              <div>
                <label className="block font-bold text-neutral-900 mb-2 text-xs uppercase tracking-widest">
                  Upload Signature <span className="text-red-600">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="block w-full text-sm text-neutral-700 file:mr-4 file:py-4 file:px-6 file:border-0 file:text-xs file:font-bold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 file:cursor-pointer file:uppercase file:tracking-widest cursor-pointer border-2 border-neutral-300 bg-white"
                  />
                  <p className="text-xs text-neutral-500 mt-2">Accepted: JPG, PNG, GIF (Max 5MB)</p>
                </div>
                
                {signaturePreview && (
                  <div className="mt-6 p-6 border-2 border-neutral-300 bg-white">
                    <p className="text-xs font-bold text-neutral-900 mb-3 uppercase tracking-widest">Signature Preview</p>
                    <div className="border-2 border-neutral-200 p-4 bg-neutral-50">
                      <img 
                        src={signaturePreview} 
                        alt="Signature preview" 
                        className="max-h-32 mx-auto"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${
                isSubmitting 
                  ? 'bg-neutral-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold py-4 px-12 transition uppercase tracking-widest text-xs`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
            
            <button
              onClick={handlePrint}
              className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold py-4 px-12 transition uppercase tracking-widest text-xs"
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