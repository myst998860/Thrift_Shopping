"use client";

import { motion } from "framer-motion";

export default function AuthCard({
  children,
  title,
  imageSrc,
  imageAlt,
  imagePosition = "left",
  fullHeight = false,
}) {
  return (
    <motion.div
      className={`auth-card2 ${imagePosition === "right" ? "image-right" : ""} ${
        fullHeight ? "full-height" : ""
      }`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="auth-image2"
        initial={{ opacity: 0, x: imagePosition === "right" ? 50 : -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={imageAlt}
          className="background-image"
        />
      </motion.div>

      <div className="auth-form-container2">
        <motion.div
          className="auth-form2"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <motion.h1
            className="auth-title2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {title}
          </motion.h1>
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
}
