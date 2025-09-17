import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Career Advisor</div>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#colleges">Colleges</a></li>
        <li><a href="#careers">Careers</a></li>
        <li><Link to="/quiz">Take Quiz</Link></li>{/*now working*/}
        <li><Link to="/signup">Sign Up/Login</Link></li>
        {/* Profile Circle */}
        <li>
          <Link to="/dashboard" className="profile-circle">
            {/* You can put initials or icon */}
            JD
          </Link>
        </li>

      </ul>
    </nav>
  );
}

export default Navbar;
