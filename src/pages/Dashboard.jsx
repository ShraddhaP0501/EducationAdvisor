import React, { useState } from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [user] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    birthdate: "2005-01-01",
    standard: "12th Standard",
    course: "BCA",
    gpa: "8.5",
    skills: ["Python", "HTML", "CSS"],
    interests: ["Web Development", "AI", "Cybersecurity"],
  });

  const [photo, setPhoto] = useState(null);
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert("Select a file first");
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>

      {/* Profile Snapshot */}
      <div className="profile-card">
        <div className="photo-wrapper">
          {photo ? (
            <img src={photo} alt="Profile" className="profile-photo" />
          ) : (
            <div className="profile-placeholder">No Photo</div>
          )}
        </div>

        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button onClick={handleUpload}>Upload / Change Photo</button>

        <div className="user-info">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Birthday:</strong> {user.birthdate}</p>
          <p><strong>Standard:</strong> {user.standard}</p>
          <p><strong>Course:</strong> {user.course}</p>
          <p><strong>GPA:</strong> {user.gpa}</p>
          <p><strong>Skills:</strong> {user.skills.join(", ")}</p>
          <p><strong>Interests:</strong> {user.interests.join(", ")}</p>
        </div>
      </div>

      {/* Career Recommendations (Placeholder) */}
      <div className="section">
        <h2>Career Recommendations</h2>
        <p>[AI-generated suggestions will appear here]</p>
        <ul>
          <li>
            <strong>Web Developer</strong> – Build websites and web apps.
            <button>Explore More</button>
          </li>
          <li>
            <strong>AI Engineer</strong> – Work on machine learning models.
            <button>Explore More</button>
          </li>
        </ul>
        <p>Match Percentage: Web Dev – 85%, AI – 78%</p>
      </div>

      {/* Nearby Colleges & Programs */}
      <div className="section">
        <h2>Nearby Colleges & Programs</h2>
        <ul>
          <li>
            <strong>XYZ Institute of Technology</strong><br />
            BCA Program – Eligibility: 12th Pass – Deadline: Oct 15<br />
            <button>Save</button>
          </li>
          <li>
            <strong>ABC University</strong><br />
            AI & ML Program – Eligibility: 12th Pass – Deadline: Sep 30<br />
            <button>Save</button>
          </li>
        </ul>
      </div>

      {/* Opportunities & Alerts */}
      <div className="section">
        <h2>Opportunities & Alerts</h2>
        <ul>
          <li>Scholarship: TechSpark 2025 – Deadline: Oct 10</li>
          <li>Internship: Web Dev Intern @ CodeLab – Apply by Sep 25</li>
          <li>Hackathon: AIthon 2025 – Registration closes Sep 20</li>
        </ul>
        <p><strong>Reminders:</strong> 2 deadlines approaching this week</p>
      </div>

      {/* Career Map (Visualization Placeholder) */}
      <div className="section">
        <h2>Career Map</h2>
        <p>If you choose <strong>Web Development</strong> → Frontend / Backend / Full Stack → Job Roles → Salary Ranges</p>
        <p>[Interactive roadmap coming soon]</p>
      </div>
    </div>
  );
};

export default Dashboard;