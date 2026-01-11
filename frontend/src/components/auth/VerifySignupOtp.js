"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "./auth-card2"; // Use the image-supported card
import { authService } from "../../services/api";

export default function VerifySignupOtp() {
  const navigate = useNavigate();
  const signupEmail = sessionStorage.getItem("signupEmail");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation variants
  const buttonVariants = { idle: { scale: 1 }, hover: { scale: 1.03 }, tap: { scale: 0.97 } };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otp.trim()) {
      setError("OTP is required");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyOtp({
        email: signupEmail,
        otp: otp.trim(),
      });

      setSuccess(response.data || "Email verified successfully");
      sessionStorage.removeItem("signupEmail");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("OTP verification failed:", err.response?.data || err.message);
      if (err.response?.data) {
        if (typeof err.response.data === "string") setError(err.response.data);
        else if (err.response.data.message) setError(err.response.data.message);
        else setError("OTP verification failed. Please try again.");
      } else {
        setError("Unable to connect to the server. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container2">
      <AuthCard
        title="Verify Email"
        imageSrc="https://i.pinimg.com/736x/d2/ec/7e/d2ec7e71186c0c3ea0f71460f9d51946.jpg"
        imageAlt="Signup Image"
        imagePosition="right"
      >
        <form onSubmit={handleVerify}>
          <AnimatePresence>
            {error && (
              <motion.div
                className="error-banner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                className="success-banner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle size={16} />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <p style={{ marginBottom: "20px", color: "#666", fontSize: "14px" }}>
            We've sent a 6-digit verification code to your email <strong>{signupEmail}</strong>.
          </p>

          <div className="form-group">
            <label>OTP Code</label>
            <div className="input-container">
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                style={{ letterSpacing: "2px", fontSize: "18px", textAlign: "center" }}
              />
              <Mail className="input-icon" size={20} />
            </div>
          </div>

          <motion.button
            type="submit"
            className="auth-button primary-button"
            disabled={loading || !otp.trim()}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </motion.button>
        </form>
      </AuthCard>
    </div>
  );
}
