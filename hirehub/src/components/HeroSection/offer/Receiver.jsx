import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Receiver.module.css";

const Receiver = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch job listings
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/jobs");
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Apply Now click
  const applyJob = (jobId) => {
    navigate(`/apply/${jobId}`);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Filter jobs to only show those with vacancies
  const availableJobs = jobs.filter(job => {
    // Convert vacancies to number and check if it's greater than 0
    const vacancies = Number(job.vacancies);
    return !isNaN(vacancies) && vacancies > 0;
  });

  // Skeleton loading component
  const SkeletonLoader = () => (
    <div className={styles.jobList}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className={styles.skeletonCard}>
          <div className={`${styles.skeletonLine} ${styles.short}`} style={{height: '24px', marginBottom: '16px'}}></div>
          <div className={styles.skeletonLine} style={{width: '70%', marginBottom: '12px'}}></div>
          <div className={styles.skeletonLine} style={{width: '90%', marginBottom: '12px'}}></div>
          <div className={styles.skeletonLine} style={{width: '80%', marginBottom: '20px'}}></div>
          <div className={styles.skeletonLine} style={{height: '44px', marginBottom: '0'}}></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={styles.receiverPage}>
      <div className={styles.container}>
        {/* Professional Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>HireHub</h1>
          <p className={styles.subtitle}>
            Discover your next career opportunity with top companies worldwide
          </p>
          
          {/* Stats Bar - Now shows available jobs count */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{availableJobs.length}</span>
              <span className={styles.statLabel}>Open Positions</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>24h</span>
              <span className={styles.statLabel}>Quick Apply</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>50+</span>
              <span className={styles.statLabel}>Companies</span>
            </div>
          </div>
        </div>

        {/* Job Listing Grid */}
        {loading ? (
          <SkeletonLoader />
        ) : availableJobs.length > 0 ? (
          <div className={styles.jobList}>
            {availableJobs.map((job) => (
              <div key={job.id} className={styles.jobBox}>
                {/* Status Badge */}
                <div className={`${styles.statusBadge} ${styles.statusNew}`}>
                  New
                </div>
                
                <div className={styles.jobHeader}>
                  <div className={styles.jobTitleSection}>
                    <h2>{job.position}</h2>
                    <div className={styles.company}>{job.company || "Leading Tech Company"}</div>
                  </div>
                </div>

                {/* Meta Information */}
                <div className={styles.metaInfo}>
                  <div className={styles.metaItem}>
                    <span>📍 {job.location || "Remote"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>💼 {job.type || "Full-time"}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span>💰 {job.salary || "Competitive"}</span>
                  </div>
                </div>

                {/* Job Details */}
                <div className={styles.jobDetails}>
                  <div className={styles.detailItem}>
                    <strong>Open Positions</strong>
                    <p>{job.vacancies} position{job.vacancies > 1 ? 's' : ''} available</p>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Skills Required</strong>
                    <p>{job.requirements}</p>
                  </div>
                  {job.description && (
                    <div className={styles.detailItem}>
                      <strong>Description</strong>
                      <p>{job.description}</p>
                    </div>
                  )}
                </div>

                <button
                  className={styles.applyButton}
                  onClick={() => applyJob(job.id)}
                >
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noJobs}>
            <div className={styles.noJobsIcon}>💼</div>
            <h3>No Positions Available</h3>
            <p>We don't have any open positions at the moment. Please check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Receiver;