import React, { useEffect, useState } from "react";
import "./Provider.css";
import ccc from "../../../assets/ccc.jpg";

const backendURL = import.meta.env.VITE_BACKEND_URL; // ✅ dynamic

const Provider = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    position: "",
    vacancies: "",
    requirements: "",
  });

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${backendURL}/jobs`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${backendURL}/jobs`, {
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

  const viewApplicants = async (jobId) => {
    try {
      const response = await fetch(`${backendURL}/applicants/${jobId}`);
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
        background: ccc,
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
        {/* Post job */}
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
          <h1>Post</h1>
          <form onSubmit={handleSubmit}>
            <label>Event Name:</label>
            <input
              type="text"
              id="position"
              value={formData.position}
              onChange={handleChange}
              required
            />

            <label>Requirement:</label>
            <input
              type="number"
              id="vacancies"
              value={formData.vacancies}
              onChange={handleChange}
              required
            />

            <label>Skill Required:</label>
            <textarea
              id="requirements"
              value={formData.requirements}
              onChange={handleChange}
              required
            />

            <button type="submit">Post</button>
          </form>
        </div>

        {/* List jobs */}
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            padding: "20px",
            borderRadius: "10px",
            width: "450px",
            textAlign: "center",
          }}
        >
          <h2>Check Status</h2>
          <div>
            {Array.isArray(jobs) && jobs.map((job) => (
              <div key={job.id}>
                <h2>{job.position}</h2>
                <p>Total Requirement: {job.vacancies}</p>
                <p>Remaining Requirement: {job.remaining_vacancies}</p>
                <p>Skill: {job.requirements}</p>

                <button onClick={() => viewApplicants(job.id)}>
                  View Applicants
                </button>

                <div>
                  {job.applicants &&
                    (job.applicants.message ? (
                      <p>{job.applicants.message}</p>
                    ) : (
                      job.applicants.map((app, i) => (
                        <div key={i}>
                          <p>Name: {app.first_name} {app.last_name}</p>
                          <p>Email: {app.email}</p>
                          <p>Skills: {app.skills}</p>
                          <a
                            href={`${backendURL}${app.resume}`}
                            target="_blank"
                            rel="noreferrer"
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
