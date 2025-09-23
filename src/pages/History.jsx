import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/history.css";

const History = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/user-quiz-results", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          console.error("Failed to fetch history");
        }
      } catch (err) {
        console.error("Error fetching history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) return <p>Loading your quiz history...</p>;

  return (
    <div className="history-page">
      <h2>Your Quiz History</h2>

      {results.length > 0 ? (
        <ul>
          {results.map((res, index) => (
            <li key={index} className="history-item">
              <strong>{new Date(res.created_at).toLocaleString()}:</strong>{" "}
              {res.suggestion}
            </li>
          ))}
        </ul>
      ) : (
        <p>No quiz history available yet. Take the quiz to get started!</p>
      )}

      <button className="back-link" onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default History;
