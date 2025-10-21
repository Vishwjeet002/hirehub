import React from "react";
import styles from "./Contact.module.css"; // CSS module
import ccc from "../../assets/ccc.jpg"; // Use your actual image file name here

const Contact = () => {
  return (
    <div className={styles.contactPage}>
      {/* Left side image */}
      <div className={styles.imageContainer}>
        <img src={ccc} alt="Contact Us" />
      </div>

      {/* Right side contact form */}
      <div className={styles.formContainer}>
        <h1>Contact Us!</h1>
        <p>We would love to hear from you. Please fill out the form below to get in touch.</p>
        <form className={styles.contactForm}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" name="name" placeholder="Enter Your Name" required />

          <label htmlFor="email">Email Address:</label>
          <input type="email" id="email" name="email" placeholder="Enter Your Email" required />

          <label htmlFor="message">Message:</label>
          <textarea id="message" name="message" rows="5" placeholder="Your Message" required />

          <button type="submit">Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
