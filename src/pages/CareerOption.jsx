import React from 'react';
import { Link } from 'react-router-dom';

function CareerOptions() {
    return (
        <div className="container">
            <h1>Explore Careers</h1>
            <p>Select your highest completed level of education to begin.</p>
            <Link to="/career/10th">
                <button>After 10th</button>
            </Link>
        </div>
    );
}

export default CareerOptions;