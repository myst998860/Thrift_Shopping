"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Mail, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { authService } from "../../services/api"
import { useUserSession } from "../../context/UserSessionContext";


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
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.03 },
  tap: { scale: 0.97 },
}

export default function LoginPage() {
  
  const { login } = useUserSession();
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [redirectMessage, setRedirectMessage] = useState(location.state?.message || "")
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [apiError, setApiError] = useState("")

  // Define validateForm as a useCallback to avoid dependency issues
  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
      isValid = false
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
      isValid = false
    } else {
      newErrors.email = ""
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
      isValid = false
    } else {
      newErrors.password = ""
    }

    setErrors(newErrors)
    return isValid
  }, [formData])

  // Validate form on input change
  useEffect(() => {
    validateForm()
  }, [validateForm])

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })

    if (apiError) {
      setApiError("")
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched({
      ...touched,
      [name]: true,
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setTouched({ email: true, password: true });

  if (!validateForm()) return;

  setIsSubmitting(true);
  setApiError("");

  try {
    const data = await authService.login({
      email: formData.email,
      password: formData.password,
    });

    console.log("Login successful:", data);
    console.log("Saved JWT token:", data.token);

    if (data.token && data.redirect) {
      const payload = JSON.parse(atob(data.token.split('.')[1]));
      const userData = {
        email: payload.sub,
        role: payload.role,
      };

      // ✅ Store token and user role
      sessionStorage.setItem("jwtToken", data.token);
      sessionStorage.setItem("userRole", payload.role);

      // ✅ NEW: Save userId if present in token
      if (payload.userId !== undefined) {
        sessionStorage.setItem("userId", payload.userId.toString());
        console.log("Saved userId:", payload.userId);
      } else {
        console.warn("userId not found in token");
      }

      login(userData, data.token);

      // Check if we have a redirect path from location state
      const redirectPath = location.state?.from;
      
      // ✅ Navigate to the redirect path or default based on role
      const path = redirectPath || data.redirect || (
        payload.role === "admin"
          ? "/admin/dashboard"
          : payload.role === "partner"
          ? "/partner/dashboard"
          : "/home"
      );
      navigate(path, { replace: true });
    } else {
      setApiError("Login failed: missing token or redirect.");
    }
  } catch (error) {
    console.error("Login failed:", error);
    if (error.response) {
      if (error.response.status === 401) {
        setApiError("Invalid email or password. Please try again.");
      } else if (error.response.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Login failed. Please try again.");
      }
    } else {
      setApiError("Unable to connect to the server. Please try again later.");
    }
  } finally {
    setIsSubmitting(false);
  }
};




  const handleSignupClick = (e) => {
    e.preventDefault()
    navigate("/signup")
  }

  const handlePartnerSignupClick = (e) => {
    e.preventDefault()
    navigate("/partner-signup")
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    navigate("/forgot-password")
  }

  return (
    <motion.div
      className="auth-card"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="auth-image"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <img
          src="https://i.pinimg.com/1200x/5c/ab/e3/5cabe3b35e1087efc6dba1874c00eaa7.jpg"
          alt="Mountain landscape with lake reflection"
          className="background-image"
        />
      </motion.div>

      <div className="auth-form-container">
        <motion.div
          className="auth-form"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.h1
            className="auth-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Login into your account
          </motion.h1>

          <form onSubmit={handleSubmit} noValidate>
            <AnimatePresence>
              {(apiError || redirectMessage) && (
                <motion.div
                  className="error-banner"
                  style={{
                    backgroundColor: redirectMessage ? "rgba(25, 118, 210, 0.1)" : "rgba(211, 47, 47, 0.1)",
                    color: redirectMessage ? "#1976d2" : "#d32f2f",
                    border: `1px solid ${redirectMessage ? "#1976d2" : "#d32f2f"}`
                  }}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {redirectMessage ? (
                    <CheckCircle size={16} color="#1976d2" />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>{redirectMessage || apiError}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="form-group"
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <label htmlFor="email" className={touched.email && errors.email ? "text-error" : ""}>
                Email Id <span className="required">*</span>
              </label>
              <div className={`input-container ${touched.email && errors.email ? "input-error" : ""}`}>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="info@provistechnologies.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.email && !errors.email ? "input-valid" : ""}
                  required
                />
                <Mail className="input-icon" size={20} />
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
            </motion.div>

            <motion.div
              className="form-group"
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              custom={2}
            >
              <label htmlFor="password" className={touched.password && errors.password ? "text-error" : ""}>
                Password <span className="required">*</span>
              </label>
              <div className={`input-container ${touched.password && errors.password ? "input-error" : ""}`}>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={touched.password && !errors.password ? "input-valid" : ""}
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
              className="form-links"
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <motion.button
                className="partner-link-button"
                type="button"
                onClick={handlePartnerSignupClick}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
              >
                Want to be partner?
              </motion.button>
              <motion.button
                className="forgot-password"
                type="button"
                onClick={handleForgotPassword}
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                Forgot password?
              </motion.button>
            </motion.div>

            <motion.button
              className={`auth-button primary-button ${isSubmitting ? "button-loading" : ""}`}
              type="submit"
              disabled={isSubmitting}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              custom={4}
            >
              {isSubmitting ? "Logging in..." : "Login now"}
            </motion.button>

            <motion.div
              className="divider"
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              custom={5}
            >
              <span className="divider-line"></span>
              <span className="divider-text">OR</span>
              <span className="divider-line"></span>
            </motion.div>

            <motion.button
              className="auth-button secondary-button"
              type="button"
              onClick={handleSignupClick}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              custom={6}
            >
              Signup now
            </motion.button>
            
            <motion.div
              className="home-link-container"
              variants={formControlVariants}
              initial="hidden"
              animate="visible"
              custom={7}
              style={{ textAlign: 'center', marginTop: '15px' }}
            >
              <motion.button
                className="home-link-button"
                type="button"
                onClick={() => navigate('/home')}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--primary-color)', 
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  textDecoration: 'underline'
                }}
              >
                Continue to Home Page
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  )
}
