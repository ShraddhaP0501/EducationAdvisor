import React, { useState } from "react";
import Quiz10th from "../components/Quiz10th";
import Quiz12Science from "../components/QuizScience";
import Quiz12Commerce from "../components/QuizCommerce";
import Quiz12Arts from "../components/QuizArts";
import "../styles/QuizPage.css";

const QuizPage = () => {
  const [selectedQuiz, setSelectedQuiz] = useState(""); // "" | "10th" | "12thScience" | "12thCommerce" | "12thArts"

  const renderQuiz = () => {
    switch (selectedQuiz) {
      case "10th":
        return <Quiz10th />;
      case "12thScience":
        return <Quiz12Science />;
      case "12thCommerce":
        return <Quiz12Commerce />;
      case "12thArts":
        return <Quiz12Arts />;
      default:
        return (
          <div className="quiz-selection">
            <h2>Select Your Quiz</h2>
            <div className="button-group">
              <button onClick={() => setSelectedQuiz("10th")}>10th Quiz</button>
              <button onClick={() => setSelectedQuiz("12th")}>12th Quiz</button>
            </div>
          </div>
        );
    }
  };

  // If user clicked 12th quiz, show stream selection
  if (selectedQuiz === "12th") {
    return (
      <div className="quiz-selection">
        <h2>Select Your Stream for 12th Quiz</h2>
        <div className="button-group">
          <button onClick={() => setSelectedQuiz("12thScience")}>Science</button>
          <button onClick={() => setSelectedQuiz("12thCommerce")}>Commerce</button>
          <button onClick={() => setSelectedQuiz("12thArts")}>Arts</button>
          <button onClick={() => setSelectedQuiz("")}>Back</button>
        </div>
      </div>
    );
  }

  return <div className="quiz-page-container">{renderQuiz()}</div>;
};

export default QuizPage;
