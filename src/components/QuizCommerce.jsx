// src/components/QuizCommerce.jsx

import React, { useState } from "react";
import '../styles/quiz.css';

// 10 sample questions for the Commerce quiz
const commerceQuestions = [
  {
    questionText: "If you enjoy managing financial records, which career is a good fit?",
    options: ["Marketing Manager", "Chartered Accountant", "Human Resources Manager", "Economist"],
    answers: { "Chartered Accountant": "Chartered Accountant", "Marketing Manager": "Marketing Manager", "Human Resources Manager": "HR Manager", "Economist": "Economist" }
  },
  {
    questionText: "Which career path involves analyzing market trends and consumer behavior?",
    options: ["Financial Analyst", "Market Research Analyst", "Stockbroker", "Auditor"],
    answers: { "Market Research Analyst": "Market Research Analyst", "Financial Analyst": "Financial Analyst", "Stockbroker": "Stockbroker", "Auditor": "Auditor" }
  },
  {
    questionText: "What subject is most important for becoming an Investment Banker?",
    options: ["Business Studies", "Economics", "Accountancy", "Applied Math"],
    answers: { "Economics": "Investment Banker", "Accountancy": "Accountant", "Business Studies": "Entrepreneur", "Applied Math": "Financial Analyst" }
  },
  {
    questionText: "Which profession requires excellent communication and negotiation skills?",
    options: ["Sales Manager", "Tax Consultant", "Company Secretary", "Bookkeeper"],
    answers: { "Sales Manager": "Sales Manager", "Tax Consultant": "Tax Consultant", "Company Secretary": "Company Secretary", "Bookkeeper": "Bookkeeper" }
  },
  {
    questionText: "Which of the following is an example of an asset for a company?",
    options: ["Loan", "Salary", "Building", "Debt"],
    answers: { "Building": "Auditor", "Loan": "Tax Consultant", "Salary": "HR Manager", "Debt": "Financial Analyst" }
  },
  {
    questionText: "If you are interested in starting your own business, which course is most relevant?",
    options: ["B.Com.", "BBA", "MBA", "B.A. Economics"],
    answers: { "BBA": "Entrepreneur", "B.Com.": "Chartered Accountant", "MBA": "Management Consultant", "B.A. Economics": "Economist" }
  },
  {
    questionText: "Which career involves advising businesses on improving their performance?",
    options: ["Business Manager", "Management Consultant", "Risk Manager", "Public Relations Specialist"],
    answers: { "Management Consultant": "Management Consultant", "Business Manager": "Business Manager", "Risk Manager": "Risk Manager", "Public Relations Specialist": "Public Relations Specialist" }
  },
  {
    questionText: "If you enjoy working with financial data and statistics, what career is a good match?",
    options: ["Event Manager", "Data Analyst", "Brand Manager", "Graphic Designer"],
    answers: { "Data Analyst": "Data Analyst", "Event Manager": "Event Manager", "Brand Manager": "Brand Manager", "Graphic Designer": "Graphic Designer" }
  },
  {
    questionText: "Which of these is a non-profit organization?",
    options: ["A bank", "A hospital", "A charity", "A factory"],
    answers: { "A charity": "Social Worker", "A bank": "Investment Banker", "A hospital": "Hospital Administrator", "A factory": "Operations Manager" }
  },
  {
    questionText: "What career focuses on protecting a company's financial records from fraud?",
    options: ["Marketing Executive", "Auditor", "Sales Representative", "Public Relations Specialist"],
    answers: { "Auditor": "Auditor", "Marketing Executive": "Marketing Manager", "Sales Representative": "Sales Manager", "Public Relations Specialist": "Public Relations Specialist" }
  }
];

// Simplified guidance for clarity
const courseGuidance = {
  "Chartered Accountant": "Consider B.Com. followed by the CA program.",
  "Marketing Manager": "BBA or B.Com. in Marketing.",
  "HR Manager": "BBA followed by an MBA in Human Resources.",
  "Economist": "B.A. in Economics followed by an M.A.",
  "Market Research Analyst": "B.Com. or BBA with a focus on marketing.",
  "Financial Analyst": "B.Com., BBA, or B.Sc. in Finance.",
  "Investment Banker": "B.Com. with a strong foundation in finance.",
  "Sales Manager": "A degree in Business Management or Marketing.",
  "Entrepreneur": "BBA is a great course for this career.",
  "Management Consultant": "Start with a BBA and aim for a top MBA program.",
  "Data Analyst": "Degrees in Commerce, Economics, or Statistics are good.",
  "Auditor": "B.Com. is a good foundation before pursuing a professional certification.",
  "Tax Consultant": "B.Com. with a specialization in taxation.",
};

function QuizCommerce() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [careerPathScores, setCareerPathScores] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [mostLikelyCareer, setMostLikelyCareer] = useState("");

  const handleAnswerClick = (selectedOption) => {
    const answers = commerceQuestions[currentQuestionIndex].answers;
    const career = answers[selectedOption];

    setCareerPathScores(prevScores => ({
      ...prevScores,
      [career]: (prevScores[career] || 0) + 1
    }));

    const nextQuestionIndex = currentQuestionIndex + 1;
    if (nextQuestionIndex < commerceQuestions.length) {
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
        <h2>Commerce Quiz Complete!</h2>
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

  const currentQuestion = commerceQuestions[currentQuestionIndex];

  return (
    <div className="quiz-container">
      <h3>Question {currentQuestionIndex + 1} of {commerceQuestions.length}</h3>
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

export default QuizCommerce;