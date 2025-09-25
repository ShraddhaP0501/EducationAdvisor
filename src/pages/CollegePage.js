// src/pages/CollegePage.js
import React from "react";
import { useParams } from "react-router-dom";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";


function CollegePage() {
  const { course, career } = useParams();

  // Example: simple data for Jammu & Kashmir
  const collegeMap = {
    "Computer Science": ["NIT Srinagar", "University of Kashmir"],
    "Mechanical Engineering": ["GCET Jammu", "NIT Srinagar"],
    "Civil Engineering": ["Islamic University of Science & Technology", "NIT Srinagar"],
    "Medicine": ["Sher-i-Kashmir Institute of Medical Sciences", "GMC Srinagar"],
    "Law": ["University of Kashmir (Law Dept)", "Central University of Jammu"],
  };

  const colleges = collegeMap[course] || [];

  return (
    <div style={{ padding: "2rem" }}>
      <h1>{career} after {course}</h1>
      <h2>Colleges in Jammu & Kashmir:</h2>
      {colleges.length === 0 ? (
        <p>No colleges found.</p>
      ) : (
        <ul>
          {colleges.map((college, i) => (
            <li key={i}>{college}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CollegePage;
