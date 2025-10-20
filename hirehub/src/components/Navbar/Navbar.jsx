import React from "react";
import styles from "./Navbar.module.css"; // Create this CSS module
import { Link } from "react-router-dom"; // import Link for navigation

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
          <button>Login In</button>
          <button>Sign Up
            
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
