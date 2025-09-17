import React, { useState, useCallback } from "react";
import ReactFlow, { Background, Controls } from "reactflow";
import "reactflow/dist/style.css";

const engineeringCourses = {
  "Computer Science Engineering": ["Software Engineer", "Data Scientist", "AI Engineer", "Cybersecurity Specialist"],
  "Mechanical Engineering": ["Automobile Engineer", "Robotics Engineer", "Design Engineer", "Production Engineer"],
  "Civil Engineering": ["Structural Engineer", "Construction Manager", "Urban Planner", "Site Engineer"],
  "Electrical Engineering": ["Power Engineer", "Electronics Engineer", "Control Systems Engineer", "Telecommunications Engineer"],
  "Electronics & Communication Engineering": ["Embedded Systems Engineer", "VLSI Engineer", "Signal Processing Engineer", "Network Engineer"],
};

function CareerPage() {
  const [selectedCourse, setSelectedCourse] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const handleSelect = useCallback((e) => {
    const course = e.target.value;
    setSelectedCourse(course);

    if (!course || !engineeringCourses[course]) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes = [
      {
        id: "course",
        position: { x: 250, y: 0 },
        data: { label: course },
        type: "input",
        style: {
          fontSize: 20,
          fontWeight: "bold",
          padding: 15,
          backgroundColor: "#7E57C2",
          color: "#FFFFFF",
          borderRadius: "10px",
        },
      },
      ...engineeringCourses[course].map((career, i) => ({
        id: `career-${i}`,
        position: { x: 150 + i * 150, y: 150 },
        data: { label: career },
        style: {
          fontSize: 16,
          padding: 12,
          backgroundColor: "#9575CD",
          color: "#FFFFFF",
          borderRadius: "8px",
        },
      })),
    ];

    const newEdges = engineeringCourses[course].map((_, i) => ({
      id: `edge-${i}`,
      source: "course",
      target: `career-${i}`,
      animated: true,
      style: { stroke: "#673AB7" },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5", padding: "3rem" }}>
      <h3 style={{ color: "#673AB7", fontSize: "1.8rem", fontWeight: "bold", marginBottom: "1.5rem" }}>
       <u> Engineering Course → Career Mapping</u>
      </h3>

      <select
        value={selectedCourse}
        onChange={handleSelect}
        style={{
          padding: "14px",
          fontSize: "18px",
          borderRadius: "8px",
          border: "1px solid #673AB7",
          backgroundColor: "#FFFFFF",
          color: "#212121",
          width: "100%",
          maxWidth: "500px",
          marginBottom: "2rem",
        }}
      >
        <option value="">-- Select an Engineering Branch --</option>
        {Object.keys(engineeringCourses).map((course, idx) => (
          <option key={idx} value={course}>
            {course}
          </option>
        ))}
      </select>

      <div style={{ height: "600px", border: "1px solid #673AB7", borderRadius: "12px", backgroundColor: "#FFFFFF" }}>
        {nodes.length > 0 ? (
          <ReactFlow
            key={selectedCourse}
            nodes={nodes}
            edges={edges}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
          >
            <Background />
            <Controls />
          </ReactFlow>
        ) : (
          <div style={{ padding: "2rem", textAlign: "center", color: "#616161", fontSize: "1.2rem" }}>
            Please select a course to view the career mapping.
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerPage;
