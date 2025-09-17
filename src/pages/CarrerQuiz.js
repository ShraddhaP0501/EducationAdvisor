// src/pages/QuizPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function QuizPage() {
  const [course, setCourse] = useState("");
  const navigate = useNavigate();

  const courses = [
    "Computer Science",
    "Mechanical Engineering",
    "Civil Engineering",
    "Medicine",
    "Law",
  ];

  const handleSubmit = () => {
    if (course) {
      navigate(`/careers/${course}`);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Select a Course</h1>
      <select value={course} onChange={(e) => setCourse(e.target.value)}>
        <option value="">-- Choose a course --</option>
        {courses.map((c, i) => (
          <option key={i} value={c}>
            {c}
          </option>
        ))}
      </select>
      <br /><br />
      <button onClick={handleSubmit}>See Careers</button>
    </div>
  );
}

export default QuizPage;