import React, { useState } from "react";
import '../styles/Quiz.css'; // Make sure your CSS file exists

const quizQuestions = [
    { questionText: "What subjects do you enjoy the most?", options: ["Maths and Science", "Business and Finance", "History and Literature"] },
    { questionText: "Which of these activities sounds most appealing to you?", options: ["Conducting experiments and building models", "Managing a small business or planning an event", "Writing stories, painting, or debating"] },
    { questionText: "Which career sounds more interesting to you?", options: ["Doctor, Engineer, or Scientist", "Accountant, Banker, or Entrepreneur", "Lawyer, Journalist, or Designer"] },
    { questionText: "When you read the newspaper, what section do you turn to first?", options: ["Technology and Innovation", "Business and Stock Market", "Politics and Culture"] },
    { questionText: "How do you like to solve problems?", options: ["By using logical and scientific methods", "By analyzing data and financial information", "By thinking creatively and understanding people"] },
    { questionText: "Which skill is your strength?", options: ["Mathematical and analytical skills", "Organizational and management skills", "Communication and critical thinking skills"] },
    { questionText: "If you had a free afternoon, what would you prefer to do?", options: ["Watch a documentary about space", "Read about investment strategies", "Visit an art museum or historical site"] },
    { questionText: "What do you want to learn more about?", options: ["How the universe works", "How the economy works", "How society and cultures work"] },
    { questionText: "In a group project, what role do you usually take?", options: ["The researcher who finds facts and figures", "The planner who manages resources and deadlines", "The creative lead who comes up with new ideas"] },
    { questionText: "Which academic discipline are you most curious about?", options: ["Physics and Chemistry", "Economics and Accountancy", "Sociology and Political Science"] }
];

function Quiz10th() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAnswerClick = (selectedOption) => {
        setSelectedAnswers(prev => [
            ...prev,
            { question: quizQuestions[currentQuestionIndex].questionText, answer: selectedOption }
        ]);

        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < quizQuestions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setShowResults(true);
            getAIRecommendation([...selectedAnswers, { question: quizQuestions[currentQuestionIndex].questionText, answer: selectedOption }]);
        }
    };

    const getAIRecommendation = async (answers) => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch("http://localhost:5001/api/getAIRecommendation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers })
            });

            if (!response.ok) {
                throw new Error("Server error while fetching AI recommendation.");
            }

            const data = await response.json();
            setAiRecommendation(data.recommendation || "No recommendation received.");
        } catch (err) {
            console.error(err);
            setError("Failed to fetch AI recommendation. Please try again later.");
        }
        setLoading(false);
    };

    if (showResults) {
        return (
            <div className="results-container">
                <h2>Your AI-Based Recommended Stream</h2>
                {loading ? (
                    <div className="spinner"></div>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <p>{aiRecommendation}</p>
                )}
                <p className="note">This is a guide. Always research all options and consult with your parents and teachers before making a final decision.</p>
            </div>
        );
    }

    const currentQuestion = quizQuestions[currentQuestionIndex];

    return (
        <div className="quiz-container">
            <h3>Question {currentQuestionIndex + 1} of {quizQuestions.length}</h3>
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

export default Quiz10th;
