//CodeLetter.jsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  Award,
  Tag,
  User,
  BookOpen,
  Calendar,
  Shield,
  CheckCircle,
  X,
  FileText,
  Upload,
  ArrowRight,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const DEV_MODE = true; // ⭐ Change to false for production

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5235";

export default function CodeLetter() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const [batches, setBatches] = useState({ fsd: [], bvoc: [] });

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    issueDate: "",
    letterType: "", // Main letter type
    course: "", // Subtype (or same as letterType if no subtype)
    description: "",
    subject: "",
    role: "",
    startDate: "",
    endDate: "",
    duration: "",
    batch: "",
    committeeType: "",
    attendancePercent: "",
    assignmentName: "",
    misconductReason: "",
    attendanceMonth: "",
    attendanceYear: "",
    performanceMonth: "",
    performanceYear: "",
    testingPhase: "",
    uncover: "",
    subjectName: "",
    projectName: "",
    auditDate: "",
    //
    trainingStartDate: "",
    trainingEndDate: "",
    officialStartDate: "",
    completionDate: "",
    responsibilities: "",
    amount: "",
    effectiveFrom: "",
    timelineStage: "",
    timelineProjectName: "",
    timelineDueDate: "",
    timelineNewDate: "",
    genderPronoun: "",
    month: "",
    year: "",
  });

  // Data Lists
  const [namesList, setNamesList] = useState([]);

  // OTP States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [otpVerified, setOtpVerified] = useState(false);

  // Success & preview
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [pdfPreview, setPdfPreview] = useState(null);

  const [adminPermissions, setAdminPermissions] = useState([]);

  // ✅ Load admin permissions on mount
  useEffect(() => {
    const adminData = sessionStorage.getItem("adminData");
    if (adminData) {
      try {
        const data = JSON.parse(adminData);
        setAdminPermissions(data.permissions || []);
      } catch (error) {
        console.error("Error parsing admin data:", error);
      }
    }
  }, []);

  // ✅ Filter categories based on permissions
  const categoryConfig = useMemo(() => {
    const allCategories = {
      "IT-Nexcore": {
        // ✅ Match backend exactly
        label: "IT-Nexcore",
        batches: [],
        permission: "it-nexcore",
      },
      "marketing-junction": {
        label: "Marketing Junction",
        batches: [],
        permission: "marketing-junction",
      },
      DM: {
        // ✅ Match backend exactly
        label: "Digital Marketing",
        batches: [],
        permission: "dm",
      },
      FSD: {
        // ✅ Match backend exactly
        label: "Full Stack Development",
        batches: batches.fsd || [],
        permission: "fsd",
      },
      HR: {
        // ✅ Match backend exactly
        label: "Human Resources",
        batches: [],
        permission: "hr",
      },
      BVOC: {
        // ✅ Match backend exactly
        label: "B.Voc",
        batches: batches.bvoc || [],
        permission: "bvoc",
      },
      "Operations Department": {
        // ✅ Match backend exactly
        label: "Operations Department",
        batches: [],
        permission: "operations",
      },
      // ❌ CLIENT REMOVED - Not needed for letter creation
    };

    // Super admin sees all
    if (adminPermissions.includes("admin_management")) {
      return allCategories;
    }

    // Filter based on permissions
    return Object.fromEntries(
      Object.entries(allCategories).filter(([key, config]) =>
        adminPermissions.includes(config.permission)
      )
    );
  }, [adminPermissions, batches]);

  // Letter types and subtypes configuration
  const getLetterTypesConfig = (category) => {
    if (category === "IT-Nexcore") {
      return {
        "Appreciation Letter": [],
        "Experience Certificate": [],
        "Internship Joining Letter": [
          "Internship Joining Letter - Paid",
          "Internship Joining Letter - Unpaid",
        ],
        "Non-Disclosure Agreement": [],
        "Promotion Letter": ["Non Paid to Paid", "Stipend Revision"],
        "Timeline Letter": [],
      };
    } else if (category === "marketing-junction") {
      return {
        "Appreciation Letter": [],
        "Experience Certificate": [],
        "Internship Joining Letter": [
          "Internship Joining Letter - Paid",
          "Internship Joining Letter - Unpaid",
        ],
        "Non-Disclosure Agreement": [],
        "Promotion Letter": ["Non Paid to Paid", "Stipend Revision"],
        "Timeline Letter": [],
      };
    } else if (category === "FSD") {
      return {
        "Appreciation Letter": [
          "General Appreciation Letter",
          "Appreciation for Best Attendance",
          "Appreciation for Outstanding Performance",
          "Appreciation for Consistent Performance",
        ],
        "Concern Letter-Audit Interview Performance": [],
        "Internship Experience Certificate": [],
        "Live Project Agreement": [],
        "Offer Letter": [],
        "Warning Letter": [
          "General Warning Letter", // ← ADD THIS
          "Warning for Incomplete Assignment/Project Submissions",
          "Warning for Low Attendance",
          "Warning for Misconduct or Disrespectful Behavior",
          "Warning for Unauthorized Absence from Training Sessions",
          "Warning Regarding Punctuality and Professional Discipline",
        ],
      };
    } else if (category === "BVOC") {
      return {
        "Appreciation Letter": [
          "General Appreciation Letter",
          "Appreciation for Best Attendance",
          "Appreciation for Detecting Errors And Debugging",
          "Appreciation for Outstanding Performance",
          "Appreciation for Consistent Performance",
        ],
        "Committee Letter": [
          "Committee Member",
          "Committee President",
          "Committee Vice-President",
        ],
        "Concern Letter-Audit Interview Performance": [],
        "Warning Letter": [
          "General Warning Letter", // ← ADD THIS
          "Warning for Incomplete Assignment/Project Submissions",
          "Warning for Low Attendance",
          "Warning for Misconduct or Disrespectful Behavior",
          "Warning for Punctuality and Discipline",
          "Warning for Unauthorized Absence from Sessions",
        ],
      };
    } else if (category === "DM") {
      return {
        "Appreciation Letter": [
          "General Appreciation Letter",
          "Appreciation for Best Attendance",
          "Appreciation for Outstanding Performance",
          "Appreciation for Consistent Performance",
        ],
        "Concern Letter-Audit Interview Performance": [],
        "Internship Experience Certificate": [],
        "Offer Letter": [],
        "Warning Letter": [
          "General Warning Letter", // ← ADD THIS
          "Warning for Incomplete Assignment/Project Submissions",
          "Warning for Low Attendance",
          "Warning for Misconduct or Disrespectful Behavior",
          "Warning for Unauthorized Absence from Training Sessions",
          "Warning Regarding Punctuality and Professional Discipline",
        ],
      };
    } else if (category === "HR" || category === "Operations Department") {
      return {
        "Appreciation Letter": [],
        "Experience Certificate": [],
        "Non-Disclosure Agreement": [],
        "Internship Joining Letter": [
          "Internship Joining Letter - Paid",
          "Internship Joining Letter - Unpaid",
        ],
        "Promotion Letter": ["Non Paid to Paid", "Stipend Revision"],
        "Timeline Letter": [],
      };
    }
    return {};
  };

  // Get main letter types (alphabetically sorted)
  const getLetterTypes = (category) => {
    const config = getLetterTypesConfig(category);
    return Object.keys(config).sort();
  };

  // Get subtypes for selected letter type (alphabetically sorted)
  const getLetterSubtypes = (category, letterType) => {
    const config = getLetterTypesConfig(category);
    return config[letterType] || [];
  };

  // Check if selected letter type has subtypes
  const hasSubtypes = (category, letterType) => {
    const subtypes = getLetterSubtypes(category, letterType);
    return subtypes.length > 0;
  };

  // Roles based on category
  const getRoles = (category) => {
    if (category === "IT-Nexcore") {
      // ✅ Changed
      return [
        "Cyber Security Analyst (Intern)",
        "Junior Software Developer (Intern)",
      ];
    } else if (category === "marketing-junction") {
      return ["Video Editing", "Video Graphics", "Graphic Desigining"];
    } else if (category === "HR") {
      // ✅ Changed
      return ["HR Assistant"];
    } else if (category === "Operations Department") {
      // ✅ Changed
      return ["Operations Intern"];
    } else if (category === "FSD") {
      // ✅ Changed
      return ["Full Stack Developer"];
    } else if (category === "DM") {
      // ✅ Changed
      return ["Digital Marketing"];
    }
    return [];
  };

  // bvoc specific conditional field logic

  // 1. Committee-related
  const needsCommittee = () => {
    return [
      "Committee President",
      "Committee Vice-President",
      "Committee Member",
    ].includes(formData.course);
  };

  // 2. Warning for Low Attendance
  const needsAttendancePercent = () =>
    formData.course === "Warning for Low Attendance";

  // 3. Warning for Incomplete Assignment
  const needsIncompleteAssignmentInputs = () =>
    formData.course === "Warning for Incomplete Assignment/Project Submissions";

  // 4. Misconduct / Disrespectful Behaviour
  const needsMisconductReason = () =>
    formData.course === "Warning for Misconduct or Disrespectful Behavior";

  // 5. Appreciation for Best Attendance
  const needsBestAttendanceMonthYear = () =>
    formData.course === "Appreciation for Best Attendance";

  // 6. Appreciation for Outstanding Performance
  const needsOutstandingPerformanceMonthYear = () =>
    formData.course === "Appreciation for Outstanding Performance";

  // 7. Detecting Errors & Debugging
  const needsDebuggingInputs = () =>
    formData.course === "Appreciation for Detecting Errors And Debugging";

  const needsAuditDate = () =>
    formData.course === "Concern Letter-Audit Interview Performance";

  const needsDuration = () => formData.course === "Non-Disclosure Agreement";

  // 2. Update needsSubject helper function
  const needsSubject = () =>
    formData.course === "Appreciation Letter" ||
    formData.course === "General Appreciation Letter" ||
    formData.course === "General Warning Letter"; // ← ADD THIS

  // 3. Update needsDescription helper function
  const needsDescription = () =>
    formData.course === "Appreciation Letter" ||
    formData.course === "General Appreciation Letter" ||
    formData.course === "General Warning Letter"; // ← ADD THIS

  // 4. Update needsMonthAndYear helper function
  const needsMonthAndYear = () =>
    formData.course === "Appreciation Letter" ||
    formData.course === "General Appreciation Letter" ||
    formData.course === "General Warning Letter"; // ← ADD THIS

  const needsGenderPronoun = () => formData.course === "Experience Certificate";

  // Check if role field is needed
  const needsRole = () => {
    return (
      formData.course === "Internship Joining Letter - Unpaid" ||
      formData.course === "Internship Joining Letter - Paid" ||
      formData.course === "Non-Disclosure Agreement"
    );
  };

  // Check if dates are needed (for Offer Letter)
  const needsDates = () => {
    return formData.course === "Offer Letter";
  };

  const needsAmount = () => {
    return formData.course === "Stipend Revision";
  };

  const needsEffectiveDate = () => {
    return (
      formData.course === "Stipend Revision" ||
      formData.course === "Non Paid to Paid"
    );
  };

  const isInternshipUnpaid = () =>
    formData.course === "Internship Joining Letter - Unpaid";

  const isInternshipPaid = () =>
    formData.course === "Internship Joining Letter - Paid";

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/batches`);
        if (response.data.success) {
          setBatches(response.data.batches);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
        toast.error("Failed to load batches");
      }
    };
    fetchBatches();
  }, []);

  // OTP Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1050);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Fetch names when category / batch change
  useEffect(() => {
    const shouldFetchNames =
      formData.category &&
      (categoryConfig[formData.category]?.batches?.length === 0 ||
        formData.batch);

    if (shouldFetchNames) {
      fetchNames();
    } else {
      setNamesList([]);
      setFormData((prev) => ({ ...prev, name: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.category, formData.batch]);

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? sessionStorage.getItem("authToken")
        : null;
    return { Authorization: `Bearer ${token}` };
  };
  const fetchNames = async () => {
    setLoadingNames(true);
    try {
      let response;

      // ✅ Handle IT-Nexcore and Code4Bharat as unified
      if (formData.category === "IT-Nexcore") {
        response = await axios.get(`${API_URL}/api/people/`, {
          headers: getAuthHeaders(),
          params: {
            categories: JSON.stringify(["IT-Nexcore", "Code4Bharat"]),
          },
        });
      } else if (formData.category === "marketing-junction") {
        response = await axios.get(`${API_URL}/api/people/`, {
          headers: getAuthHeaders(),
          params: { category: "marketing-junction" },
        });
      } else {
        response = await axios.get(`${API_URL}/api/people/`, {
          headers: getAuthHeaders(),
          params: {
            category: formData.category,
            batch: formData.batch || undefined,
          },
        });
      }

      if (response.data.success && Array.isArray(response.data.names)) {
        const enabled = response.data.names
          .filter((person) => !person.disabled)
          .sort((a, b) => a.name.localeCompare(b.name));

        setNamesList(enabled);
      } else {
        setNamesList([]);
      }
    } catch (error) {
      console.error("Fetch names error:", error);
      toast.error("Failed to load names");
    } finally {
      setLoadingNames(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "category") {
      setFormData((prev) => ({
        ...prev,
        category: value,
        batch: "",
        name: "",
        letterType: "",
        course: "",
        subject: "",
        role: "",
        description: "",
        startDate: "",
        endDate: "",
        duration: "",
      }));
      setPreviewImage(null);
      setOtpVerified(false);
    } else if (field === "letterType") {
      // When letter type changes, reset course and check if subtypes exist
      const subtypes = getLetterSubtypes(formData.category, value);
      setFormData((prev) => ({
        ...prev,
        letterType: value,
        course: subtypes.length === 0 ? value : "", // If no subtypes, set course same as letterType
        subject: "",
        role: "",
        description: "",
        startDate: "",
        endDate: "",
        duration: "",
      }));
      setPreviewImage(null);
      setOtpVerified(false);
    } else if (field === "course") {
      setFormData((prev) => ({
        ...prev,
        course: value,
        subject: "",
        role: "",
        description: "",
        startDate: "",
        endDate: "",
        duration: "",
      }));
      setPreviewImage(null);
      setOtpVerified(false);
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === "issueDate") {
        setPreviewImage(null);
        setOtpVerified(false);
      }
    }
  };

  const validateForm = () => {
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    if (!formData.name) {
      toast.error("Please select a name");
      return false;
    }
    if (!formData.letterType) {
      toast.error("Please select letter type");
      return false;
    }
    if (
      hasSubtypes(formData.category, formData.letterType) &&
      !formData.course
    ) {
      toast.error("Please select letter subtype");
      return false;
    }
    // if (needsSubject() && !formData.subject.trim()) {
    //   toast.error("Please enter the subject");
    //   return false;
    // }
    // if (needsSubject() && formData.subject.length > 50) {
    //   toast.error("Subject cannot exceed 50 characters");
    //   return false;
    // }
    if (needsRole() && !formData.role) {
      toast.error("Please select a role");
      return false;
    }
    if (needsDates() && (!formData.startDate || !formData.endDate)) {
      toast.error("Please select start and end dates for Offer Letter");
      return false;
    }
    if (formData.description && formData.description.length > 1050) {
      toast.error("Description cannot exceed 1050 characters");
      return false;
    }
    // Timeline Letter Validation
    if (formData.letterType === "Timeline Letter") {
      if (!formData.timelineStage) {
        toast.error("Please select timeline stage");
        return false;
      }
      if (!formData.timelineProjectName.trim()) {
        toast.error("Please enter project name");
        return false;
      }
      if (!formData.timelineDueDate) {
        toast.error("Please enter due deadline date");
        return false;
      }
      if (!formData.timelineNewDate) {
        toast.error("Please enter new deadline date");
        return false;
      }
    }

    if (formData.course === "Experience Certificate") {
      if (!formData.genderPronoun) {
        toast.error("Please select His/Her");
        return false;
      }
    }

    if (!formData.issueDate) {
      toast.error("Please select issue date");
      return false;
    }
    if (isInternshipPaid() || isInternshipUnpaid()) {
      if (!formData.trainingStartDate || !formData.trainingEndDate) {
        toast.error("Please enter training start and end date");
        return false;
      }
      if (!formData.officialStartDate || !formData.completionDate) {
        toast.error(
          "Please enter official internship start & completion dates"
        );
        return false;
      }
      if (!formData.responsibilities.trim()) {
        toast.error("Please enter responsibilities");
        return false;
      }
      if (formData.responsibilities.length > 550) {
        toast.error("Responsibilities cannot exceed 550 characters");
        return false;
      }
    }
    if (isInternshipPaid()) {
      if (!formData.amount) {
        toast.error("Please enter stipend amount");
        return false;
      }
      if (!formData.effectiveFrom) {
        toast.error("Please enter effective from date");
        return false;
      }
    }

    return true;
  };

  const handlePreview = () => {
    if (validateForm()) {
      setShowOtpModal(true);
    }
  };

  const sendOTP = async () => {
    try {
      if (DEV_MODE) {
        // ⭐ Skip actual OTP sending in dev
        toast.success("OTP sent (DEV MODE)");
        setOtpSent(true);
        setResendTimer(60);
        return;
      }

      // Production: Real OTP sending
      const response = await axios.post(
        `${API_URL}/api/certificates/otp/send`,
        { phone: "919892398976", name: "hr-NEXCORE ALLIANCE" },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success("OTP sent to your WhatsApp! 📱");
        setOtpSent(true);
        setResendTimer(60);
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("sendOTP error:", error);
      toast.error("Failed to send OTP");
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  // Replace verifyOTP function:
  const verifyOTP = async () => {
    try {
      const otpCode = otp.join("");
      if (otpCode.length !== 6) {
        toast.error("Please enter complete OTP");
        return;
      }

      if (DEV_MODE) {
        // ⭐ Skip verification in dev - accept any 6 digits
        toast.success("OTP Verified Successfully! (DEV MODE)");
        setOtpVerified(true);
        setShowOtpModal(false);
        setShowPreview(true);
        generatePreview();
        return;
      }

      // Production: Real OTP verification
      const response = await axios.post(
        `${API_URL}/api/certificates/otp/verify`,
        { phone: "919892398976", otp: otpCode },
        { headers: getAuthHeaders() }
      );

      if (response.data.success) {
        toast.success("OTP Verified Successfully!");
        setOtpVerified(true);
        setShowOtpModal(false);
        setShowPreview(true);
        generatePreview();
      } else {
        toast.error("Invalid OTP");
        setOtp(["", "", "", "", "", ""]);
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      toast.error("OTP verification failed");
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const generatePreview = async () => {
    setLoadingPreview(true);
    try {
      const payload = { ...formData };
      console.log(payload);

      const response = await axios.post(
        `${API_URL}/api/codeletters/preview`,
        payload,
        {
          headers: getAuthHeaders(),
          responseType: "blob",
        }
      );

      const fileType = response.data.type || response.headers["content-type"];

      const fileUrl = URL.createObjectURL(response.data);

      if (fileType.includes("pdf")) {
        setPreviewImage(null);
        setPdfPreview(fileUrl);
      } else {
        setPdfPreview(null);
        setPreviewImage(fileUrl);
      }
    } catch (error) {
      console.error("Preview error:", error);
      toast.error("Failed to generate preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      toast.error("Please verify OTP first");
      return;
    }

    setIsCreating(true);

    try {
      // ✅ Clean the payload - remove empty strings and format properly
      const payload = {
        name: formData.name,
        category: formData.category, // Send as-is from frontend
        issueDate: formData.issueDate,
        letterType: formData.letterType,
        course: formData.course || formData.letterType, // Fallback to letterType if no subtype
      };

      // ✅ Only add optional fields if they have values
      if (formData.batch) payload.batch = formData.batch;
      if (formData.subject) payload.subject = formData.subject;
      if (formData.role) payload.role = formData.role;
      if (formData.description) payload.description = formData.description;
      if (formData.startDate) payload.startDate = formData.startDate;
      if (formData.endDate) payload.endDate = formData.endDate;
      if (formData.duration) payload.duration = formData.duration;

      // Committee fields
      if (formData.committeeType)
        payload.committeeType = formData.committeeType;

      // Attendance fields
      if (formData.attendancePercent) {
        payload.attendancePercent = parseInt(formData.attendancePercent);
      }
      if (formData.attendanceMonth)
        payload.attendanceMonth = formData.attendanceMonth;
      if (formData.attendanceYear)
        payload.attendanceYear = formData.attendanceYear;

      // Performance fields
      if (formData.performanceMonth)
        payload.performanceMonth = formData.performanceMonth;
      if (formData.performanceYear)
        payload.performanceYear = formData.performanceYear;

      // Warning/Assignment fields
      if (formData.subjectName) payload.subjectName = formData.subjectName;
      if (formData.projectName) payload.projectName = formData.projectName;
      if (formData.misconductReason)
        payload.misconductReason = formData.misconductReason;
      if (formData.testingPhase) payload.testingPhase = formData.testingPhase;
      if (formData.uncover) payload.uncover = formData.uncover;

      // Audit date
      if (formData.auditDate) payload.auditDate = formData.auditDate;

      // Training/Internship fields
      if (formData.trainingStartDate)
        payload.trainingStartDate = formData.trainingStartDate;
      if (formData.trainingEndDate)
        payload.trainingEndDate = formData.trainingEndDate;
      if (formData.officialStartDate)
        payload.officialStartDate = formData.officialStartDate;
      if (formData.completionDate)
        payload.completionDate = formData.completionDate;
      if (formData.responsibilities)
        payload.responsibilities = formData.responsibilities;

      // Amount fields
      if (formData.amount) payload.amount = parseFloat(formData.amount);
      if (formData.effectiveFrom)
        payload.effectiveFrom = formData.effectiveFrom;

      // Timeline fields
      if (formData.timelineStage)
        payload.timelineStage = formData.timelineStage;
      if (formData.timelineProjectName)
        payload.timelineProjectName = formData.timelineProjectName;
      if (formData.timelineDueDate)
        payload.timelineDueDate = formData.timelineDueDate;
      if (formData.timelineNewDate)
        payload.timelineNewDate = formData.timelineNewDate;

      // Gender and month/year
      if (formData.genderPronoun)
        payload.genderPronoun = formData.genderPronoun;
      if (formData.month) payload.month = formData.month;
      if (formData.year) payload.year = parseInt(formData.year);

      console.log("📤 Submitting payload:", JSON.stringify(payload, null, 2));

      const response = await axios.post(`${API_URL}/api/codeletters`, payload, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Response:", response.data);

      if (response.data.success) {
        toast.success("Letter created successfully!");
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          // Reset form or redirect
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to create letter");
      }
    } catch (error) {
      console.error("❌ Code letter error:", error);

      if (error.response) {
        // Server responded with error
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        const errorMessage =
          error.response.data.message ||
          error.response.data.error ||
          `Server error: ${error.response.status}`;

        toast.error(errorMessage);

        // Log validation errors if present
        if (error.response.data.errors) {
          console.error("Validation errors:", error.response.data.errors);
        }
      } else if (error.request) {
        // Request made but no response
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something else went wrong
        console.error("Error:", error.message);
        toast.error("Failed to create letter: " + error.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen text-black bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </motion.button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Code Letter
              </h1>
              <p className="text-gray-600 mt-2">
                Generate various types of letters with OTP verification
              </p>
            </div>
          </div>
        </div>

        {!showPreview ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Letter Information
              </h2>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange("category", e.target.value)
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Batch selection (if needed) */}
                {formData.category &&
                  categoryConfig[formData.category]?.batches?.length > 0 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <BookOpen className="w-4 h-4 inline mr-2" />
                        Batch *
                      </label>
                      <select
                        value={formData.batch || ""}
                        onChange={(e) =>
                          handleInputChange("batch", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      >
                        <option value="">Select Batch</option>
                        {categoryConfig[formData.category].batches.map(
                          (batch) => (
                            <option key={batch} value={batch}>
                              {batch}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Name *
                  </label>
                  {loadingNames ? (
                    <div className="flex items-center justify-center py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <select
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      disabled={!namesList.length}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50"
                    >
                      <option value="">Select Name</option>
                      {namesList.map((person, idx) => (
                        <option key={idx} value={person.name}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Letter Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Letter Type *
                  </label>
                  <select
                    value={formData.letterType}
                    onChange={(e) =>
                      handleInputChange("letterType", e.target.value)
                    }
                    disabled={!formData.category}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-gray-50"
                  >
                    <option value="">Select Letter Type</option>
                    {getLetterTypes(formData.category).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Letter Subtype (if applicable) */}
                {formData.letterType &&
                  hasSubtypes(formData.category, formData.letterType) && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Letter Subtype *
                      </label>
                      <select
                        value={formData.course}
                        onChange={(e) =>
                          handleInputChange("course", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      >
                        <option value="">Select Subtype</option>
                        {getLetterSubtypes(
                          formData.category,
                          formData.letterType
                        ).map((subtype) => (
                          <option key={subtype} value={subtype}>
                            {subtype}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                {/* Subject (for Appreciation, Warning, Memo, Community Letter) */}
                {/* {needsSubject() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Subject *
                    </label>
                    <p
                      className={`text-xs mb-2 ${formData.subject.length > 50
                        ? "text-red-500"
                        : "text-gray-500"
                        }`}
                    >
                      {formData.subject.length}/50 characters
                    </p>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) =>
                        handleInputChange("subject", e.target.value)
                      }
                      placeholder="Enter subject"
                      maxLength={50}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                )} */}

                {/* Role (for Experience, Internship Joining, Offer Letter) */}
                {needsRole() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Award className="w-4 h-4 inline mr-2" />
                      Role *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="">Select Role</option>
                      {getRoles(formData.category).map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Start & End Date (for Offer Letter) */}
                {needsDates() && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            handleInputChange("endDate", e.target.value)
                          }
                          min={formData.startDate}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {needsDuration() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duration (e.g., 3 months, 6 months)
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) =>
                        handleInputChange("duration", e.target.value)
                      }
                      placeholder="Enter duration"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Description — hidden only for bvoc */}
                {/* {formData.category !== "bvoc" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter description"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      rows={4}
                    />
                  </div>
                )} */}

                {/* Committee Type (President / Vice / Member) */}
                {needsCommittee() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Committee Name *
                    </label>
                    <select
                      value={formData.committeeType || ""}
                      onChange={(e) =>
                        handleInputChange("committeeType", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="">Select Committee</option>
                      <option value="Technical">Technical</option>
                      <option value="Sports">Sports</option>
                      <option value="Cultural">Cultural</option>
                    </select>
                  </div>
                )}

                {/* Warning for Low Attendance */}
                {needsAttendancePercent() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Attendance Percentage (0–99%) *
                    </label>
                    <input
                      type="number"
                      value={formData.attendancePercent || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (val >= 0 && val <= 99))
                          handleInputChange("attendancePercent", val);
                      }}
                      min="0"
                      max="99"
                      placeholder="Enter %"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Warning for Incomplete Assignment */}
                {needsIncompleteAssignmentInputs() && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject Name (max 20 chars) *
                      </label>
                      <input
                        type="text"
                        maxLength={20}
                        value={formData.subjectName || ""}
                        onChange={(e) =>
                          handleInputChange("subjectName", e.target.value)
                        }
                        placeholder="Enter subject"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Project Name (max 40 chars) *
                      </label>
                      <input
                        type="text"
                        maxLength={40}
                        value={formData.projectName || ""}
                        onChange={(e) =>
                          handleInputChange("projectName", e.target.value)
                        }
                        placeholder="Enter project"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Misconduct or Disrespectful Behaviour */}
                {needsMisconductReason() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason (max 70 chars) *
                    </label>
                    <input
                      type="text"
                      maxLength={70}
                      value={formData.misconductReason || ""}
                      onChange={(e) =>
                        handleInputChange("misconductReason", e.target.value)
                      }
                      placeholder="Enter reason"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Appreciation for Best Attendance */}
                {needsBestAttendanceMonthYear() && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Month *
                      </label>
                      <input
                        type="text"
                        value={formData.attendanceMonth || ""}
                        onChange={(e) =>
                          handleInputChange("attendanceMonth", e.target.value)
                        }
                        placeholder="e.g. January"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        value={formData.attendanceYear || ""}
                        onChange={(e) =>
                          handleInputChange("attendanceYear", e.target.value)
                        }
                        placeholder="e.g. 2025"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Appreciation for Outstanding Performance */}
                {needsOutstandingPerformanceMonthYear() && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Month *
                      </label>
                      <input
                        type="text"
                        value={formData.performanceMonth || ""}
                        onChange={(e) =>
                          handleInputChange("performanceMonth", e.target.value)
                        }
                        placeholder="e.g. March"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        value={formData.performanceYear || ""}
                        onChange={(e) =>
                          handleInputChange("performanceYear", e.target.value)
                        }
                        placeholder="e.g. 2025"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Detecting Errors and Debugging */}
                {needsDebuggingInputs() && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Testing Phase (max 30 chars) *
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        value={formData.testingPhase || ""}
                        onChange={(e) =>
                          handleInputChange("testingPhase", e.target.value)
                        }
                        placeholder="e.g. Admin Panel Testing phase"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Uncover (max 30 chars) *
                      </label>
                      <input
                        type="text"
                        maxLength={30}
                        value={formData.uncover || ""}
                        onChange={(e) =>
                          handleInputChange("uncover", e.target.value)
                        }
                        placeholder="e.g. twenty functional bugs"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* fsd Internship Experience Certificate Specific Inputs */}
                {((formData.category === "FSD" &&
                  formData.course === "Internship Experience Certificate") ||
                  formData.course === "Experience Certificate" ||
                  (formData.category === "DM" &&
                    formData.course ===
                      "Internship Experience Certificate")) && (
                  <>
                    {/* Role */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Award className="w-4 h-4 inline mr-2" />
                        Role *
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          handleInputChange("role", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      >
                        <option value="">Select Role</option>
                        {getRoles(formData.category).map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Start Date */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>

                      {/* End Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          End Date *
                        </label>
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) =>
                            handleInputChange("endDate", e.target.value)
                          }
                          min={formData.startDate}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {needsAuditDate() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Audit Date *
                    </label>
                    <input
                      type="date"
                      value={formData.auditDate}
                      onChange={(e) =>
                        handleInputChange("auditDate", e.target.value)
                      }
                      // max={new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Marketing Junction Internship Paid / Unpaid Fields */}
                {(isInternshipPaid() || isInternshipUnpaid()) && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Training Start Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Training Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.trainingStartDate}
                          onChange={(e) =>
                            handleInputChange(
                              "trainingStartDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
        outline-none transition-all"
                        />
                      </div>

                      {/* Training End Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Training End Date *
                        </label>
                        <input
                          type="date"
                          value={formData.trainingEndDate}
                          onChange={(e) =>
                            handleInputChange("trainingEndDate", e.target.value)
                          }
                          min={formData.trainingStartDate}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
        outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Official Internship Start Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Official Internship Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.officialStartDate}
                          onChange={(e) =>
                            handleInputChange(
                              "officialStartDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
        outline-none transition-all"
                        />
                      </div>
                      {/* Internship Completion Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Internship Completion Date *
                        </label>
                        <input
                          type="date"
                          value={formData.completionDate}
                          onChange={(e) =>
                            handleInputChange("completionDate", e.target.value)
                          }
                          min={formData.officialStartDate}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
        outline-none transition-all"
                        />
                      </div>
                      <div></div>
                    </div>

                    {/* Roles & Responsibilities */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Roles & Responsibilities (Max 550 chars) *
                      </label>
                      <p
                        className={`text-xs mb-2 ${
                          formData.responsibilities.length > 550
                            ? "text-red-500"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.responsibilities.length}/550 characters
                      </p>
                      <textarea
                        value={formData.responsibilities}
                        onChange={(e) =>
                          handleInputChange("responsibilities", e.target.value)
                        }
                        placeholder="Enter responsibilities (1 paragraph)"
                        maxLength={550}
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none 
        transition-all"
                      />
                    </div>

                    {/* Paid Internship Only Fields */}
                    {isInternshipPaid() && (
                      <>
                        {/* Amount */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Tag className="w-4 h-4 inline mr-2" />
                            Stipend Amount (INR) *
                          </label>
                          <input
                            type="number"
                            value={formData.amount}
                            onChange={(e) =>
                              handleInputChange("amount", e.target.value)
                            }
                            min={0}
                            placeholder="Enter amount"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none 
            transition-all"
                          />
                        </div>

                        {/* Effective From Date */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Effective From Date *
                          </label>
                          <input
                            type="date"
                            value={formData.effectiveFrom}
                            onChange={(e) =>
                              handleInputChange("effectiveFrom", e.target.value)
                            }
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none 
            transition-all"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                {needsSubject() && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subject (max 50 chars) *
                      </label>
                      <p
                        className={`text-xs mb-2 ${
                          formData.subject.length > 50
                            ? "text-red-500 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.subject.length}/50 characters
                        {formData.subject.length > 50 && " - Exceeds limit!"}
                      </p>
                      <input
                        type="text"
                        maxLength={50}
                        value={formData.subject || ""}
                        onChange={(e) =>
                          handleInputChange("subject", e.target.value)
                        }
                        placeholder="Enter subject"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </>
                )}

                {needsGenderPronoun() && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pronoun (His / Her) *
                    </label>
                    <select
                      value={formData.genderPronoun}
                      onChange={(e) =>
                        handleInputChange("genderPronoun", e.target.value)
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
    focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    >
                      <option value="">Select Pronoun</option>
                      <option value="his">His</option>
                      <option value="her">Her</option>
                    </select>
                  </div>
                )}

                {needsMonthAndYear() && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Month *
                      </label>

                      <select
                        value={formData.month || ""}
                        onChange={(e) =>
                          handleInputChange("month", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                      >
                        <option value="" disabled>
                          Select Month
                        </option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Year *
                      </label>
                      <input
                        type="number"
                        value={formData.year || ""}
                        onChange={(e) =>
                          handleInputChange("year", e.target.value)
                        }
                        placeholder="e.g. 2025"
                        min={new Date().getFullYear() - 1}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* ✅✅✅ Description for fsd Internship Experience Certificate ✅✅✅ */}
                {((formData.category === "FSD" &&
                  formData.course === "Internship Experience Certificate") ||
                  formData.course === "Experience Certificate" ||
                  (formData.category === "DM" &&
                    formData.course ===
                      "Internship Experience Certificate")) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Description (2 Paragraphs) *
                    </label>
                    <p
                      className={`text-xs mb-2 ${
                        formData.description.length > 1050
                          ? "text-red-500 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.description.length}/1050 characters
                      {formData.description.length > 1050 &&
                        " - Exceeds limit!"}
                    </p>
                    <p className="text-xs text-blue-600 mb-2 bg-blue-50 p-2 rounded">
                      💡 Write 2 paragraphs separated by a blank line (press
                      Enter twice). This will appear in the certificate's
                      content area.
                    </p>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter Description"
                      maxLength={1050}
                      rows={8}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all resize-none ${
                        formData.description.length > 1050
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                          : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">
                        📝 Tip: Press{" "}
                        <kbd className="px-2 py-1 bg-gray-100 rounded">
                          Enter
                        </kbd>{" "}
                        twice to create a new paragraph
                      </p>
                      {/* {formData.description.trim() && (
                          <p className="text-xs text-green-600 font-medium">
                            ✓ {formData.description.split(/\n\s*\n/).filter(p => p.trim()).length} paragraph(s)
                          </p>
                        )} */}
                    </div>
                  </div>
                )}

                {/* --------------------------------------------- */}
                {/*            TIMELINE LETTER FIELDS            */}
                {/* --------------------------------------------- */}
                {formData.letterType === "Timeline Letter" && (
                  <div className="space-y-6">
                    {/* 1. Timeline Stage Dropdown */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Timeline Stage *
                      </label>
                      <select
                        value={formData.timelineStage}
                        onChange={(e) =>
                          handleInputChange("timelineStage", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="">Select Stage</option>
                        <option value="First">First</option>
                        <option value="Second">Second</option>
                        <option value="Final">Final</option>
                      </select>
                    </div>

                    {/* 2. Project Name (Max 15 characters) */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Project Name (max 30 chars) *
                      </label>
                      <p
                        className={`text-xs mb-2 ${
                          formData.timelineProjectName.length > 30
                            ? "text-red-500 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.timelineProjectName.length}/30 characters
                        {formData.timelineProjectName.length > 30 &&
                          " - Exceeds limit!"}
                      </p>
                      <input
                        type="text"
                        maxLength={30}
                        value={formData.timelineProjectName}
                        onChange={(e) =>
                          handleInputChange(
                            "timelineProjectName",
                            e.target.value
                          )
                        }
                        placeholder="Enter project name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* 3. Due Deadline Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Due Deadline Date *
                      </label>
                      <input
                        type="date"
                        value={formData.timelineDueDate}
                        onChange={(e) =>
                          handleInputChange("timelineDueDate", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>

                    {/* 4. New Deadline Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Deadline Date *
                      </label>
                      <input
                        type="date"
                        value={formData.timelineNewDate}
                        onChange={(e) =>
                          handleInputChange("timelineNewDate", e.target.value)
                        }
                        min={formData.timelineDueDate}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                  </div>
                )}

                {needsAmount() && (
                  <>
                    {/* Amount */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Tag className="w-4 h-4 inline mr-2" />
                        Stipend Amount (INR) *
                      </label>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          handleInputChange("amount", e.target.value)
                        }
                        min={0}
                        placeholder="Enter amount"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none 
            transition-all"
                      />
                    </div>
                  </>
                )}

                {needsEffectiveDate() && (
                  <>
                    {/* Effective From Date */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Effective From Date *
                      </label>
                      <input
                        type="date"
                        value={formData.effectiveFrom}
                        onChange={(e) =>
                          handleInputChange("effectiveFrom", e.target.value)
                        }
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
            focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none 
            transition-all"
                      />
                    </div>
                  </>
                )}

                {needsDescription() && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Description (2 Paragraphs) *
                      </label>
                      <p
                        className={`text-xs mb-2 ${
                          formData.description.length > 1050
                            ? "text-red-500 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        {formData.description.length}/1050 characters
                        {formData.description.length > 1050 &&
                          " - Exceeds limit!"}
                      </p>
                      <p className="text-xs text-blue-600 mb-2 bg-blue-50 p-2 rounded">
                        💡 Write 2 paragraphs separated by a blank line (press
                        Enter twice). This will appear in the certificate's
                        content area.
                      </p>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Enter Description"
                        maxLength={1050}
                        rows={8}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 outline-none transition-all resize-none ${
                          formData.description.length > 1050
                            ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-200"
                        }`}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">
                          📝 Tip: Press{" "}
                          <kbd className="px-2 py-1 bg-gray-100 rounded">
                            Enter
                          </kbd>{" "}
                          twice to create a new paragraph
                        </p>
                        {/* {formData.description.trim() && (
                          <p className="text-xs text-green-600 font-medium">
                            ✓ {formData.description.split(/\n\s*\n/).filter(p => p.trim()).length} paragraph(s)
                          </p>
                        )} */}
                      </div>
                    </div>
                  </>
                )}

                {/* Issue Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    // max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                  />
                </div>

                {/* Preview Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePreview}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Verify & Preview
                </motion.button>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📋 Instructions
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">1.</span>
                    <span>Select category and batch (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">2.</span>
                    <span>Choose the recipient name from the dropdown</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">3.</span>
                    <span>Select letter type and subtype (if applicable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">4.</span>
                    <span>
                      Fill required fields (subject/role/dates based on letter
                      type)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">5.</span>
                    <span>Verify via WhatsApp OTP</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">6.</span>
                    <span>Review preview and create letter</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-start gap-3">
                  <FaWhatsapp className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      WhatsApp OTP Verification
                    </h4>
                    <p className="text-sm text-gray-700">
                      For security, you'll receive a 6-digit OTP via WhatsApp
                      before creating the letter.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-2xl p-6 border border-yellow-200">
                <h4 className="font-bold text-gray-900 mb-3">
                  📝 Letter Types by Category
                </h4>
                <div className="space-y-3 text-sm text-gray-700">
                  <div>
                    <p className="font-semibold text-gray-900">
                      it-nexcore, Marketing Junction, hr:
                    </p>
                    <p className="text-xs mt-1">
                      Appreciation, Experience, Internship Joining, Memo, NDA,
                      Promotion, Timeline
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">fsd:</p>
                    <p className="text-xs mt-1">
                      Appreciation, Experience, Offer, Warning, NDA, Live
                      Project
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">bvoc:</p>
                    <p className="text-xs mt-1">
                      Appreciation, Committee, Warning
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          // Preview Section
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <motion.button
                whileHover={{ x: -5 }}
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Form</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Code Letter
                  </>
                )}
              </motion.button>
            </div>

            <div>
              {loadingPreview ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                  <p className="text-gray-600 font-medium">
                    Generating preview...
                  </p>
                </div>
              ) : (
                <>
                  {previewImage && (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full rounded-xl shadow-lg"
                    />
                  )}

                  {pdfPreview && (
                    <iframe
                      src={`${pdfPreview}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-[80vh] border shadow-lg"
                      style={{ border: "none" }}
                    ></iframe>
                  )}
                </>
              )}

              <div className="mt-6 p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
                <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                  Letter Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.course || formData.letterType}
                    </span>
                  </div>
                  {/* {formData.subject && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subject:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.subject}
                      </span>
                    </div>
                  )} */}
                  {formData.role && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.role}
                      </span>
                    </div>
                  )}
                  {formData.startDate && formData.endDate && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(formData.startDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">End Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(formData.endDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      {formData.duration && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-semibold text-gray-900">
                            {formData.duration}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  {/* ✅ Show description for Internship Experience Certificate */}
                  {formData.description &&
                    formData.category === "fsd" &&
                    formData.course === "Internship Experience Certificate" && (
                      <div className="pt-2 border-t border-indigo-200">
                        <span className="text-gray-600 block mb-1">
                          Description:
                        </span>
                        <div className="text-gray-800 text-xs leading-relaxed bg-white p-3 rounded border border-indigo-100 max-h-32 overflow-y-auto">
                          {formData.description
                            .split(/\n\s*\n/)
                            .map((para, idx) => (
                              <p key={idx} className={idx > 0 ? "mt-2" : ""}>
                                {para.trim()}
                              </p>
                            ))}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {formData.description.length}/1050 characters
                        </span>
                      </div>
                    )}

                  {formData.letterType === "Timeline Letter" && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stage:</span>
                        <span className="font-semibold text-gray-900">
                          {formData.timelineStage}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project:</span>
                        <span className="font-semibold text-gray-900">
                          {formData.timelineProjectName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(
                            formData.timelineDueDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">New Deadline:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(
                            formData.timelineNewDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Issue Date:</span>
                    <span className="font-semibold text-gray-900">
                      {formData.issueDate
                        ? new Date(formData.issueDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OTP Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full relative"
              >
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center mb-6">
                  <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
                    <FaWhatsapp className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    WhatsApp OTP Verification
                  </h2>
                  <p className="text-gray-600">
                    {otpSent
                      ? "Enter the 6-digit code sent to your WhatsApp"
                      : "We will send an OTP to verify this action"}
                  </p>
                </div>

                {otpSent ? (
                  <>
                    <div className="flex gap-2 justify-center mb-6">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                        />
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={verifyOTP}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg mb-3 flex items-center justify-center gap-2"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      Verify OTP
                    </motion.button>

                    <button
                      onClick={resendTimer === 0 ? sendOTP : null}
                      disabled={resendTimer > 0}
                      className="w-full text-green-600 py-2 font-medium disabled:text-gray-400 transition-colors"
                    >
                      {resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : "Resend OTP"}
                    </button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={sendOTP}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Send OTP via WhatsApp
                  </motion.button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="inline-block p-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
                    <CheckCircle className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Success!
                </h3>
                <p className="text-gray-600">
                  Letter created successfully! WhatsApp notification sent to the
                  user.
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
