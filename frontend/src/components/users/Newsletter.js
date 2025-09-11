"use client";

import { motion } from "framer-motion";
import "../styles/Newsletter.css";

const Newsletter = () => {
  return (
    <motion.section
      className="newsletter"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="newsletter-container">
        <button className="nav-arrow nav-arrow-left">‹</button>
        <div className="newsletter-content">
          <h3>Neutral Timing</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
        </div>
        <button className="nav-arrow nav-arrow-right">›</button>
      </div>
      <div className="newsletter-dots">
        <span className="dot active"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </motion.section>
  );
};

export default Newsletter;
