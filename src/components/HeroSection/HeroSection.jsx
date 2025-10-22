import { useNavigate } from "react-router-dom";
import "./HeroSection.css";
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <h2>Grow Your Skills & Advance Your Career</h2>
      <p>Get updates about events near you easily with just a click!</p>
      <div className="hero-buttons">
        <button
          className="offer-job-btn"
          onClick={() => navigate("/provider")}
        >
          Provider
        </button>
        <button
          className="find-job-btn"
          onClick={() => navigate("/receiver")}
        >
          Receiver
        </button>
      </div>
    </section>
  );
};
export default HeroSection;