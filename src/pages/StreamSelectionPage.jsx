import React from 'react';
import { Link } from 'react-router-dom';

function StreamSelectionPage() {
    return (
        <div className="container">
            <h1>Select a Stream After 10th</h1>
            <div className="button-group">
                <Link to="/career/10th/science">
                    <button>Science</button>
                </Link>
                <Link to="/career/10th/commerce">
                    <button>Commerce</button>
                </Link>
                <Link to="/career/10th/arts">
                    <button>Arts</button>
                </Link>
            </div>
        </div>
    );
}

export default StreamSelectionPage; 