import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <h1 className="footer-logo">
        Hire<span className="highlight">Hub</span>
      </h1>

      <div className="footer-links">
        <a href="#">Instagram</a>
        <a href="#">LinkedIn</a>
        <a href="#">Facebook</a>
        <a href="#">GitHub</a>
      </div>

      <p className="footer-text">
        © {new Date().getFullYear()} HireHub | All rights reserved
      </p>
    </footer>
  );
};

export default Footer;
