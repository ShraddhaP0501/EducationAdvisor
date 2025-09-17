import React from "react";
import Card from "../components/Card";
import Button from "../components/Button";
import "../styles/LandingPage.css";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/Signup"); // old quiz
  };

  const handleCourseMapping = () => {
    navigate("/career"); // ✅ now goes to CareerPage
  };

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
            onClick={handleCourseMapping} // ✅ this now navigates to CareerPage
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
    </div>
  );
}

export default LandingPage;
