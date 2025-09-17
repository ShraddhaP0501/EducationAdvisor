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
import QuizPage from './pages/QuizPage';   // old quiz
import CareerPage from './pages/CareerPage'; // ✅ new (was QuizPagee)
import CollegePage from './pages/CollegePage';

import "./App.css";

function App() {
  console.log(React.version);
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />

          <Route path="/quiz" element={<QuizPage />} /> {/**/}
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<Dashboard />} /> {/* ✅ new route */}
          <Route path="/quiz" element={<QuizPage />} />   {/* old quiz */}
          <Route path="/career" element={<CareerPage />} /> {/* ✅ new career mapping */}
          <Route path="/college" element={<CollegePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
