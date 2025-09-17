import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Signup from "./components/Signup";
import Login from "./components/Login";
import QuizPage from './pages/QuizPage';
import quiz from './components/quiz';

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route path="/quiz" element={<QuizPage />} /> {/**/}
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ new route */}
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
