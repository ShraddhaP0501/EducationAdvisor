import React from "react";
import "../styles/Navbar.css";
//Navbar
function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">Career Advisor</div>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#colleges">Colleges</a></li>
        <li><a href="#careers">Careers</a></li>
        <li><a href="#quiz">Take Quiz</a></li>
        <li><a href="#Sign Up">Sign Up</a></li>
      </ul>
    </nav>
  );
}

export default Navbar;
