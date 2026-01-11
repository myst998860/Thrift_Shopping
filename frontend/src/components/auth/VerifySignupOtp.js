"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthCard from "./auth-card";
import { authService } from "../../services/api";

export default function VerifySignupOtp() {
  const navigate = useNavigate();
  const signupEmail = sessionStorage.getItem("signupEmail");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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
      // ✅ Correct payload structure
      const response = await authService.verifyOtp({
        email: signupEmail, // flat string
        otp: otp.trim(),
      });

      setSuccess(response.data || "Email verified successfully");

      // Clear sessionStorage after successful verification
      sessionStorage.removeItem("signupEmail");

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      console.error("OTP verification failed:", err.response?.data || err.message);

      // Handle backend errors safely
      if (err.response?.data) {
        // If backend sends a string
        if (typeof err.response.data === "string") setError(err.response.data);
        // If backend sends object like {status, error, message, timestamp}
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
    <AuthCard title="Verify Email">
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
        </AnimatePresence>

        <AnimatePresence>
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

        <div className="form-group">
          <label>OTP Code</label>
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} // numeric only
            maxLength={6}
          />
        </div>

        <button type="submit" disabled={loading || !otp.trim()}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </AuthCard>
  );
}
