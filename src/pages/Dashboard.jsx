import React, { useState, useEffect } from "react";
import "../styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user profile on component mount
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
          // If backend returns filename, prepend uploads path
          if (data.profile_photo && !data.profile_photo.startsWith("http")) {
            data.profile_photo = `http://localhost:5000/uploads/${data.profile_photo}`;
          }
          setUser(data);
        } else if (response.status === 401) {
          // Token invalid or expired
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
        <h1>Welcome, {user.full_name}!</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

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

      <div className="section">
        <h2>Career Recommendations</h2>
        <p>Carrer Recomendations</p>
      </div>

      <div className="section">
        <h2>Nearby Colleges & Programs</h2>
        <p>University of Jammu: Engineering</p>
        <p>Government SPMR College of Commerce, Jammu: Commerce</p>
      </div>

      <div className="section">
        <h2>Opportunities & Alerts</h2>
        <p>Scholarships Last Date: 28 Sept</p>
      </div>
    </div>
  );
};

export default Dashboard;
