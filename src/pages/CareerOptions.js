// src/pages/CareerOptions.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css"; // reuse your landing styles or replace

export default function CareerOptions() {
  const navigate = useNavigate();

  return (
    <div className="career-options-page" style={{ padding: 24 }}>
      <h1>Choose a Tier</h1>
      <p>Choose whether you want career options after 10th or after 12th.</p>

      <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
        <button
          onClick={() => navigate("/career-after-10th")}
          className="primary-btn"
        >
          Career after 10th
        </button>

        <button
          onClick={() => navigate("/career-after-12th")}
          className="primary-btn"
        >
          Career after 12th
        </button>

        <button onClick={() => navigate("/")} style={{ marginLeft: "auto" }}>
          Back
        </button>
      </div>
    </div>
  );
}
