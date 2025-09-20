// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Signup from "./components/Signup";
import Login from "./components/Login";
import QuizPage from "./pages/QuizPage";
//import CareerPage from "./pages/CareerPage";
import CollegePage from "./components/CollegePage";
import CareerOptions from "./pages/CareerOption";
import StreamSelectionPage from "./pages/StreamSelectionPage";
import FieldSelectorPage from "./pages/FieldSelectorPage";
import CourseListPage from "./pages/CourseListPage";
import JobsPage from "./pages/JobPage";

/* =========================
   EDITED / NEW IMPORTS
   - Added imports for the new pages that were missing previously:
     CareerOptions, After10th, After12th
   ========================= */
//import CareerOptions from "./pages/CareerOptions"; // EDITED: added
//import CareerSelector from "./pages/CareerSelector"; // EDITED: added

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          {/* MAIN ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landingpage" element={<LandingPage />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/quiz" element={<QuizPage />} />

          {/* Career / Course flow */}
          {/* NOTE: keep both /career (detailed CareerPage) and the new selector pages */}
          {/* <Route path="/career" element={<CareerPage />} />

          {/* EDITED: new flow pages for tier selection and tier-specific options */}
          {/*<Route path="/career-options" element={<CareerOptions />} />    EDITED: added */}
          {/* <Route path="/career-selector" element={<CareerSelector />} /> EDITED: added */}

          <Route path="/college" element={<CollegePage />} />

          <Route path="/dashboard" element={<Dashboard />} />

          {/*Career related Routes*/}
          <Route path="/career" element={<CareerOptions />} />
          <Route path="/career/10th" element={<StreamSelectionPage />} />
          <Route path="/career/10th/:stream" element={<FieldSelectorPage />} />
          <Route path="/career/10th/:stream/:field" element={<CourseListPage />} />
          <Route path="/career/10th/:stream/:field/jobs" element={<JobsPage />} />
          <Route path="/career/10th/:stream/:field/:course/jobs" element={<JobsPage />} />



          {/* CLEANUP: removed duplicate "/" route (was duplicated before) */}
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
