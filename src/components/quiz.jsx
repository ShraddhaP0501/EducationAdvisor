
import React, { useState } from "react";
import "../styles/quiz.css"; // ✅ CSS file

const questions = [
    {
        id: 1,
        text: "When solving a problem, do you prefer to:",
        options: [
            { label: "A", text: "Analyze data and look for patterns" },
            { label: "B", text: "Think creatively and come up with new ideas" },
            { label: "C", text: "Work with people and help solve their issues" },
            { label: "D", text: "Build or fix things using your hands" },
        ],
    },
    {
        id: 2,
        text: "Which subject do you enjoy the most at school?",
        options: [
            { label: "A", text: "Mathematics or Science" },
            { label: "B", text: "Literature or History" },
            { label: "C", text: "Psychology or Social Studies" },
            { label: "D", text: "Art, Design, or Technology" },
        ],
    },
    {
        id: 3,
        text: "What kind of tasks do you enjoy doing in your free time?",
        options: [
            { label: "A", text: "Solving puzzles or logical games" },
            { label: "B", text: "Writing stories or reading books" },
            { label: "C", text: "Volunteering or helping others" },
            { label: "D", text: "Working on DIY projects or gadgets" },
        ],
    },
    {
        id: 4,
        text: "Which environment do you see yourself working in?",
        options: [
            { label: "A", text: "In an office analyzing data or managing projects" },
            { label: "B", text: "In a creative studio or writing room" },
            { label: "C", text: "In a community center or counseling office" },
            { label: "D", text: "In a workshop, lab, or out in the field" },
        ],
    },
    {
        id: 5,
        text: "How do you prefer to learn new things?",
        options: [
            { label: "A", text: "Through detailed explanations and examples" },
            { label: "B", text: "By experimenting and trying things out" },
            { label: "C", text: "By discussing and collaborating with others" },
            { label: "D", text: "By watching videos or visual demonstrations" },
        ],
    },
    {
        id: 6,
        text: "When given a group project, you usually:",
        options: [
            { label: "A", text: "Organize and plan the tasks" },
            { label: "B", text: "Come up with creative ideas or designs" },
            { label: "C", text: "Mediate and keep the team motivated" },
            { label: "D", text: "Take charge of building or technical work" },
        ],
    },
    {
        id: 7,
        text: "What motivates you most in a career?",
        options: [
            { label: "A", text: "Solving complex problems and innovating" },
            { label: "B", text: "Expressing yourself and creating new things" },
            { label: "C", text: "Making a positive impact on people’s lives" },
            { label: "D", text: "Working with your hands and seeing tangible results" },
        ],
    },
    {
        id: 8,
        text: "If you had to pick a hobby, which would you choose?",
        options: [
            { label: "A", text: "Coding or building robots" },
            { label: "B", text: "Painting, writing, or music" },
            { label: "C", text: "Volunteering or mentoring" },
            { label: "D", text: "Fixing cars, electronics, or DIY crafts" },
        ],
    },
    {
        id: 9,
        text: "How comfortable are you with public speaking or leading others?",
        options: [
            { label: "A", text: "Very comfortable — I enjoy leading" },
            { label: "B", text: "Somewhat comfortable, depends on the situation" },
            { label: "C", text: "Not very comfortable, I prefer to work behind the scenes" },
            { label: "D", text: "Comfortable when working in small teams" },
        ],
    },
    {
        id: 10,
        text: "Which of these career goals sounds most appealing?",
        options: [
            { label: "A", text: "Becoming a data scientist, engineer, or IT professional" },
            { label: "B", text: "Becoming an author, artist, or media professional" },
            { label: "C", text: "Becoming a psychologist, teacher, or social worker" },
            { label: "D", text: "Becoming a mechanic, architect, or technician" },
        ],
    },
];
const careerRecommendations = {
    A: "You have strong analytical and technical skills. Careers in STEM fields like Engineering, Computer Science, Data Science, and IT would suit you well.",
    B: "You are creative and expressive. Careers in Arts, Writing, Media, Design, or Communication could be great fits.",
    C: "You are people-oriented and empathetic. Consider careers in Psychology, Social Work, Education, or Counseling.",
    D: "You enjoy practical, hands-on work. Careers in Trades, Architecture, Engineering Technology, or Mechanics might be perfect for you.",
};

export default function CareerQuiz() {
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState("");

    const handleChange = (questionId, optionLabel) => {
        setAnswers((prev) => ({ ...prev, [questionId]: optionLabel }));
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }

        const counts = { A: 0, B: 0, C: 0, D: 0 };
        Object.values(answers).forEach((answer) => {
            counts[answer]++;
        });

        let maxCount = 0;
        let maxLabel = null;
        for (const label in counts) {
            if (counts[label] > maxCount) {
                maxCount = counts[label];
                maxLabel = label;
            }
        }

        setResult(careerRecommendations[maxLabel]);
        setShowResult(true);
    };

    const handleRestart = () => {
        setAnswers({});
        setShowResult(false);
        setResult("");
    };

    return (
        <div className="quiz-container">
            <h2>Career Aptitude Quiz</h2>

            {!showResult && (
                <>
                    {questions.map(({ id, text, options }) => (
                        <div key={id} className="question">
                            <p>
                                <strong>
                                    {id}. {text}
                                </strong>
                            </p>
                            {options.map(({ label, text: optionText }) => (
                                <label key={label}>
                                    <input
                                        type="radio"
                                        name={`question-${id}`}
                                        value={label}
                                        checked={answers[id] === label}
                                        onChange={() => handleChange(id, label)}
                                    />
                                    <strong>{label}.</strong> {optionText}
                                </label>
                            ))}
                        </div>
                    ))}

                    <button onClick={handleSubmit}>Submit</button>
                </>
            )}

            {showResult && (
                <div className="result-section">
                    <h3>Your Recommended Career Path:</h3>
                    <p>{result}</p>
                    <button onClick={handleRestart}>Retake Quiz</button>
                </div>
            )}
        </div>
    );
}
