// src/pages/StreamFlowChartPage.jsx
import React, { useCallback, useState } from "react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import dagre from "dagre";
import { useNavigate } from "react-router-dom";

// DAGRE layout
const nodeWidth = 180;
const nodeHeight = 60;

const getLayoutedElements = (nodes, edges, direction = "LR") => {
    const isHorizontal = direction === "LR";
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 50 });

    nodes.forEach((node) => dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight }));
    edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? "left" : "top";
        node.sourcePosition = isHorizontal ? "right" : "bottom";
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };
    });

    return { nodes, edges };
};

// STREAM → SUBSTREAM → COURSES → JOBS DATA
const streamsData = {
    Science: {
        Maths: {
            "B.Tech": ["Software Engineer", "AI Engineer"],
            "B.Arch": ["Architect", "Urban Planner"],
        },
        Biology: {
            MBBS: ["Doctor", "Surgeon"],
            BDS: ["Dentist", "Dental Surgeon"],
        },
    },
    Commerce: {
        "B.Com": ["Accountant", "Financial Analyst"],
        BBA: ["Business Analyst", "HR Manager"],
    },
    Arts: {
        BA: ["Teacher", "Content Writer"],
        BFA: ["Artist", "Designer"],
    },
};

// Function to generate nodes & edges for a selected stream
const generateFlowForStream = (streamName) => {
    let nodes = [];
    let edges = [];
    let id = 1;

    const streamId = `stream-${id++}`;
    nodes.push({
        id: streamId,
        data: { label: streamName },
        position: { x: 0, y: 0 },
        style: { background: "#90cdf4", padding: 10, borderRadius: 8 },
    });

    const streamData = streamsData[streamName];

    // If Science, it has substreams (Maths, Biology)
    if (streamName === "Science") {
        Object.entries(streamData).forEach(([substream, courses]) => {
            const substreamId = `sub-${id++}`;
            nodes.push({
                id: substreamId,
                data: { label: substream },
                position: { x: 0, y: 0 },
                style: { background: "#63b3ed", padding: 10, borderRadius: 8 },
            });
            edges.push({ id: `edge-${streamId}-${substreamId}`, source: streamId, target: substreamId });

            Object.entries(courses).forEach(([course, jobs]) => {
                const courseId = `course-${id++}`;
                nodes.push({
                    id: courseId,
                    data: { label: course },
                    position: { x: 0, y: 0 },
                    style: { background: "#fbd38d", padding: 10, borderRadius: 8 },
                });
                edges.push({ id: `edge-${substreamId}-${courseId}`, source: substreamId, target: courseId });

                jobs.forEach((job) => {
                    const jobId = `job-${id++}`;
                    nodes.push({
                        id: jobId,
                        data: { label: job },
                        position: { x: 0, y: 0 },
                        style: { background: "#9ae6b4", padding: 10, borderRadius: 8 },
                    });
                    edges.push({ id: `edge-${courseId}-${jobId}`, source: courseId, target: jobId });
                });
            });
        });
    } else {
        // Other streams without substreams
        Object.entries(streamData).forEach(([course, jobs]) => {
            const courseId = `course-${id++}`;
            nodes.push({
                id: courseId,
                data: { label: course },
                position: { x: 0, y: 0 },
                style: { background: "#fbd38d", padding: 10, borderRadius: 8 },
            });
            edges.push({ id: `edge-${streamId}-${courseId}`, source: streamId, target: courseId });

            if (Array.isArray(jobs)) {
                jobs.forEach((job) => {
                    const jobId = `job-${id++}`;
                    nodes.push({
                        id: jobId,
                        data: { label: job },
                        position: { x: 0, y: 0 },
                        style: { background: "#9ae6b4", padding: 10, borderRadius: 8 },
                    });
                    edges.push({ id: `edge-${courseId}-${jobId}`, source: courseId, target: jobId });
                });
            }
        });
    }

    return getLayoutedElements(nodes, edges, "LR");
};

export default function StreamFlowChartPage() {
    const navigate = useNavigate();
    const [selectedStream, setSelectedStream] = useState("Science");

    const { nodes: initialNodes, edges: initialEdges } = generateFlowForStream(selectedStream);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

    const handleStreamChange = (stream) => {
        const { nodes: newNodes, edges: newEdges } = generateFlowForStream(stream);
        setNodes(newNodes);
        setEdges(newEdges);
        setSelectedStream(stream);
    };

    return (
        <div style={{ height: "100vh", width: "100%" }}>
            <div style={{ position: "absolute", zIndex: 10, margin: 10 }}>
                <button
                    onClick={() => navigate("/career")}
                    style={{
                        marginRight: 10,
                        padding: "8px 16px",
                        background: "#3182ce",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                    }}
                >
                    ← Back to Career
                </button>

                {Object.keys(streamsData).map((stream) => (
                    <button
                        key={stream}
                        onClick={() => handleStreamChange(stream)}
                        style={{
                            marginRight: 5,
                            padding: "6px 12px",
                            background: selectedStream === stream ? "#2b6cb0" : "#63b3ed",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                        }}
                    >
                        {stream}
                    </button>
                ))}
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                minZoom={0.1}
                maxZoom={2}
            >
                <MiniMap nodeStrokeColor={(n) => n.style?.background || "#eee"} />
                <Controls />
                <Background />
            </ReactFlow>
        </div>
    );
}
