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
    transition: { delay: custom * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

const buttonVariants = { idle: { scale: 1 }, hover: { scale: 1.03 }, tap: { scale: 0.97 } };

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
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: "Password is too weak", color: "red" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // ----------------------- Validation -----------------------
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^\+?[0-9\s\-()]{8,20}$/.test(phone);

  const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let message = "Password is too weak";
    let color = "red";
    if (score === 2) { message = "Password is fair"; color = "#ce4a1c"; }
    if (score === 3) { message = "Password is good"; color = "#dea937"; }
    if (score === 4) { message = "Password is strong"; color = "#0c8d90"; }
    if (score === 5) { message = "Password is very strong"; color = "#4e3b2b"; }

    setPasswordStrength({ score, message, color });
    return { score, message, color };
  };

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
      isValid = false;
    }
    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    }
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }
    if (!formData.mobile.trim() || !isValidPhone(formData.mobile)) {
      newErrors.mobile = "Please enter a valid mobile number";
      isValid = false;
    }
    if (!formData.password || checkPasswordStrength(formData.password).score < 2) {
      newErrors.password = "Password is too weak";
      isValid = false;
    }
    if (!formData.confirmPassword || formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData]);

  useEffect(() => { validateForm(); }, [validateForm]);

  // ----------------------- Handlers -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") checkPasswordStrength(value);
    if (apiError) setApiError("");
  };

  const handleBlur = (e) => { setTouched({ ...touched, [e.target.name]: true }); };

  const navigateToLogin = (e) => { e.preventDefault(); navigate("/login"); };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(formData).forEach((key) => (allTouched[key] = true));
    setTouched(allTouched);

    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError("");

    try {
      const userData = {
        fullname: formData.firstName + " " + formData.lastName,
        email: formData.email,
        phoneNumber: formData.mobile,
        password: formData.password,
        role: formData.role,
      };

      // Call backend signup (Pending user + send OTP)
      await authService.signup(userData);

      // Save email to sessionStorage for OTP verification
      sessionStorage.setItem("signupEmail", formData.email);

      // Redirect to OTP verification page
      navigate("/verify-signup-otp");
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.response) {
        if (error.response.status === 409) setApiError("An account with this email already exists.");
        else if (error.response.data?.message) setApiError(error.response.data.message);
        else setApiError("Signup failed. Please try again later.");
      } else setApiError("Unable to connect to server. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------- JSX -----------------------
  return (
    <div className="auth-container2">
      <AuthCard
        title="Sign up into your account"
        imageSrc="https://i.pinimg.com/736x/d2/ec/7e/d2ec7e71186c0c3ea0f71460f9d51946.jpg"
        imageAlt="Signup Image"
        imagePosition="right"
      >
        <form onSubmit={handleSubmit} noValidate>
          <AnimatePresence>
            {apiError && (
              <motion.div className="error-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertCircle size={16} />
                <span>{apiError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* First Name & Last Name */}
          <motion.div className="form-row" variants={formControlVariants} initial="hidden" animate="visible" custom={1}>
            {/* First Name */}
            <div className="form-group">
              <label>First Name *</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} onBlur={handleBlur} />
              {touched.firstName && errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            {/* Last Name */}
            <div className="form-group">
              <label>Last Name *</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} onBlur={handleBlur} />
              {touched.lastName && errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </motion.div>

          {/* Email & Mobile */}
          <motion.div className="form-row" variants={formControlVariants} initial="hidden" animate="visible" custom={2}>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} />
              {touched.email && errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Mobile *</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} onBlur={handleBlur} />
              {touched.mobile && errors.mobile && <span className="error-message">{errors.mobile}</span>}
            </div>
          </motion.div>

          {/* Password & Confirm Password */}
          <motion.div className="form-row" variants={formControlVariants} initial="hidden" animate="visible" custom={3}>
            <div className="form-group">
              <label>Password *</label>
              <div className="input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.password && errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <div className="input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="auth-button primary-button"
            disabled={isSubmitting}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            {isSubmitting ? "Signing up..." : "Sign up"}
          </motion.button>

          {/* Login Link */}
          <motion.div className="login-link" style={{ textAlign: 'center' }} variants={formControlVariants} initial="hidden" animate="visible" custom={5}>
            <motion.button type="button" className="text-link" onClick={navigateToLogin}>Already have an account? <span style={{ fontWeight: '600' }}>Sign in</span></motion.button>
          </motion.div>
        </form>
      </AuthCard>
    </div>
  );
}
