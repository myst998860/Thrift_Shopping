"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "./auth-card";
import { authService } from "../../services/api";
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      setSuccessMessage(
        "OTP has been sent to your email. Please check your inbox."
      );

      // Store email in localStorage to pass to reset password page
      localStorage.setItem("resetEmail", email);

      // Redirect to reset password page after a short delay
      setTimeout(() => {
        navigate("/reset-password");
      }, 2000);
    } catch (err) {
      console.error("Request password reset error:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      imageSrc="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      imageAlt="Forgot password illustration"
      imagePosition="left"
    >
      <form onSubmit={handleSubmit} noValidate>
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
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

        <div className="form-group">
          <label htmlFor="email" className={error ? "text-error" : ""}>
            Email Address <span className="required">*</span>
          </label>
          <div className={`input-container ${error ? "input-error" : ""}`}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="email"
            />
            <Mail className="input-icon" size={20} />
          </div>
        </div>

        <button
          type="submit"
          className={`auth-button primary-button ${
            isSubmitting ? "button-loading" : ""
          }`}
          disabled={isSubmitting || !email}
        >
          {isSubmitting ? "Sending OTP..." : "Send OTP"}
        </button>

        <button
          type="button"
          className="back-to-login-button"
          onClick={() => navigate("/login")}
          style={{ marginTop: "1rem" }}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>
      </form>
    </AuthCard>
  );
}