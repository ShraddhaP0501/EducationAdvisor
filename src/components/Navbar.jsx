import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Career Advisor</div>
      <ul className="nav-links">
        <li>
          <NavLink to="/LandingPage" className={({ isActive }) => isActive ? "active-link" : ""}>Home</NavLink>
        </li>
        <li>
          <a href="#features">Features</a>
        </li>
        <li>
          <a href="#colleges">Colleges</a>
        </li>
        <li>
          <NavLink to="/career" className={({ isActive }) => isActive ? "active-link" : ""}>Careers</NavLink>
        </li>
        <li>
          <NavLink to="/quiz" className={({ isActive }) => isActive ? "active-link" : ""}>Take Quiz</NavLink>
        </li>
        <li>
          <NavLink to="/signup" className={({ isActive }) => isActive ? "active-link" : ""}>Sign Up/Login</NavLink>
        </li>
        <li>
          <NavLink to="/dashboard" className="profile-circle">JD</NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
