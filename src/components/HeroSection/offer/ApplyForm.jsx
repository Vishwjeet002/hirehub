import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ApplyForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    skills: "",
    resume: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("jobId", jobId);
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("email", formData.email);
    data.append("skills", formData.skills);
   // data.append("resume", formData.resume);

    try {
      const response = await fetch("https://hirehub-2-s0pw.onrender.com/", {
        method: "POST",
        body: data, // FormData handles multipart automatically
      });

      if (response.ok) {
        alert("Application submitted successfully!");
        navigate("/Receiver"); // Redirect to provider page to see applicants
      } else {
        const err = await response.json();
        alert(err.error || "Failed to submit application");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(to right, #1e3c72, #2a5298)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          padding: "30px",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          width: "500px",
          textAlign: "center",
          color: "white",
        }}
      >
        <h1 style={{ fontSize: "26px", marginBottom: "20px" }}>
          Apply for Job #{jobId}
        </h1>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "15px" }}
        >
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="skills"
            placeholder="Skills"
            value={formData.skills}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleChange}
            required
            style={fileInputStyle}
         />

          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => (e.target.style.background = "#e6b800")}
            onMouseLeave={(e) => (e.target.style.background = "#ffcc00")}
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: "10px",
  borderRadius: "5px",
  border: "none",
  outline: "none",
  fontSize: "15px",
};

const fileInputStyle = {
  background: "#fff",
  padding: "8px",
  borderRadius: "5px",
  color: "#000",
};

const buttonStyle = {
  background: "#ffcc00",
  color: "#222",
  border: "none",
  padding: "10px",
  borderRadius: "5px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s",
};

export default ApplyForm;
