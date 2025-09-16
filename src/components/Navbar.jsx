import React from "react";
import { Link } from "react-router-dom";   // ✅ must import Link
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Career Advisor</div>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#colleges">Colleges</a></li>
        <li><a href="#careers">Careers</a></li>
        <li><a href="#quiz">Take Quiz</a></li>
        <li><Link to="/signup">Sign Up</Link></li> {/* ✅ works now */}
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
