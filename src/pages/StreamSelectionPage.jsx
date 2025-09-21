import React from 'react';
import { Link } from 'react-router-dom';

function StreamSelectionPage() {
    return (
        <div className="container">
            <h1>Select a Stream After 10th</h1>
            <div className="button-group">
                <Link to="/career/10th/science/chart">
                    <button>Science</button>
                </Link>
                <Link to="/career/10th/commerce/chart">
                    <button>Commerce</button>
                </Link>
                <Link to="/career/10th/arts/chart">
                    <button>Arts</button>
                </Link>
            </div>
        </div>
    );
}

export default StreamSelectionPage;
