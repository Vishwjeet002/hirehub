import React from "react";
import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import { Routes, Route } from "react-router-dom";

import HeroSection from "./components/HeroSection/HeroSection";
import About from "./components/About/About";
import Contact from "./components/Navbar/Contact"; // Assuming Contact.jsx is in components/Contact/
import Provider from "./components/HeroSection/offer/Provider"; // Make sure this file exists
import Receiver from "./components/HeroSection/offer/Receiver"; // Make sure this file exists
import ApplyForm from "./components/HeroSection/offer/ApplyForm"; // Make sure this file exists


function App() {
  return (
    <>
      <Navbar />

      {/* Main content changes depending on route */}
      <main>
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/provider" element={<Provider />} />
          <Route path="/receiver" element={<Receiver />} />
          <Route path="/apply/:jobId" element={<ApplyForm />} />

          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
