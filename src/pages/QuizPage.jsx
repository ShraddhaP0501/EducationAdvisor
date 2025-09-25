import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Quiz10th from "../components/Quiz10th";
import Quiz12Maths from "../components/Quiz12thMaths"; // Maths quiz
//import Quiz12Bio from "../components/QuizBiology";   // Biology quiz
import Quiz12Commerce from "../components/QuizCommerce";
import Quiz12Arts from "../components/QuizArts";
import "../styles/QuizPage.css";

const QuizPage = () => {
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const navigate = useNavigate();
  const alertShown = useRef(false); // Ref to track if alert has been shown

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !alertShown.current) {
      alertShown.current = true; // mark alert as shown
      alert("You must log in to take the quiz.");
      navigate("/login");
    }
  }, [navigate]);

  const quizOptions = [
    {
      id: "10th",
      label: "10th Quiz",
      description:
        "Confused about what stream to take after 10th? Take this quiz and get personalized recommendations for Science, Commerce, Arts, or Diploma paths, tailored to your interests and strengths.",
      icon: "📚",
      component: <Quiz10th />,
    },
    {
      id: "12thMaths",
      label: "12th Science (Maths)",
      description:
        "Studying Maths in 11th-12th? Unsure whether to go for JEE, Engineering, or other career paths? This quiz helps you discover the best options suited to your skills and goals.",
      icon: "🧮",
      component: <Quiz12Maths />,
    },
    {
      id: "12thBio",
      label: "12th Science (Biology)",
      description:
        "Studying Biology in 11th-12th? Confused about NEET, Medical, or other career paths? Take this quiz to understand your strengths and the best next steps in your academic journey.",
      icon: "🧬",
      //component: //<Quiz12Bio />,
    },
    {
      id: "12thCommerce",
      label: "12th Commerce",
      description:
        "Interested in Commerce? Unsure whether to pursue CA, Business, Finance, or other courses? This quiz provides guidance to help you make informed decisions for your future.",
      icon: "💼",
      component: <Quiz12Commerce />,
    },
    {
      id: "12thArts",
      label: "12th Arts",
      description:
        "Studying Arts? Not sure whether to go for Humanities, Social Sciences, or creative courses? Take this quiz to explore your interests and discover the best options for you.",
      icon: "🎨",
      component: <Quiz12Arts />,
    },
  ];

  const renderQuiz = () => {
    const selected = quizOptions.find((q) => q.id === selectedQuiz);
    return selected ? selected.component : null;
  };

  if (selectedQuiz) {
    return (
      <div className="quiz-page-container">
        <div className="back-btn-wrapper">
          <button className="back-btn" onClick={() => setSelectedQuiz("")}>
            ← Back to Quiz Selection
          </button>
        </div>
        {renderQuiz()}
      </div>
    );
  }

  return (
    <div className="quiz-selection-page">
      <h2>Select Your Quiz</h2>
      <div className="quiz-cards">
        {quizOptions.map((quiz) => (
          <div
            key={quiz.id}
            className="quiz-card"
            onClick={() => setSelectedQuiz(quiz.id)}
          >
            <div className="quiz-icon">{quiz.icon}</div>
            <h3>{quiz.label}</h3>
            <p className="quiz-description">{quiz.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizPage;
