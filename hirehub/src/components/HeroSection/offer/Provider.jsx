import React, { useEffect, useState } from "react";
import "./Provider.css";
import ccc from "../../../assets/ccc.jpg"; // Use your actual image file name here
const Provider = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    position: "",
    vacancies: "",
    requirements: "",
  });

  // Fetch all jobs
  const fetchJobs = async () => {
    try {
      const response = await fetch("http://localhost:5000/jobs");
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  // Handle form input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  // Submit new job
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Job posted successfully!");
        setFormData({ position: "", vacancies: "", requirements: "" });
        fetchJobs();
      } else {
        alert("Error posting job.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Fetch applicants for specific job
  const viewApplicants = async (jobId) => {
    try {
      const response = await fetch(`http://localhost:5000/applicants/${jobId}`);
      const applicants = await response.json();
      const updatedJobs = jobs.map((job) =>
        job.id === jobId ? { ...job, applicants } : job
      );
      setJobs(updatedJobs);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div
      style={{
        background:ccc,
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "1000px",
          width: "100%",
        }}
      >
        {/* Post Job Section */}
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            width: "450px",
            textAlign: "center",
          }}
        >
          <h1 style={{ color: "#333", marginBottom: "15px" }}>Post</h1>
          <form onSubmit={handleSubmit}>
            <label style={{ display: "block", textAlign: "left", fontWeight: "bold", marginTop: "10px" }}>
              Event Name:
            </label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />

            <label style={{ display: "block", textAlign: "left", fontWeight: "bold", marginTop: "10px" }}>
              Requirement:
            </label>
            <input
              type="number"
              id="vacancies"
              value={formData.vacancies}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />

            <label style={{ display: "block", textAlign: "left", fontWeight: "bold", marginTop: "10px" }}>
              Skill Required:
            </label>
            <textarea
              id="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            ></textarea>

            <button
              type="submit"
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 15px",
                cursor: "pointer",
                borderRadius: "5px",
                fontSize: "16px",
                marginTop: "15px",
                width: "100%",
              }}
            >
              Post
            </button>
          </form>
        </div>

        {/* Job Listings Section */}
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            width: "450px",
            textAlign: "center",
          }}
        >
          <h2 style={{ color: "#333", marginBottom: "15px" }}>Check Status</h2>
          <div>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background: "#f9f9f9",
                  padding: "15px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  marginTop: "10px",
                  textAlign: "left",
                }}
              >
                <h2 style={{ color: "#222", marginBottom: "8px" }}>{job.position}</h2>
                <p><strong>Total Requirement:</strong> {job.vacancies}</p>
                <p><strong>Remaining Requirement:</strong> {job.remaining_vacancies}</p>
                <p><strong>Skill Required:</strong> {job.requirements}</p>

                <button
                  onClick={() => viewApplicants(job.id)}
                  style={{
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    marginTop: "10px",
                  }}
                >
                  View Applicants
                </button>

                <div style={{ marginTop: "10px" }}>
                  {job.applicants &&
                    (job.applicants.message ? (
                      <p>{job.applicants.message}</p>
                    ) : (
                      job.applicants.map((app, i) => (
                        <div
                          key={i}
                          style={{
                            background: "#fff",
                            padding: "10px",
                            marginTop: "10px",
                            borderLeft: "4px solid #007bff",
                          }}
                        >
                          <p><strong>Name:</strong> {app.first_name} {app.last_name}</p>
                          <p><strong>Email:</strong> {app.email}</p>
                          <p><strong>Skills:</strong> {app.skills}</p>
                          <a
                            href={`http://localhost:5000${app.resume}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: "#007bff", fontWeight: "bold" }}
                          >
                            Download Resume
                          </a>
                        </div>
                      ))
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Provider;
