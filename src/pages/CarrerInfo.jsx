// src/pages/CareerInfo.jsx
import React, { useState } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const CareerInfo = () => {
  const [selectedCareer, setSelectedCareer] = useState(null);

  const careerDetails = {
    "Software Engineer": {
      description:
        "A Software Engineer designs, develops, tests, and maintains software applications. They work with programming languages, frameworks, and tools to build solutions.",
      skills: ["Programming", "Problem Solving", "Algorithms", "Version Control"],
      averageSalary: "₹6-12 LPA",
    },
    "Data Scientist": {
      description:
        "A Data Scientist analyzes large sets of data to derive actionable insights. They use statistics, machine learning, and visualization techniques to inform business decisions.",
      skills: ["Python/R", "Machine Learning", "Statistics", "Data Visualization"],
      averageSalary: "₹7-15 LPA",
    },
    "AI Engineer": {
      description:
        "An AI Engineer designs and implements AI models and algorithms to solve real-world problems. They work on neural networks, NLP, computer vision, and robotics.",
      skills: ["Python", "Deep Learning", "TensorFlow/PyTorch", "Mathematics"],
      averageSalary: "₹8-20 LPA",
    },
    "Cybersecurity Specialist": {
      description:
        "A Cybersecurity Specialist protects systems and networks from cyber threats. They monitor, prevent, and respond to security breaches.",
      skills: ["Network Security", "Ethical Hacking", "Risk Assessment", "Firewalls"],
      averageSalary: "₹5-12 LPA",
    },
  };

  const nodes = [
    {
      id: "1",
      data: { label: "Computer Science Engineering" },
      position: { x: 250, y: 50 },
      style: { background: "#7b5fff", color: "white", padding: 10, borderRadius: 10 },
    },
    {
      id: "2",
      data: { label: "Software Engineer" },
      position: { x: 50, y: 200 },
      style: { background: "#9b79ff", color: "white", padding: 10, borderRadius: 10 },
    },
    {
      id: "3",
      data: { label: "Data Scientist" },
      position: { x: 200, y: 200 },
      style: { background: "#9b79ff", color: "white", padding: 10, borderRadius: 10 },
    },
    {
      id: "4",
      data: { label: "AI Engineer" },
      position: { x: 350, y: 200 },
      style: { background: "#9b79ff", color: "white", padding: 10, borderRadius: 10 },
    },
    {
      id: "5",
      data: { label: "Cybersecurity Specialist" },
      position: { x: 500, y: 200 },
      style: { background: "#9b79ff", color: "white", padding: 10, borderRadius: 10 },
    },
  ];

  const edges = [
    { id: "e1-2", source: "1", target: "2", animated: true, style: { stroke: "#7b5fff", strokeDasharray: "5,5" } },
    { id: "e1-3", source: "1", target: "3", animated: true, style: { stroke: "#7b5fff", strokeDasharray: "5,5" } },
    { id: "e1-4", source: "1", target: "4", animated: true, style: { stroke: "#7b5fff", strokeDasharray: "5,5" } },
    { id: "e1-5", source: "1", target: "5", animated: true, style: { stroke: "#7b5fff", strokeDasharray: "5,5" } },
  ];

  const handleNodeClick = (event, node) => {
    if (careerDetails[node.data.label]) {
      setSelectedCareer(careerDetails[node.data.label]);
    } else {
      setSelectedCareer(null);
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick}>
        <Background />
        <Controls />
      </ReactFlow>

      {selectedCareer && (
        <div style={{ padding: "20px", backgroundColor: "#f5f5f5", marginTop: "20px" }}>
          <h2>{Object.keys(careerDetails).find((key) => careerDetails[key] === selectedCareer)}</h2>
          <p><strong>Description:</strong> {selectedCareer.description}</p>
          <p><strong>Skills Required:</strong> {selectedCareer.skills.join(", ")}</p>
          <p><strong>Average Salary:</strong> {selectedCareer.averageSalary}</p>
        </div>
      )}
    </div>
  );
};

export default CareerInfo;
