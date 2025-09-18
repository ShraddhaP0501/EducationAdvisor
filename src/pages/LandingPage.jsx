// src/pages/LandingPage.js
import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import "../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const [showTierModal, setShowTierModal] = useState(false);


  const handleGetStarted = () => {
    navigate("/quiz"); // old quiz
  };

  // opens modal instead of directly navigating
  const handleCourseMapping = () => {
    setShowTierModal(true);
  };

  // user chooses a tier; navigate to CareerPage and pass tier in state
  const handleChooseTier = (tier) => {
    setShowTierModal(false);
    // navigate to /career and pass tier as state (CareerPage can read location.state.tier)
    navigate("/career", { state: { tier } });
  };

  const closeModal = () => {
    setShowTierModal(false);
  };

  // close modal with ESC key
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>One-Stop Career & Education Advisor</h1>
          <p>
            Discover your best-fit course, explore nearby government colleges,
            and map your career path with AI-powered guidance.
          </p>
          <Button text="Get Started" onClick={handleGetStarted} />
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="features">
        <h2>Our Features</h2>
        <div className="card-container">
          <Card
            title="Aptitude Quiz"
            description="Take a short quiz to discover courses and careers aligned with your interests."
            onClick={handleGetStarted}
          />
          <Card
            title="Course to Career Mapping"
            description="See visual paths from courses to government jobs, private careers, and higher studies."
            onClick={handleCourseMapping}
          />
          <Card
            title="Nearby Colleges"
            description="Find government colleges near you with details on programs, eligibility, and facilities."
          />
          <Card
            title="Scholarship Alerts"
            description="Stay updated on start dates, deadlines, and application processes for scholarships."
          />
        </div>
      </section>

      {/* Tier selection modal */}
      {showTierModal && (
        <div
          className="tier-modal-overlay"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="tier-modal"
            onClick={(e) => e.stopPropagation()}
            aria-labelledby="tier-modal-title"
          >
            <div className="tier-modal-header">
              <h3 id="tier-modal-title">Choose your path</h3>
              <button
                className="tier-modal-close"
                aria-label="Close"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>

            <p className="tier-modal-sub">
              Do you want career options after 10th or after 12th? (You can choose
              and then select a course on the next screen.)
            </p>

            <div className="tier-modal-actions">
              <Button
                text="Career after 10th"
                onClick={() => handleChooseTier("after10")}
              />
              <Button
                text="Career after 12th"
                onClick={() => handleChooseTier("after12")}
              />
            </div>

            <div className="tier-modal-footer">
              <small>
                Tip: If you're unsure, choose "after 12th" to see advanced
                pathways — you can still explore vocational options later.
              </small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
