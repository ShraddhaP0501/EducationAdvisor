import React, { useState } from "react";
import "../styles/Login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    standard: "10", // default selected class
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Store selected class in localStorage
    localStorage.setItem("standard", formData.standard);

    console.log("User Logged In:", formData);
    alert("Login Successful!");

    // Navigate to dashboard (or home page)
    navigate("/dashboard");
  };

  return (
    <div className="Login-container">
      <h2>Login</h2>
      <form className="Login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Select Your Class</label>
          <select
            name="standard"
            value={formData.standard}
            onChange={handleChange}
            required
          >
            <option value="10">10th</option>
            <option value="12">12th</option>
          </select>
        </div>

        <button type="submit" className="Login-btn">
          Login
        </button>
      </form>

      <p>
        Don’t have an account? <a href="/signup">Sign Up</a>
      </p>
    </div>
  );
};

export default Login;
