"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FileDown, Loader2, ArrowLeft } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

export default function PdfPreviewPage() {
  const router = useRouter();
  const [certId, setCertId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // ✅ Step 1: Load certificate ID from localStorage
  useEffect(() => {
    const storedId =
      typeof window !== "undefined"
        ? localStorage.getItem("verifiedCredentialId")
        : null;
    if (!storedId) {
      toast.error("No certificate found in localStorage.");
      return;
    }
    // console.log(storedId);
    
    setCertId(storedId);
  }, []);

  // ✅ Step 2: Verify and load the PDF file
  useEffect(() => {
    if (!certId) return;

    const verifyAndLoadPDF = async () => {
      try {
        const verifyRes = await axios.post(`${API_URL}/api/certificates/verify`, {
          certificateId: certId,
        });
        // console.log("Verification response:", verifyRes.data);

        if (!verifyRes.data?.valid) {
          toast.error("Invalid or unauthorized certificate ID");
          return;
        }4

        // console.log(certId);
        

        const pdfResponse = await axios.get(
          `${API_URL}/api/letters/${certId}/download.pdf`,
          { responseType: "blob" }
        );

        // const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
        const url = URL.createObjectURL(pdfResponse.data);
        setPdfUrl(url);
      } catch (error) {
        console.error("PDF load error:", error);
        toast.error("Failed to load PDF");
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoadPDF();
  }, [certId]);

  // ✅ Step 3: Handle PDF Download
  const handleDownload = async () => {
    if (!certId) return toast.error("Invalid certificate ID");

    try {
      setDownloading(true);
      const response = await axios.get(
        `${API_URL}/api/letters/${certId}/download.pdf`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `certificate-${certId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);

      toast.success("Download started!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 flex flex-col items-center p-6">
      <Toaster position="top-center" />
      <div className="flex items-center w-full max-w-5xl mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 w-full max-w-5xl"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Letter Preview
        </h1>

        {/* ✅ Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            <p className="mt-2 text-gray-500">Verifying and loading PDF...</p>
          </div>
        ) : pdfUrl ? (
          // ✅ PDF Preview Frame
          <div className="relative w-full h-[80vh]">
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              className="w-full h-full border rounded-xl shadow-inner"
              title="Certificate PDF"
            />
            <div className="absolute top-3 right-3 bg-white/80 dark:bg-gray-900/70 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 shadow-md">
              Preview Mode
            </div>
          </div>
        ) : (
          <p className="text-center text-red-500">
            Unable to load PDF preview.
          </p>
        )}

        {/* ✅ Download Button */}
        <div className="flex justify-center mt-6 gap-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            disabled={downloading || loading}
            onClick={handleDownload}
            className={`flex items-center px-5 py-3 rounded-xl font-medium shadow-lg transition-all ${
              downloading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {downloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Downloading...
              </>
            ) : (
              <>
                <FileDown className="w-5 h-5" /> Download PDF
              </>
            )}
          </motion.button>
            <button
            onClick={() =>
            router.push('/termsandconditions/C4B/onboard')
            }
            className={`flex items-center gap-3 px-5 py-3 ml-15 rounded-xl font-medium shadow-lg transition-all ${
              downloading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Go to On Boarding
     
          </button>
          
        </div>
      </motion.div>
    </div>
  );
}   
