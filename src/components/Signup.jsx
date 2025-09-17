import React, { useState } from "react";
import "../styles/Signup.css";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    birthday: "",
    standard: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          email: formData.email,
          birthday: formData.birthday,
          standard: formData.standard,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Sign Up Successful!");
        navigate("/login");
      } else {
        alert(data.error || "Signup failed!");
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Your Account</h2>

      {message && <p className="error-message">{message}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="full_name">Full Name:</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            placeholder="Enter your full name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="birthday">Birthday:</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field-group">
          <label htmlFor="standard">Standard:</label>
          <select
            id="standard"
            name="standard"
            value={formData.standard}
            onChange={handleChange}
            required
          >
            <option value="">Select Standard</option>
            <option value="10">10th Standard</option>
            <option value="12">12th Standard</option>
          </select>
        </div>

        <div className="field-group password-group">
          <label htmlFor="password">Password:</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="toggle-icon" onClick={togglePassword}>
              {showPassword ? "👁️" : "🙈"}
            </span>
          </div>
        </div>

        <div className="field-group password-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <span className="toggle-icon" onClick={toggleConfirmPassword}>
              {showConfirmPassword ? "👁️" : "🙈"}
            </span>
          </div>
        </div>

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
};

export default Signup;