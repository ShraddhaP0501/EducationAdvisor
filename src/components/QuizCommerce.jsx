import React, { useState } from "react";
import "../styles/quiz.css";

function QuizCommerce() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState({
    primary_suggestion: "",
    primary_reason: "",
    alternate_suggestions: [],
  });

  // Fetch quiz
  const fetchQuiz = async () => {
    setLoading(true);
    setResult({
      primary_suggestion: "",
      primary_reason: "",
      alternate_suggestions: [],
    });

    try {
      const response = await fetch(
        "http://localhost:5000/generate-quiz-commerce"
      );
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setQuestions([]);
    }

    setLoading(false);
  };

  // Record answer
  const handleAnswer = (qIndex, option) => {
    setAnswers({ ...answers, [qIndex]: option });
  };

  // Submit quiz
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setResult({
        primary_suggestion: "You are not logged in",
        primary_reason: "",
        alternate_suggestions: [],
      });
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/evaluate-quiz-commerce",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setResult({
          primary_suggestion:
            data.primary_suggestion || "Failed to evaluate quiz",
          primary_reason: data.primary_reason || "",
          alternate_suggestions: data.alternate_suggestions || [],
        });
        return;
      }

      setResult({
        primary_suggestion: data.primary_suggestion || "",
        primary_reason: data.primary_reason || "",
        alternate_suggestions: data.alternate_suggestions || [],
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setResult({
        primary_suggestion: "Failed to evaluate quiz",
        primary_reason: "",
        alternate_suggestions: [],
      });
    }
  };

  return (
    <div className="quiz-container">
      <h1 className="quiz-title">
        Career Quiz for Commerce Students
      </h1>

      {questions.length === 0 && !loading && (
        <button className="start-btn" onClick={fetchQuiz}>
          Start Quiz
        </button>
      )}

      {loading && <p>Loading quiz...</p>}

      {questions.length > 0 &&
        questions.map((q, i) => (
          <div key={i} className="quiz-card">
            <h3>{q.question}</h3>
            <div className="options">
              {q.options.map((opt, j) => (
                <button
                  key={j}
                  className={`option-btn ${
                    answers[i] === opt ? "selected" : ""
                  }`}
                  onClick={() => handleAnswer(i, opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

      {questions.length > 0 && (
        <button className="submit-btn" onClick={handleSubmit}>
          Submit Quiz
        </button>
      )}

      {result.primary_suggestion && (
        <div className="result-box">
          <h2>Suggested Path: {result.primary_suggestion}</h2>
          {result.primary_reason && (
            <p>Reason: {result.primary_reason}</p>
          )}

          {result.alternate_suggestions.length > 0 && (
            <div className="alternatives">
              <h3>Other Possible Options:</h3>
              <ul>
                {result.alternate_suggestions.map((alt, i) => (
                  <li key={i}>
                    {alt.career}
                    {alt.reason ? ` - ${alt.reason}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizCommerce;
