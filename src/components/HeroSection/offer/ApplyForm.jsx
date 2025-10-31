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
  });
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    setResume(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!resume) {
      alert("Please upload your resume");
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("job_id", jobId);
      submitData.append("first_name", formData.firstName);
      submitData.append("last_name", formData.lastName);
      submitData.append("email", formData.email);
      submitData.append("skills", formData.skills);
      submitData.append("resume", resume);

      const response = await fetch(
        `https://hirehub-2-s0pw.onrender.com/apply`,
        {
          method: "POST",
          body: submitData, // Use FormData instead of JSON
          // Don't set Content-Type header - browser will set it with boundary
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("✅ Application submitted successfully!");
        navigate("/Receiver");
      } else {
        alert(result?.error || "❌ Failed to submit application");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      alert("⚠️ Server error — please try again later.");
    } finally {
      setLoading(false);
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
            placeholder="Skills (comma separated)"
            value={formData.skills}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {/* Add file input for resume */}
          <div style={{ textAlign: "left" }}>
            <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>
              Upload Resume (PDF, DOC, DOCX):
            </label>
            <input
              type="file"
              name="resume"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              required
              style={{
                ...inputStyle,
                background: "white",
                width: "100%",
                padding: "8px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = "#e6b800")}
            onMouseLeave={(e) => !loading && (e.target.style.background = "#ffcc00")}
          >
            {loading ? "Submitting..." : "Submit Application"}
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
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle = {
  background: "#ffcc00",
  color: "#222",
  border: "none",
  padding: "12px",
  borderRadius: "5px",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "0.3s",
  marginTop: "10px",
};

export default ApplyForm;