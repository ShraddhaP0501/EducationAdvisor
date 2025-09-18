// src/components/QuizScience.jsx

import React, { useState } from "react";
import '../styles/quiz.css';

// 10 sample questions for the Science quiz
const scienceQuestions = [
    {
        questionText: "What is the study of the universe, stars, and galaxies called?",
        options: ["Geology", "Botany", "Astronomy", "Zoology"],
        answers: { "Astronomy": "Astrophysicist", "Geology": "Geologist", "Botany": "Botanist", "Zoology": "Zoologist" }
    },
    {
        questionText: "Which of the following is an example of a chemical change?",
        options: ["Melting ice", "Boiling water", "Rusting of iron", "Tearing a paper"],
        answers: { "Rusting of iron": "Chemical Engineer", "Melting ice": "Meteorologist", "Boiling water": "Physicist", "Tearing a paper": "None" }
    },
    {
        questionText: "What part of the cell is responsible for generating energy?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Cytoplasm"],
        answers: { "Mitochondria": "Biotechnologist", "Nucleus": "Geneticist", "Ribosome": "Molecular Biologist", "Cytoplasm": "Biochemist" }
    },
    {
        questionText: "Which field involves the design and construction of machines?",
        options: ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Software Engineering"],
        answers: { "Mechanical Engineering": "Mechanical Engineer", "Civil Engineering": "Civil Engineer", "Electrical Engineering": "Electrical Engineer", "Software Engineering": "Software Engineer" }
    },
    {
        questionText: "What subject is essential for understanding algorithms and computer systems?",
        options: ["Biology", "Mathematics", "Physics", "Chemistry"],
        answers: { "Mathematics": "Data Scientist", "Physics": "Physicist", "Biology": "Biologist", "Chemistry": "Chemist" }
    },
    {
        questionText: "If you enjoy lab work and experiments, which career path is a good fit?",
        options: ["Doctor", "Research Scientist", "Engineer", "Architect"],
        answers: { "Research Scientist": "Research Scientist", "Doctor": "Doctor", "Engineer": "Engineer", "Architect": "Architect" }
    },
    {
        questionText: "Which career path focuses on developing new drugs and treatments?",
        options: ["Dentist", "Pharmacist", "Vet", "Physiotherapist"],
        answers: { "Pharmacist": "Pharmacist", "Dentist": "Dentist", "Vet": "Veterinarian", "Physiotherapist": "Physiotherapist" }
    },
    {
        questionText: "What is the primary focus of environmental science?",
        options: ["Study of plants", "Study of human behavior", "Protection of the environment", "Designing buildings"],
        answers: { "Protection of the environment": "Environmental Scientist", "Study of plants": "Botanist", "Study of human behavior": "Psychologist", "Designing buildings": "Architect" }
    },
    {
        questionText: "Which career involves applying mathematical models to financial problems?",
        options: ["Economist", "Accountant", "Actuary", "Stockbroker"],
        answers: { "Actuary": "Actuary", "Economist": "Economist", "Accountant": "Accountant", "Stockbroker": "Stockbroker" }
    },
    {
        questionText: "If you are interested in a career in medicine, which course is the most common path?",
        options: ["BDS", "BAMS", "MBBS", "B.Sc. Nursing"],
        answers: { "MBBS": "Doctor", "BDS": "Dentist", "BAMS": "Ayurvedic Doctor", "B.Sc. Nursing": "Nurse" }
    }
];

// Simplified guidance for clarity
const courseGuidance = {
    "Astrophysicist": "Consider a B.Sc. in Physics followed by a Master's.",
    "Geologist": "B.Sc. in Geology is the primary route.",
    "Botanist": "Pursue a B.Sc. in Botany.",
    "Zoologist": "A B.Sc. in Zoology is the right choice.",
    "Chemical Engineer": "B.Tech. in Chemical Engineering.",
    "Biotechnologist": "B.Sc. or B.Tech. in Biotechnology.",
    "Mechanical Engineer": "B.E. or B.Tech. in Mechanical Engineering.",
    "Software Engineer": "B.Tech. in Computer Science or Software Engineering.",
    "Data Scientist": "A B.Sc. in Mathematics or Computer Science is a great start.",
    "Research Scientist": "B.Sc., M.Sc., and Ph.D. are typical for this path.",
    "Doctor": "MBBS is the most common path to becoming a doctor.",
    "Pharmacist": "A B. Pharm. degree is required.",
    "Environmental Scientist": "B.Sc. in Environmental Science.",
    "Actuary": "Pursue a B.Sc. in Statistics or Mathematics.",
    "Architect": "B.Arch is the course for this career.",
};

function QuizScience() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [careerPathScores, setCareerPathScores] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [mostLikelyCareer, setMostLikelyCareer] = useState("");

    const handleAnswerClick = (selectedOption) => {
        const answers = scienceQuestions[currentQuestionIndex].answers;
        const career = answers[selectedOption];

        setCareerPathScores(prevScores => ({
            ...prevScores,
            [career]: (prevScores[career] || 0) + 1
        }));

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < scienceQuestions.length) {
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
                <h2>Science Quiz Complete!</h2>
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

    const currentQuestion = scienceQuestions[currentQuestionIndex];

    return (
        <div className="quiz-container">
            <h3>Question {currentQuestionIndex + 1} of {scienceQuestions.length}</h3>
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

export default QuizScience;