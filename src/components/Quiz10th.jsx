import React, { useState } from "react";
import "../styles/quiz.css";

function Quiz10th() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState({ suggestion: "", reason: "" });

  // Fetch quiz from backend
  const fetchQuiz = async () => {
    setLoading(true);
    setResult({ suggestion: "", reason: "" });
    try {
      const response = await fetch("http://localhost:5000/generate-quiz");
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setQuestions([]);
    }
    setLoading(false);
  };

  // Record selected answer
  const handleAnswer = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  // Submit answers to backend with JWT
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setResult({ suggestion: "You are not logged in", reason: "" });
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/evaluate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Send JWT
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errData = await response.json();
        setResult({ suggestion: errData.suggestion || "Failed to evaluate quiz", reason: "" });
        return;
      }

      const data = await response.json();
      setResult({ suggestion: data.suggestion || "", reason: data.reason || "" });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setResult({ suggestion: "Failed to evaluate quiz", reason: "" });
    }
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">Career Aptitude Quiz</h1>

      {/* Start Quiz button */}
      {questions.length === 0 && !loading && (
        <button className="start-btn" onClick={fetchQuiz}>
          Start Quiz
        </button>
      )}

      {/* Loading indicator */}
      {loading && <p>Loading quiz...</p>}

      {/* Quiz questions */}
      {questions.length > 0 &&
        questions.map((q, i) => (
          <div key={i} className="quiz-card">
            <h3>{q.question}</h3>
            <div className="options">
              {q.options.map((opt, j) => (
                <button
                  key={j}
                  className={`option-btn ${answers[i] === opt ? "selected" : ""}`}
                  onClick={() => handleAnswer(i, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

      {/* Submit button */}
      {questions.length > 0 && (
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Answers
        </button>
      )}

      {/* Result display */}
      {result.suggestion && (
        <div className="result-box">
          <h2>Suggested Stream: {result.suggestion}</h2>
          {result.reason && <p>Reason: {result.reason}</p>}
        </div>
      )}
    </div>
  );
}

export default Quiz10th;
