import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Fetch user profile + quiz results
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();

          // fetch results separately
          const resultsRes = await fetch("http://localhost:5000/user-quiz-results", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` },
          });
          const resultsData = await resultsRes.json();
          data.results = resultsData.results || [];

          if (data.profile_photo && !data.profile_photo.startsWith("http")) {
            data.profile_photo = `http://localhost:5000/uploads/${data.profile_photo}`;
          }

          setUser(data);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          const data = await response.json();
          setError(data.msg || "Failed to fetch user");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Something went wrong. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // Upload profile photo
  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch("http://localhost:5000/upload-photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.filename) {
        alert("Photo uploaded successfully!");
        setUser({ ...user, profile_photo: `http://localhost:5000/uploads/${data.filename}` });
      } else {
        alert(data.msg || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  // Logout
  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (!user) return <p>{error || "No user data available"}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {user.full_name} 👋</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="photo-wrapper">
          {user.profile_photo ? (
            <img src={user.profile_photo} alt="Profile" className="profile-photo" />
          ) : (
            <div className="profile-placeholder">No Photo</div>
          )}
        </div>

        <div className="profile-actions">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={handleUpload}>Upload / Change Photo</button>
        </div>

        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Birthday:</strong> {user.birthday}</p>
          <p><strong>Standard:</strong> {user.standard}</p>
        </div>
      </div>

      {/* Career Recommendations */}
      <div className="section">
        <h2>Career Recommendations</h2>
        {user.results && user.results.length > 0 ? (
          <>
            <p className="latest-suggestion">
              <strong>Latest Suggestion:</strong> {user.results[0].suggestion}
            </p>

            <button
              className="toggle-history-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Hide Past Results" : "Show Past Results"}
            </button>

            {showHistory && (
              <ul className="results-list">
                {user.results.slice(1, 6).map((res, index) => (
                  <li key={index} className="result-item">
                    <strong>{new Date(res.created_at).toLocaleDateString()}:</strong>{" "}
                    {res.suggestion}
                  </li>
                ))}
                {user.results.length > 6 && (
                  <li className="more-results">
                    ...and {user.results.length - 6} more
                  </li>
                )}
              </ul>
            )}

            {user.results.length > 6 && (
              <Link to="/history" className="view-history-link">
                View Full History →
              </Link>
            )}
          </>
        ) : (
          <p>No recommendations yet. Take the quiz!</p>
        )}

        <button className="quiz-btn" onClick={() => navigate("/quiz")}>
          Take Career Quiz
        </button>
      </div>

      {/* Colleges */}
      <div className="section">
        <h2>Nearby Colleges & Programs</h2>
        <p>University of Jammu: Engineering</p>
        <p>Government SPMR College of Commerce, Jammu: Commerce</p>
      </div>

      {/* Opportunities */}
      <div className="section">
        <h2>Opportunities & Alerts</h2>
        <p>Scholarships Last Date: 28 Sept</p>
      </div>
    </div>
  );
};

export default Dashboard;
