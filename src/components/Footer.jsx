import React from "react";
import "../styles/Footer.css";

function Footer() {
  return (
    <footer>
      <div>
        <h3>About Us</h3>
        <p>
          Welcome to our website! We are dedicated to providing the best service
          to our users. Our mission is to make your experience seamless and
          enjoyable.
        </p>
      </div>
      <div style={{ marginTop: "10px" }}>
        &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
