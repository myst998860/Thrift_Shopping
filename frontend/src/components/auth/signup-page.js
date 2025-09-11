"use client";

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "./auth-card2";
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

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
     role: "attendee",
     status:"Active",
  });

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
     role: "attendee",
     status:"Active",
  });

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    mobile: false,
    password: false,
    confirmPassword: false,
    status:"Active",
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
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

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
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (validateForm()) {
      setIsSubmitting(true);
      setApiError("");

      try {
        // Prepare data for API (excluding confirmPassword)
        const userData = {
        fullname: formData.firstName + " " + formData.lastName,
        email: formData.email,
        phoneNumber: formData.mobile,
        password: formData.password,
        role: "attendee",
        status:"Active"
        };

        // Call the signup API
        const response = await authService.signup(userData);

        console.log("Signup successful:", response);

        // Success animation before alert/navigation
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Show success message and redirect to login
        alert("Signup successful! Please login to continue.");
        navigate("/login");
      } catch (error) {
        console.error("Signup failed:", error);

        // Handle specific error responses
        if (error.response) {
          if (error.response.status === 409) {
            setApiError("An account with this email already exists.");
          } else if (error.response.data && error.response.data.message) {
            setApiError(error.response.data.message);
          } else {
            setApiError("Signup failed. Please try again later.");
          }
        } else {
          setApiError(
            "Unable to connect to the server. Please try again later."
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const navigateToLogin = (e) => {
    e.preventDefault();
    console.log("Navigating to login page");
    navigate("/login");
  };

  return (
    <AuthCard
      title="Sign up into your account"
      imageSrc="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/signupimage-T6LiitVtF9TY0HZ3xQgq0kcQdRrq3f.png"
      imageAlt="Beach wedding setup with white aisle and pink chairs"
      imagePosition="right"
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
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.firstName && !errors.firstName ? "input-valid" : ""
                }
                required
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
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.lastName && !errors.lastName ? "input-valid" : ""
                }
                required
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
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={touched.email && !errors.email ? "input-valid" : ""}
                required
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
                value={formData.mobile}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.mobile && !errors.mobile ? "input-valid" : ""
                }
                required
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
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.password && !errors.password ? "input-valid" : ""
                }
                required
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
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={
                  touched.confirmPassword && !errors.confirmPassword
                    ? "input-valid"
                    : ""
                }
                required
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

        <motion.button
          className={`signup-button ${isSubmitting ? "button-loading" : ""}`}
          type="submit"
          disabled={isSubmitting}
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          custom={4}
        >
          {isSubmitting ? "Signing up..." : "Sign up"}
        </motion.button>

        <motion.div
          className="login-link"
          variants={formControlVariants}
          initial="hidden"
          animate="visible"
          custom={5}
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
      </form>
    </AuthCard>
  );
}
