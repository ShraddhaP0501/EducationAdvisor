import React from "react";
import "../styles/Card.css";

function Card({ title, description, onClick }) {
    return (
        <div 
            className="card" 
            onClick={onClick} 
            style={{ cursor: onClick ? "pointer" : "default" }}
        >
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

export default Card;
