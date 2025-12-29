"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "./auth-card3";
import { authService } from "../../services/api";

// Animation variants
const formControlVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
};

export default function PartnerSignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    panCard: null,
    businessTranscripts: null,
    role:"partner",
    status:"Pending"
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    panCard: "",
    businessTranscripts: "",
     role:"partner",
     status:"Pending"
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    mobile: false,
    password: false,
    confirmPassword: false,
    companyName: false,
    panCard: false,
    businessTranscripts: false,
    status:"Pending"
  });

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "Password is too weak",
    color: "red",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // Define validateForm as a useCallback to avoid dependency issues
  const validateForm = useCallback(() => {
    const newErrors = {}; // Create a new object instead of spreading errors
    let isValid = true;

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      isValid = false;
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.firstName = "";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.lastName = "";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    } else {
      newErrors.email = "";
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      isValid = false;
    } else if (!isValidPhone(formData.mobile)) {
      newErrors.mobile = "Please enter a valid mobile number";
      isValid = false;
    } else {
      newErrors.mobile = "";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else {
      const strength = checkPasswordStrength(formData.password);
      if (strength.score < 2) {
        newErrors.password = strength.message;
        isValid = false;
      } else {
        newErrors.password = "";
      }
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    } else {
      newErrors.confirmPassword = "";
    }

    // Company Name validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
      isValid = false;
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
      isValid = false;
    } else {
      newErrors.companyName = "";
    }

    // Pan Card validation
    if (!formData.panCard || "") {
      newErrors.panCard = "Pan card is required";
      isValid = false;
    }  else {
      newErrors.panCard = "";
    }

    // Business Transcript validation
    if (!formData.businessTranscripts || "") {
      newErrors.businessTranscripts = "Business transcript is required";
      isValid = false;
    } else {
      newErrors.businessTranscripts = "";
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]); // Remove errors from dependency array

  // Validate form on input change
  useEffect(() => {
    validateForm();
    
  }, [validateForm]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone) => {
    // Basic phone validation - can be adjusted for specific country formats
    const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/;
    return phoneRegex.test(phone);
  };

  const checkPasswordStrength = (password) => {
    let score = 0;
    let message = "";
    let color = "red";

    // Length check
    if (password.length >= 8) score++;

    // Complexity checks
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Set message based on score
    if (score === 0 || score === 1) {
      message = "Password is too weak";
      color = "red";
    } else if (score === 2) {
      message = "Password is fair";
      color = "orange";
    } else if (score === 3) {
      message = "Password is good";
      color = "yellow";
    } else if (score === 4) {
      message = "Password is strong";
      color = "lightgreen";
    } else if (score === 5) {
      message = "Password is very strong";
      color = "green";
    }

    setPasswordStrength({ score, message, color });
    return { score, message, color };
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if(name ==='businessTranscripts'){
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.files[0],
      }));
    }

    else if(name ==='panCard'){
      setFormData((prev) => ({
        ...prev,
        [name]: e.target.files[0],
      }));
    }

   else {
      setFormData({ ...formData, [name]: value });
    }
   

    if (name === "password") {
      checkPasswordStrength(value);
    }

    // Clear API error when user types
    if (apiError) {
      setApiError("");
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Mark all fields as touched to show validation errors
  const allTouched = {};
  Object.keys(formData).forEach((key) => (allTouched[key] = true));
  setTouched(allTouched);

  if (!validateForm()) return;

  setIsSubmitting(true);
  setApiError("");

  try {
    // Prepare FormData for API
    const partnerData = new FormData();
    partnerData.append("fullname", formData.firstName + " " + formData.lastName);
    partnerData.append("email", formData.email);
    partnerData.append("phoneNumber", formData.mobile);
    partnerData.append("password", formData.password);
    partnerData.append("company", formData.companyName);
    partnerData.append("role", "partner");
    partnerData.append("status", "Pending");

    // Attach files
    if (formData.panCard) partnerData.append("panCardImage", formData.panCard);
    if (formData.businessTranscripts)
      partnerData.append("businessTranscriptsImage", formData.businessTranscripts);

    // Send FormData to API
    const response = await authService.signupPartner(partnerData); // <-- use partnerData

    console.log("Partner signup successful:", response);

    alert(
      "Partner signup request submitted successfully! Our team will review your application and contact you shortly."
    );
    navigate("/login");
  } catch (error) {
    console.error("Partner signup failed:", error);

    if (error.response) {
      if (error.response.status === 409) {
        setApiError("An account with this email already exists.");
      } else if (error.response.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Partner signup failed. Please try again later.");
      }
    } else {
      setApiError("Unable to connect to the server. Please try again later.");
    }
  } finally {
    setIsSubmitting(false);
  }
};


  const navigateToLogin = (e) => {
    e.preventDefault();
    console.log("Navigating to login page");
    navigate("/login");
  };

  console.log(formData, "formdata")

  return (
    <AuthCard
      title="Sign up into your account"
      imageSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/signupimage-ZPayTxwvHf6BWuFSJ3lMSTG9VLxG00.png"
      imageAlt="Beach wedding setup with white aisle and pink chairs"
      imagePosition="right"
      fullHeight={true}
    >
      <form onSubmit={handleSubmit} className="partner-form">
        <AnimatePresence>
          {apiError && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={16} />
              <span>{apiError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="form-row"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <div className="form-group">
            <label
              htmlFor="firstName"
              className={
                touched.firstName && errors.firstName ? "text-error" : ""
              }
            >
              First Name <span className="required">*</span>
            </label>
            <div
              className={`input-container ${
                touched.firstName && errors.firstName ? "input-error" : ""
              }`}
            >
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter your name..."
                value={formData.firstName || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.firstName && !errors.firstName ? "input-valid" : ""
                }
              />
              <AnimatePresence>
                {touched.firstName && !errors.firstName && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="valid-icon" size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {touched.firstName && errors.firstName && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.firstName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="form-group">
            <label
              htmlFor="lastName"
              className={
                touched.lastName && errors.lastName ? "text-error" : ""
              }
            >
              Last Name <span className="required">*</span>
            </label>
            <div
              className={`input-container ${
                touched.lastName && errors.lastName ? "input-error" : ""
              }`}
            >
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your name..."
                value={formData.lastName || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.lastName && !errors.lastName ? "input-valid" : ""
                }
              />
              <AnimatePresence>
                {touched.lastName && !errors.lastName && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="valid-icon" size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {touched.lastName && errors.lastName && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.lastName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="form-row"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <div className="form-group">
            <label
              htmlFor="email"
              className={touched.email && errors.email ? "text-error" : ""}
            >
              Email Id <span className="required">*</span>
            </label>
            <div
              className={`input-container ${
                touched.email && errors.email ? "input-error" : ""
              }`}
            >
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                type="email"
                id="email"
                name="email"
                placeholder="info@xyz.com"
                value={formData.email || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.email && !errors.email ? "input-valid" : ""}
              />
              <AnimatePresence>
                {touched.email && !errors.email && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="valid-icon" size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {touched.email && errors.email && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="form-group">
            <label
              htmlFor="mobile"
              className={touched.mobile && errors.mobile ? "text-error" : ""}
            >
              Mobile No. <span className="required">*</span>
            </label>
            <div
              className={`input-container ${
                touched.mobile && errors.mobile ? "input-error" : ""
              }`}
            >
              <motion.input

                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                type="text"
                id="mobile"
                name="mobile"
                placeholder="+977 - 98596 56000"
                value={formData.mobile || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.mobile && !errors.mobile ? "input-valid" : ""
                }
              />
              <AnimatePresence>
                {touched.mobile && !errors.mobile && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="valid-icon" size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {touched.mobile && errors.mobile && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.mobile}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="form-row"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <div className="form-group">
            <label
              htmlFor="password"
              className={
                touched.password && errors.password ? "text-error" : ""
              }
            >
              Password <span className="required">*</span>
            </label>
            <div
              className={`input-container ${
                touched.password && errors.password ? "input-error" : ""
              }`}
            >
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="xxxxxxxxx"
                  autoComplete="new-password"
    value={formData.password || ""}
                // value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.password && !errors.password ? "input-valid" : ""
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <AnimatePresence>
                {touched.password && !errors.password && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="valid-icon" size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {formData.password && (
              <motion.div
                className="password-strength"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="strength-meter">
                  <motion.div
                    className="strength-meter-fill"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(passwordStrength.score / 5) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
                <motion.span
                  className="strength-text"
                  style={{ color: passwordStrength.color }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  {passwordStrength.message}
                </motion.span>
              </motion.div>
            )}
            <AnimatePresence>
              {touched.password && errors.password && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div className="form-group">
            <label
              htmlFor="confirmPassword"
              className={
                touched.confirmPassword && errors.confirmPassword
                  ? "text-error"
                  : ""
              }
            >
              Confirm Password <span className="required">*</span>
            </label>
            <div
              className={`input-container ${
                touched.confirmPassword && errors.confirmPassword
                  ? "input-error"
                  : ""
              }`}
            >
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="xxxxxxxxx"
                value={formData.confirmPassword || ""}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.confirmPassword && !errors.confirmPassword
                    ? "input-valid"
                    : ""
                }
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <AnimatePresence>
                {touched.confirmPassword && !errors.confirmPassword && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle className="valid-icon" size={16} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {touched.confirmPassword && errors.confirmPassword && (
                <motion.p
                  className="error-message"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {errors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          className="form-group"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <label
            htmlFor="companyName"
            className={
              touched.companyName && errors.companyName ? "text-error" : ""
            }
          >
            Company Name <span className="required">*</span>
          </label>
          <div
            className={`input-container2 ${
              touched.companyName && errors.companyName ? "input-error" : ""
            }`}
          >
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type="text"
              id="companyName"
              name="companyName"
              placeholder="Enter company name..."
              value={formData.companyName || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.companyName && !errors.companyName ? "input-valid" : ""
              }
            />
            <AnimatePresence>
              {touched.companyName && !errors.companyName && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="valid-icon" size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {touched.companyName && errors.companyName && (
              <motion.p
                className="error-message"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {errors.companyName}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="form-group"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={5}
        >
          <label
            htmlFor="panCard"
            className={touched.panCard && errors.panCard ? "text-error" : ""}
          >
            Pan Card <span className="required">*</span>
          </label>
          <div
            className={`input-container2 ${
              touched.panCard && errors.panCard ? "input-error" : ""
            }`}
          >
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type="file"
              id="panCard"
              name="panCard"
      accept="image/*,.pdf"
          // value={formData.panCard || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.panCard && !errors.panCard ? "input-valid" : ""
              }
            />
            <AnimatePresence>
              {touched.panCard && !errors.panCard && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="valid-icon" size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {touched.panCard && errors.panCard && (
              <motion.p
                className="error-message"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {errors.panCard}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="form-group"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          <label
            htmlFor="businessTranscripts"
            className={
              touched.businessTranscripts && errors.businessTranscripts
                ? "text-error"
                : ""
            }
          >
            Your Business Transcript <span className="required">*</span>
          </label>
          <div
            className={`input-container2 ${
              touched.businessTranscripts && errors.businessTranscripts
                ? "input-error"
                : ""
            }`}
          >
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type="file"
              id="businessTranscripts"
              name="businessTranscripts"
              accept="image/*,.pdf"
              // value={formData.businessTranscripts || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              className={
                touched.businessTranscripts && !errors.businessTranscripts
                  ? "input-valid"
                  : ""
              }
            />
            <AnimatePresence>
              {touched.businessTranscripts && !errors.businessTranscripts && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CheckCircle className="valid-icon" size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {touched.businessTranscript && errors.businessTranscript && (
              <motion.p
                className="error-message"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {errors.businessTranscripts}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="form-actions-row"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={7}
        >
          <motion.button
            className={`signup-button ${isSubmitting ? "button-loading" : ""}`}
            type="submit"
            disabled={isSubmitting}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            {isSubmitting ? "Signing up..." : "Sign up"}
          </motion.button>

          <motion.div
            className="login-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
          >
            <motion.button
              type="button"
              onClick={navigateToLogin}
              className="text-link"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
            >
              Already have an account? Sign in
            </motion.button>
          </motion.div>
        </motion.div>
      </form>
    </AuthCard>
  );
}
