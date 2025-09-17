// src/components/QuizArts.jsx

import React, { useState } from "react";
import '../styles/Quiz.css';

// 10 sample questions for the Arts quiz
const artsQuestions = [
  {
    questionText: "Which career path is best for someone who enjoys writing and reporting news?",
    options: ["Archaeologist", "Historian", "Journalist", "Librarian"],
    answers: { "Journalist": "Journalist", "Archaeologist": "Archaeologist", "Historian": "Historian", "Librarian": "Librarian" }
  },
  {
    questionText: "If you are interested in a career in law, which of these subjects is most relevant?",
    options: ["Sociology", "Political Science", "Psychology", "Economics"],
    answers: { "Political Science": "Lawyer", "Sociology": "Social Worker", "Psychology": "Psychologist", "Economics": "Economist" }
  },
  {
    questionText: "What is the primary focus of a psychologist?",
    options: ["Studying ancient cultures", "Understanding human behavior", "Creating art", "Managing public events"],
    answers: { "Understanding human behavior": "Psychologist", "Studying ancient cultures": "Archaeologist", "Creating art": "Creative Professional", "Managing public events": "Event Manager" }
  },
  {
    questionText: "Which career path involves working with people to improve their communities?",
    options: ["Teacher", "Lawyer", "Social Worker", "Fashion Designer"],
    answers: { "Social Worker": "Social Worker", "Teacher": "Teacher", "Lawyer": "Lawyer", "Fashion Designer": "Fashion Designer" }
  },
  {
    questionText: "What profession focuses on preserving and studying the past?",
    options: ["Journalist", "Historian", "Politician", "Musician"],
    answers: { "Historian": "Historian", "Journalist": "Journalist", "Politician": "Politician", "Musician": "Creative Professional" }
  },
  {
    questionText: "If you enjoy expressing yourself through art, which career is a good choice?",
    options: ["Sociologist", "Urban Planner", "Creative Professional", "Librarian"],
    answers: { "Creative Professional": "Creative Professional", "Sociologist": "Sociologist", "Urban Planner": "Urban Planner", "Librarian": "Librarian" }
  },
  {
    questionText: "What is the primary role of a civil servant?",
    options: ["Working for a private company", "Serving the government and public", "Managing finances", "Designing buildings"],
    answers: { "Serving the government and public": "Civil Servant", "Working for a private company": "Entrepreneur", "Managing finances": "Auditor", "Designing buildings": "Architect" }
  },
  {
    questionText: "Which of these careers involves working with languages and different cultures?",
    options: ["Psychiatrist", "Translator", "Accountant", "Scientist"],
    answers: { "Translator": "Translator", "Psychiatrist": "Psychologist", "Accountant": "Accountant", "Scientist": "Scientist" }
  },
  {
    questionText: "What career is a good fit for someone who loves to teach and educate others?",
    options: ["Engineer", "Teacher", "Journalist", "Lawyer"],
    answers: { "Teacher": "Teacher", "Engineer": "Engineer", "Journalist": "Journalist", "Lawyer": "Lawyer" }
  },
  {
    questionText: "Which of these careers requires strong research and analytical skills?",
    options: ["Hair Stylist", "Artist", "Sociologist", "Photographer"],
    answers: { "Sociologist": "Sociologist", "Hair Stylist": "Hair Stylist", "Artist": "Creative Professional", "Photographer": "Creative Professional" }
  }
];

// Simplified guidance for clarity
const courseGuidance = {
  "Journalist": "A Bachelor's in Journalism or Mass Communication is a great choice.",
  "Lawyer": "B.A. LL.B. or B.Com. LL.B. are popular integrated law courses after 12th grade.",
  "Psychologist": "B.A. in Psychology followed by an M.A. is the standard path.",
  "Social Worker": "B.A. in Social Work is a good starting point.",
  "Historian": "A B.A. in History is the core of this career.",
  "Creative Professional": "Consider B.A. in Fine Arts, Fashion Design, or a B.A. in English for content writing.",
  "Civil Servant": "Start with any graduation degree and prepare for the UPSC Civil Services Examination.",
  "Translator": "A degree in a specific language or literature is recommended.",
  "Teacher": "A B.A. or B.Sc. followed by a B.Ed. degree is the common route.",
  "Sociologist": "B.A. in Sociology followed by an M.A. is the typical path.",
  "Archaeologist": "Pursue a B.A. in History or Archaeology.",
  "Librarian": "A B.Lib.I.Sc. degree is required for this career.",
  "Hair Stylist": "Hair styling is a vocational career and requires a diploma or certificate course.",
};

function QuizArts() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [careerPathScores, setCareerPathScores] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [mostLikelyCareer, setMostLikelyCareer] = useState("");

  const handleAnswerClick = (selectedOption) => {
    const answers = artsQuestions[currentQuestionIndex].answers;
    const career = answers[selectedOption];

    setCareerPathScores(prevScores => ({
      ...prevScores,
      [career]: (prevScores[career] || 0) + 1
    }));

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < artsQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
    } else {
      setShowResults(true);
      calculateResult();
    }
  };

  const calculateResult = () => {
    let bestCareer = "";
    let highestScore = 0;
    for (const career in careerPathScores) {
      if (careerPathScores[career] > highestScore) {
        highestScore = careerPathScores[career];
        bestCareer = career;
      }
    }
    setMostLikelyCareer(bestCareer);
  };

  if (showResults) {
    return (
      <div className="results-container">
        <h2>Arts Quiz Complete!</h2>
        {mostLikelyCareer ? (
          <>
            <p>Based on your answers, a great career path for you is **{mostLikelyCareer}**.</p>
            <p className="guidance-text">{courseGuidance[mostLikelyCareer] || "We recommend researching this career further to find the best course for you."}</p>
          </>
        ) : (
          <p>We could not determine a specific career path. Please try the quiz again.</p>
        )}
      </div>
    );
  }

  const currentQuestion = artsQuestions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <h3>Question {currentQuestionIndex + 1} of {artsQuestions.length}</h3>
      <p className="question-text">{currentQuestion.questionText}</p>
      <div className="options-container">
        {currentQuestion.options.map((option, index) => (
          <button key={index} onClick={() => handleAnswerClick(option)}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuizArts;