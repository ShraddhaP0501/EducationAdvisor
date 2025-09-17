import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

function CareerPage() {
  const { course } = useParams(); // course name comes from URL
  const [selectedCourse, setSelectedCourse] = useState(course || "");

  // Example mapping of courses → careers
  const courseCareerMap = {
    "Computer Science": ["Software Developer", "Data Scientist", "AI Engineer"],
    "Mechanical Engineering": ["Automobile Engineer", "Robotics Engineer", "Production Manager"],
    "Civil Engineering": ["Structural Engineer", "Urban Planner", "Construction Manager"],
    "Medicine": ["Doctor", "Surgeon", "Pharmacist"],
    "Law": ["Lawyer", "Judge", "Legal Advisor"],
  };

  // All available courses
  const courses = Object.keys(courseCareerMap);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Course → Career Mapping</h1>

      {/* Course Dropdown */}
      <label>
        <b>Select a Course: </b>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Choose a course --</option>
          {courses.map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {/* Show Careers */}
      {selectedCourse && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Careers in {selectedCourse}</h2>
          <ul>
            {courseCareerMap[selectedCourse].map((career, i) => (
              <li key={i}>
                {/* Link to CollegePage */}
                <Link to={`/colleges/${selectedCourse}/${career}`}>
                  {career}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CareerPage;
