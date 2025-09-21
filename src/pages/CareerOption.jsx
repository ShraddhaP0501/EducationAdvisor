import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/CareerOption.css";

function CareerOptions() {
    const options = [
        {
            title: "After 10th",
            description: "Choose a stream (Science, Commerce, Arts) and explore courses with job opportunities.",
            path: "/career/10th",
        },
        {
            title: "After 12th",
            description: "Select your field and discover undergraduate courses and careers.",
            path: "/career/10th",
        },
        {
            title: "After Graduation",
            description: "Explore postgraduate programs and advanced career opportunities.",
            path: "/career/10th",
        },
    ];

    return (
        <div className="career-container">
            <h1>Explore Careers</h1>
            <p>Select your highest completed level of education to begin.</p>

            <div className="career-grid">
                {options.map((option, index) => (
                    <Link to={option.path} key={index} className="career-card-link">
                        <div className="career-card">
                            <h2>{option.title}</h2>
                            <p>{option.description}</p>
                            <button>Explore</button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default CareerOptions;
