import React, { useState } from "react";
import "../styles/Login.css";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    standard: "10", // default selected class
  });

  const navigate = useNavigate();

=======
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update form state on input change
>>>>>>> c2b52875b8fa6abc3051639800516b0edaef1469
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Submit login form
  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD

    // Store selected class in localStorage
    localStorage.setItem("standard", formData.standard);

    console.log("User Logged In:", formData);
    alert("Login Successful!");

    // Navigate to dashboard (or home page)
    navigate("/dashboard");
=======
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        // Save token for protected routes
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user_id", data.user_id); // optional
        navigate("/dashboard");
      } else {
        setError(data.msg || "Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
>>>>>>> c2b52875b8fa6abc3051639800516b0edaef1469
  };

  return (
    <div className="Login-container">
      <h2>Login</h2>

      {error && <p className="error-message">{error}</p>}

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

<<<<<<< HEAD
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
=======
        <button type="submit" className="Login-btn" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
>>>>>>> c2b52875b8fa6abc3051639800516b0edaef1469
        </button>
      </form>

      <p className="signup-link">
        Don’t have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
