import React from "react";
import styles from "./Contact.module.css"; // Make sure you create this file

const Contact = () => {
  return (
    <div className={styles.contactContainer}>
      <h1>Contact Us!</h1>
      <p>
        We would love to hear from you. Please fill out the form below to get in touch.
      </p>
      <form className={styles.contactForm}>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" placeholder="Enter Your Name" />

        <label htmlFor="email">Your Email Address:</label>
        <input type="email" id="email" name="email" placeholder="Your Email" required />

        <label htmlFor="message">Enter Your Message:</label>
        <textarea id="message" name="message" rows="5" placeholder="Your Message" required />

        <button type="submit">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;
