"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft,Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "./auth-card";
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
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "", // Added email field
    otpCode: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    otpCode: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    otpCode: false,
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load email from localStorage when component mounts
  useEffect(() => {
    const storedEmail = localStorage.getItem("resetEmail");
    if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
    }
  }, []);

  // Define validateForm as a useCallback to avoid dependency issues
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    } else {
      newErrors.email = "";
    }

    // OTP Code validation
    if (!formData.otpCode) {
      newErrors.otpCode = "OTP code is required";
      isValid = false;
    } else if (!/^\d{6}$/.test(formData.otpCode)) {
      newErrors.otpCode = "OTP code must be exactly 6 digits";
      isValid = false;
    } else {
      newErrors.otpCode = "";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    } else {
      newErrors.password = "";
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

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  // Validate form on input change
  useEffect(() => {
    validateForm();
  }, [validateForm]);

  // FIXED: Removed duplicate setFormData call
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // For OTP code, only allow numeric input and limit to 6 digits
    if (name === "otpCode") {
      processedValue = value.replace(/\D/g, "").slice(0, 6);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue,
    });

    if (apiError) {
      setApiError("");
    }
    if (successMessage) {
      setSuccessMessage("");
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
    setTouched({ 
      email: true, 
      otpCode: true, 
      password: true, 
      confirmPassword: true 
    });

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");
    setSuccessMessage("");

    try {
      // Updated to pass email, otpCode, and password to match backend
      await authService.resetPassword(formData.email, formData.otpCode, formData.password);
      
      setSuccessMessage("Your password has been successfully reset! Redirecting to login...");
      
      // Clear the form and localStorage
      setFormData({ 
        email: "", 
        otpCode: "", 
        password: "", 
        confirmPassword: "" 
      });
      setTouched({ 
        email: false, 
        otpCode: false, 
        password: false, 
        confirmPassword: false 
      });
      localStorage.removeItem("resetEmail");
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
      
    } catch (error) {
      console.error("Password reset failed:", error);
      
      if (error.response) {
        if (error.response.status === 400) {
          setApiError("Invalid or expired OTP code. Please request a new password reset.");
        } else if (error.response.status === 404) {
          setApiError("User not found. Please check your email address.");
        } else if (error.response.data?.message) {
          setApiError(error.response.data.message);
        } else {
          setApiError("Password reset failed. Please try again.");
        }
      } else {
        setApiError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    localStorage.removeItem("resetEmail");
    navigate("/login");
  };

  const handleRequestNewReset = () => {
    localStorage.removeItem("resetEmail");
    navigate("/forgot-password");
  };

  return (
    <AuthCard
      title="Set new password"
      imageSrc="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      imageAlt="Reset password illustration"
      imagePosition="left"
    >
      <form onSubmit={handleSubmit} noValidate>
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

        <AnimatePresence>
          {successMessage && (
            <motion.div
              className="success-banner"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircle size={16} />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email field */}
        <motion.div
          className="form-group"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <label htmlFor="email" className={touched.email && errors.email ? "text-error" : ""}>
            Email Address <span className="required">*</span>
          </label>
          <div className={`input-container ${touched.email && errors.email ? "input-error" : ""}`}>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.email && !errors.email ? "input-valid" : ""}
              required
              disabled={isSubmitting}
              autoComplete="email"
            />
            <Mail className="input-icon" size={20} />
            <AnimatePresence>
              {touched.email && !errors.email && formData.email && (
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
        </motion.div>

        <motion.div
          className="form-group"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          <label htmlFor="otpCode" className={touched.otpCode && errors.otpCode ? "text-error" : ""}>
            OTP Code <span className="required">*</span>
          </label>
          <div className={`input-container ${touched.otpCode && errors.otpCode ? "input-error" : ""}`}>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type="text"
              id="otpCode"
              name="otpCode"
              placeholder="Enter 6-digit OTP code"
              value={formData.otpCode}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.otpCode && !errors.otpCode ? "input-valid" : ""}
              required
              disabled={isSubmitting}
              maxLength="6"
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <Lock className="input-icon" size={20} />
            <AnimatePresence>
              {touched.otpCode && !errors.otpCode && formData.otpCode && (
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
            {touched.otpCode && errors.otpCode && (
              <motion.p
                className="error-message"
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {errors.otpCode}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div
          className="form-group"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={2}
        >
          <label htmlFor="password" className={touched.password && errors.password ? "text-error" : ""}>
            New Password <span className="required">*</span>
          </label>
          <div className={`input-container ${touched.password && errors.password ? "input-error" : ""}`}>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your new password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.password && !errors.password ? "input-valid" : ""}
              required
              disabled={isSubmitting}
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
              {touched.password && !errors.password && formData.password && (
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
        </motion.div>

        <motion.div
          className="form-group"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={3}
        >
          <label htmlFor="confirmPassword" className={touched.confirmPassword && errors.confirmPassword ? "text-error" : ""}>
            Confirm New Password <span className="required">*</span>
          </label>
          <div className={`input-container ${touched.confirmPassword && errors.confirmPassword ? "input-error" : ""}`}>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={touched.confirmPassword && !errors.confirmPassword ? "input-valid" : ""}
              required
              disabled={isSubmitting}
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
              {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
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
        </motion.div>

        <motion.div
          className="form-info"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={4}
        >
          <p className="form-help-text">
            Enter your email address and the 6-digit OTP code sent to your email along with your new password. Your password must be at least 8 characters long.
          </p>
        </motion.div>

        <motion.button
          className={`auth-button primary-button ${isSubmitting ? "button-loading" : ""}`}
          type="submit"
          disabled={isSubmitting || !formData.email || !formData.otpCode || !formData.password || !formData.confirmPassword}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          custom={5}
        >
          {isSubmitting ? "Updating Password..." : "Update Password"}
        </motion.button>

        <motion.div
          className="form-links"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={6}
        >
          <motion.button
            type="button"
            className="back-to-login-button"
            onClick={handleBackToLogin}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <ArrowLeft size={16} />
            Back to Login
          </motion.button>
          
          <motion.button
            type="button"
            className="back-to-login-button"
            onClick={handleRequestNewReset}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
          >
            Request New OTP
          </motion.button>
        </motion.div>
      </form>
    </AuthCard>
  );
}