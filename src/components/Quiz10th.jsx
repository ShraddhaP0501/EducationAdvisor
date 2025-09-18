import React, { useState } from "react";
import '../styles/quiz.css'; // Make sure you have a CSS file for styling

const quizQuestions = [
    {
        questionText: "What subjects do you enjoy the most?",
        options: ["Maths and Science", "Business and Finance", "History and Literature"],
        answers: { "Maths and Science": "Science", "Business and Finance": "Commerce", "History and Literature": "Arts" }
    },
    {// want to get AI based recommendations after the submission of this quiz to what i terests studemnts have 
        questionText: "Which of these activities sounds most appealing to you?",
        options: ["Conducting experiments and building models", "Managing a small business or planning an event", "Writing stories, painting, or debating"],
        answers: { "Conducting experiments and building models": "Science", "Managing a small business or planning an event": "Commerce", "Writing stories, painting, or debating": "Arts" }
    },
    {
        questionText: "Which career sounds more interesting to you?",
        options: ["Doctor, Engineer, or Scientist", "Accountant, Banker, or Entrepreneur", "Lawyer, Journalist, or Designer"],
        answers: { "Doctor, Engineer, or Scientist": "Science", "Accountant, Banker, or Entrepreneur": "Commerce", "Lawyer, Journalist, or Designer": "Arts" }
    },
    {
        questionText: "When you read the newspaper, what section do you turn to first?",
        options: ["Technology and Innovation", "Business and Stock Market", "Politics and Culture"],
        answers: { "Technology and Innovation": "Science", "Business and Stock Market": "Commerce", "Politics and Culture": "Arts" }
    },
    {
        questionText: "How do you like to solve problems?",
        options: ["By using logical and scientific methods", "By analyzing data and financial information", "By thinking creatively and understanding people"],
        answers: { "By using logical and scientific methods": "Science", "By analyzing data and financial information": "Commerce", "By thinking creatively and understanding people": "Arts" }
    },
    {
        questionText: "Which skill is your strength?",
        options: ["Mathematical and analytical skills", "Organizational and management skills", "Communication and critical thinking skills"],
        answers: { "Mathematical and analytical skills": "Science", "Organizational and management skills": "Commerce", "Communication and critical thinking skills": "Arts" }
    },
    {
        questionText: "If you had a free afternoon, what would you prefer to do?",
        options: ["Watch a documentary about space", "Read about investment strategies", "Visit an art museum or historical site"],
        answers: { "Watch a documentary about space": "Science", "Read about investment strategies": "Commerce", "Visit an art museum or historical site": "Arts" }
    },
    {
        questionText: "What do you want to learn more about?",
        options: ["How the universe works", "How the economy works", "How society and cultures work"],
        answers: { "How the universe works": "Science", "How the economy works": "Commerce", "How society and cultures work": "Arts" }
    },
    {
        questionText: "In a group project, what role do you usually take?",
        options: ["The researcher who finds facts and figures", "The planner who manages resources and deadlines", "The creative lead who comes up with new ideas"],
        answers: { "The researcher who finds facts and figures": "Science", "The planner who manages resources and deadlines": "Commerce", "The creative lead who comes up with new ideas": "Arts" }
    },
    {
        questionText: "Which academic discipline are you most curious about?",
        options: ["Physics and Chemistry", "Economics and Accountancy", "Sociology and Political Science"],
        answers: { "Physics and Chemistry": "Science", "Economics and Accountancy": "Commerce", "Sociology and Political Science": "Arts" }
    },
];

const guidance = {
    "Science": {
        heading: "Science Stream",
        text: "The **Science** stream is ideal for students with an interest in technology, medicine, and research. It focuses on subjects like Physics, Chemistry, Biology, and Mathematics. This stream opens doors to careers like engineering, medicine, and data science. If you enjoy logical problem-solving and are curious about how the natural world works, this is a great choice."
    },
    "Commerce": {
        heading: "Commerce Stream",
        text: "The **Commerce** stream is a great choice for students who are good with numbers, analysis, and management. It focuses on subjects like Accountancy, Business Studies, and Economics. This stream is a stepping stone to careers in finance, banking, business management, and entrepreneurship. If you are a logical thinker and enjoy understanding markets and businesses, this stream is for you."
    },
    "Arts": {
        heading: "Arts Stream",
        text: "The **Arts** stream is perfect for creative, analytical, and communicative individuals. It includes subjects like History, Political Science, Psychology, and Literature. This stream leads to diverse careers in law, media, civil services, and design. If you enjoy critical thinking, debating ideas, and understanding human behavior and culture, the Arts stream could be your best fit."
    }
};

function Quiz10th() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [streamScores, setStreamScores] = useState({ Science: 0, Commerce: 0, Arts: 0 });
    const [showResults, setShowResults] = useState(false);
    const [recommendedStream, setRecommendedStream] = useState("");

    const handleAnswerClick = (selectedOption) => {
        const answers = quizQuestions[currentQuestionIndex].answers;
        const stream = answers[selectedOption];

        setStreamScores(prevScores => ({
            ...prevScores,
            [stream]: (prevScores[stream] || 0) + 1
        }));

        const nextQuestionIndex = currentQuestionIndex + 1;
        if (nextQuestionIndex < quizQuestions.length) {
            setCurrentQuestionIndex(nextQuestionIndex);
        } else {
            setShowResults(true);
            calculateResult();
        }
    };

    const calculateResult = () => {
        let bestStream = "";
        let highestScore = 0;
        for (const stream in streamScores) {
            if (streamScores[stream] > highestScore) {
                highestScore = streamScores[stream];
                bestStream = stream;
            }
        }
        setRecommendedStream(bestStream);
    };

    if (showResults) {
        const result = guidance[recommendedStream] || { heading: "Undetermined", text: "We could not determine a single recommendation based on your answers. This means you might have interests across multiple streams. We recommend exploring all three streams and consulting with a teacher or career counselor." };

        return (
            <div className="results-container">
                <h2>Your Recommended Stream</h2>
                <h3>{result.heading}</h3>
                <p>{result.text}</p>
                <p className="note">This is a general guide. It's always a good idea to research all options and talk to your parents and teachers before making a final decision.</p>

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