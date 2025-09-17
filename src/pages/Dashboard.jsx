import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // user data from backend
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch("http://localhost:5000/api/upload-photo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert("Photo uploaded successfully!");
        // Refresh user data to get new photo URL
        setUser({ ...user, profile_photo: `http://localhost:5000/uploads/${data.filename}` });
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (!user) return null;

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>

      {/* Profile Snapshot */}
      <div className="profile-card">
        <div className="photo-wrapper">
          {user.profile_photo ? (
            <img src={user.profile_photo} alt="Profile" className="profile-photo" />
          ) : (
            <div className="profile-placeholder">No Photo</div>
          )}
        </div>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload / Change Photo</button>

        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Birthday:</strong> {user.birthday}</p>
          <p><strong>Standard:</strong> {user.standard}</p>
        </div>
      </div>

      {/* Career Recommendations */}
      <div className="section">
        <h2>Career Recommendations</h2>
        <p>[AI-generated suggestions will appear here]</p>
      </div>

      {/* Nearby Colleges & Programs */}
      <div className="section">
        <h2>Nearby Colleges & Programs</h2>
        <p>[Fetched from backend or static placeholder]</p>
      </div>

      {/* Opportunities & Alerts */}
      <div className="section">
        <h2>Opportunities & Alerts</h2>
        <p>[Fetched from backend or static placeholder]</p>
      </div>
    </div>
  );
};

export default Dashboard;
