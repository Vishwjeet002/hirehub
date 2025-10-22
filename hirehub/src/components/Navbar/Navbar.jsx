import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <header className={styles.header}>
      <div className={styles.navbar}>
        <h1 className={styles.logo}>Hire Hub</h1>

        <nav>
          <ul className={styles.navList}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>

        <div className={styles.buttons}>
          <button className={styles.loginBtn}>Log In</button>
          <button className={styles.signupBtn}>Sign Up</button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
