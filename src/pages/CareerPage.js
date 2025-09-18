// src/pages/CareerPage.js
import React, { useState, useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactFlow, { Background, Controls } from "reactflow";

import "../styles/CareerPage.css";

/*
  Notes:
  - This page reads `location.state?.tier` (from LandingPage) and uses it to pre-select the tier.
  - Put your images in public/images/careers/... and update the img paths in streamOptions below.
  - Engineering mapping uses ReactFlow (kept from your original code).
*/

/* --- Engineering branches mapping (kept from your original file) --- */
const engineeringCourses = {
  "Computer Science Engineering": ["Software Engineer", "Data Scientist", "AI Engineer", "Cybersecurity Specialist"],
  "Mechanical Engineering": ["Automobile Engineer", "Robotics Engineer", "Design Engineer", "Production Engineer"],
  "Civil Engineering": ["Structural Engineer", "Construction Manager", "Urban Planner", "Site Engineer"],
  "Electrical Engineering": ["Power Engineer", "Electronics Engineer", "Control Systems Engineer", "Telecommunications Engineer"],
  "Electronics & Communication Engineering": ["Embedded Systems Engineer", "VLSI Engineer", "Signal Processing Engineer", "Network Engineer"],
};

/* --- Career details mapping (add more entries as you like) --- */
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
  "Structural Engineer": {
    description: "Design and analyze structures like buildings and bridges to ensure safety and stability.",
    skills: ["Statics", "AutoCAD", "Design Codes", "MATLAB"],
    averageSalary: "₹4-10 LPA",
  },
  // Add other careerDetails entries for the roles used in streamOptions below
};

/* --- Non-engineering stream options (images referenced from public/images/careers/) --- */
const streamOptions = {
  // after12 shows broader degree-based paths
  after12: {
    Science: [
      { id: "eng", title: "Engineering (B.Tech)", img: "image1.jpeg", desc: "Core engineering degrees (CSE, ECE, ME, CE)." },
      { id: "medical", title: "Medical / Nursing", img: "/images/careers/medical.png", desc: "Medicine, dentistry, nursing and allied health." },
      { id: "pure_science", title: "Pure Sciences (BSc)", img: "/images/careers/bsc.png", desc: "Degrees in Physics, Chemistry, Maths, Biology." },
    ],
    Commerce: [
      { id: "bcom", title: "B.Com / BBA", img: "bcombba.png", desc: "Commerce & business administration degrees." },
      { id: "ca", title: "Chartered Accountant (CA)", img: "ca.png", desc: "Professional accounting qualification." },
      { id: "banking", title: "Banking & Finance", img: "banking.png", desc: "Careers in banking, finance, and audits." },
    ],
    Arts: [
      { id: "ba", title: "Bachelor of Arts (BA)", img: "ba.png", desc: "Humanities, social sciences, languages." },
      { id: "design", title: "Design & Creative Arts", img: "arts.png", desc: "Fashion, graphic, product & UI/UX design." },
      { id: "law", title: "Integrated Law (5-year)", img: "law.png", desc: "Law degrees and legal careers." },
    ],
  },

  // after10 shows vocational / diploma options
  after10: {
    Vocational: [
      { id: "iti", title: "ITI / Trade", img: "ititrade.png", desc: "Industrial Training Institutes — skilled trades." },
      { id: "poly", title: "Polytechnic Diploma", img: "polytecnic.png", desc: "3-year engineering diplomas." },
      { id: "voc_cert", title: "Vocational Certificates", img: "vocational.png", desc: "Short-term skill courses & certifications." },
    ],
  },
};

function CareerPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Read tier passed from LandingPage; default to after12
  const initialTier = location.state?.tier || "after12";
  const [tier, setTier] = useState(initialTier);

  // State for generic (non-engineering) stream/course selection
  const [selectedStream, setSelectedStream] = useState("");
  // For engineering mapping
  const [selectedEngineeringBranch, setSelectedEngineeringBranch] = useState("");
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  // Selected career details to show in the info pane
  const [selectedCareer, setSelectedCareer] = useState(null);

  // When tier changes, reset selections and flows
  useEffect(() => {
    setSelectedStream("");
    setSelectedEngineeringBranch("");
    setNodes([]);
    setEdges([]);
    setSelectedCareer(null);
  }, [tier]);

  /* ---------- Engineering ReactFlow builder (kept/adapted from your original code) ---------- */
  const buildEngineeringFlow = useCallback((branch) => {
    if (!branch || !engineeringCourses[branch]) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const careerList = engineeringCourses[branch];

    const newNodes = [
      {
        id: "course",
        position: { x: 250, y: 0 },
        data: { label: branch },
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
      ...careerList.map((career, i) => ({
        id: `career-${i}`,
        position: { x: 150 + i * 150, y: 150 },
        data: { label: career },
        style: {
          fontSize: 16,
          padding: 12,
          backgroundColor: "#9575CD",
          color: "#FFFFFF",
          borderRadius: "8px",
          cursor: "pointer",
        },
      })),
    ];

    const newEdges = careerList.map((_, i) => ({
      id: `edge-${i}`,
      source: "course",
      target: `career-${i}`,
      animated: true,
      style: { stroke: "#673AB7" },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, []);

  // Handler for engineering branch selection
  const handleEngineeringSelect = useCallback(
    (e) => {
      const branch = e.target.value;
      setSelectedEngineeringBranch(branch);
      setSelectedCareer(null);
      buildEngineeringFlow(branch);
    },
    [buildEngineeringFlow]
  );

  // Handle node click to show career info (works for ReactFlow nodes)
  const handleNodeClick = (_event, node) => {
    const name = node?.data?.label;
    if (!name) return;
    if (careerDetails[name]) {
      setSelectedCareer({ name, ...careerDetails[name] });
    } else {
      // If you want, you can add generic descriptions for nodes not in careerDetails
      setSelectedCareer({ name, description: "Description coming soon.", skills: [], averageSalary: "N/A" });
    }
  };

  /* ---------- Non-engineering stream handling ---------- */
  // selectedStream is like "Science", "Commerce", "Arts" for after12
  const handleStreamSelect = (stream) => {
    setSelectedStream(stream);
    setSelectedCareer(null);
    // Clear engineering selections
    setSelectedEngineeringBranch("");
    setNodes([]);
    setEdges([]);
  };

  // When user clicks a career card in non-engineering streams, show details (if present)
  const handleCareerCardClick = (career) => {
    const details = careerDetails[career.title] || null;
    if (details) setSelectedCareer({ name: career.title, ...details });
    else setSelectedCareer({ name: career.title, description: career.desc, skills: [], averageSalary: "N/A" });
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5", padding: "2.5rem" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <button onClick={() => navigate(-1)} style={{ padding: "8px 12px", borderRadius: 8 }}>← Back</button>
        <h1 style={{ color: "#673AB7", fontSize: "2.2rem", margin: 0 }}>Course → Career Mapping</h1>
      </div>

      {/* Tier selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <button
          onClick={() => setTier("after10")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: tier === "after10" ? "#673AB7" : "#fff",
            color: tier === "after10" ? "#fff" : "#111",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Career after 10th
        </button>

        <button
          onClick={() => setTier("after12")}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: tier === "after12" ? "#673AB7" : "#fff",
            color: tier === "after12" ? "#fff" : "#111",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Career after 12th
        </button>
      </div>

      {/* Main content area: left panel (visual / grid) and right panel (details) */}
      {/* For after10, stack vertically; for after12, keep grid */}
      <div style={tier === "after10" || tier === "after12"
        ? { display: 'block' }
        : { display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }
      }>
        <div style={tier === "after10" || tier === "after12" ? { width: '100%' } : {}}>
          {/* If tier is after12: show stream selection (Science/Commerce/Arts) and content */}
          {tier === "after12" && (
            <>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button onClick={() => handleStreamSelect("Science")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #8b5858ff", background: selectedStream === "Science" ? "#c19bffff" : "#673AB7" }}>Science</button>
                <button onClick={() => handleStreamSelect("Commerce")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: selectedStream === "Commerce" ? "#c19bffff" : "#673AB7" }}>Commerce</button>
                <button onClick={() => handleStreamSelect("Arts")} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc", background: selectedStream === "Arts" ? "#c19bffff" : "#673AB7" }}>Arts</button>
              </div>

              {!selectedStream && <div style={{ color: "#616161", padding: 16, borderRadius: 8, background: "#fff" }}>Choose a stream above to view career options after 12th.</div>}

              {selectedStream && selectedStream !== "Science" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                  {streamOptions.after12[selectedStream].map((career) => (
                    <div
                      key={career.id}
                      className="career-card"
                      onClick={() => handleCareerCardClick(career)}
                      style={{ padding: 12, borderRadius: 10, background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", cursor: "pointer" }}
                    >
                      <img src={career.img} alt={career.title} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} loading="lazy" />
                      <h4 style={{ marginTop: 8 }}>{career.title}</h4>
                      <p style={{ color: "#6b7280" }}>{career.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* For Science: provide Engineering dropdown that shows the ReactFlow mapping */}
              {selectedStream === "Science" && (
                <>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: "block", marginBottom: 6 }}>If you chose Science, pick a specialization:</label>
                    <select
                      value={selectedEngineeringBranch}
                      onChange={handleEngineeringSelect}
                      style={{
                        padding: "12px",
                        fontSize: 16,
                        borderRadius: 8,
                        border: "1px solid #673AB7",
                        width: "100%",
                        maxWidth: 520,
                        background: "#fff",
                      }}
                    >
                      <option value="">-- Select a specialization --</option>
                      {Object.keys(engineeringCourses).map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ height: "520px", border: "1px solid #673AB7", borderRadius: 12, background: "#fff" }}>
                    {nodes.length > 0 ? (
                      <ReactFlow
                        key={selectedEngineeringBranch}
                        nodes={nodes}
                        edges={edges}
                        fitView
                        nodesDraggable={false}
                        nodesConnectable={false}
                        onNodeClick={handleNodeClick}
                      >
                        <Background />
                        <Controls />
                      </ReactFlow>
                    ) : (
                      <div style={{ padding: 24, color: "#616161" }}>
                        Select an engineering specialization above to see career mapping.
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* If tier is after10: show vocational / diploma cards */}
          {tier === "after10" && (
            <>
              <h3 style={{ marginTop: 0, textAlign: 'center', color: '#673AB7', fontSize: '2rem', marginBottom: '10px' }}>Career options after 10th</h3>
              <div style={{ display: "flex", flexDirection: "row", gap: 24, justifyContent: "center", width: '100%' }}>
                {streamOptions.after10.Vocational.map((career) => (
                  <div
                    key={career.id}
                    onClick={() => handleCareerCardClick(career)}
                    style={{ flex: 1, minWidth: 320, maxWidth: 480, padding: 16, borderRadius: 12, background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", cursor: "pointer", display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                  >
                    <img src={career.img} alt={career.title} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 10 }} loading="lazy" />
                    <h4 style={{ marginTop: 16, fontSize: '1.3rem', fontWeight: 600, textAlign: 'center' }}>{career.title}</h4>
                    <p style={{ color: "#6b7280", textAlign: 'center', fontSize: '1.1rem' }}>{career.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Details panel: below for after10, right for after12 */}
        {tier === "after10" && (
          <div style={{ margin: '32px auto 0 auto', maxWidth: 700, width: '100%' }}>
            <div style={{ padding: 20, borderRadius: 12, background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", width: '100%' }}>
              <h4 style={{ marginTop: 0, color: "#673AB7", textAlign: 'center' }}>Details</h4>
              {!selectedCareer && (
                <div style={{ color: "#616161", textAlign: 'center' }}>
                  Click a career node or card to view details here.
                </div>
              )}
              {selectedCareer && (
                <>
                  <h3 style={{ margin: "6px 0", textAlign: 'center' }}>{selectedCareer.name}</h3>
                  <p style={{ margin: "8px 0" }}><strong>Description:</strong> {selectedCareer.description}</p>
                  {selectedCareer.skills && selectedCareer.skills.length > 0 && (
                    <p style={{ margin: "8px 0" }}><strong>Skills:</strong> {selectedCareer.skills.join(", ")}</p>
                  )}
                  <p style={{ margin: "8px 0" }}><strong>Average Salary:</strong> {selectedCareer.averageSalary}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        navigate("/course-select", { state: { careerName: selectedCareer.name, tier } });
                      }}
                      style={{ padding: "8px 12px", background: "#673AB7", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" }}
                    >
                      Select this pathway
                    </button>
                    <button
                      onClick={() => alert("More resources coming soon.")}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "#fff", border: "1px solid #ccc", cursor: "pointer" }}
                    >
                      Learn more
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {tier === "after12" && (
          <div style={{ margin: '32px auto 0 auto', maxWidth: 700, width: '100%' }}>
            <div style={{ padding: 20, borderRadius: 12, background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", width: '100%' }}>
              <h4 style={{ marginTop: 0, color: "#673AB7", textAlign: 'center' }}>Details</h4>
              {!selectedCareer && (
                <div style={{ color: "#616161", textAlign: 'center' }}>
                  Click a career node or card to view details here.
                </div>
              )}
              {selectedCareer && (
                <>
                  <h3 style={{ margin: "6px 0", textAlign: 'center' }}>{selectedCareer.name}</h3>
                  <p style={{ margin: "8px 0" }}><strong>Description:</strong> {selectedCareer.description}</p>
                  {selectedCareer.skills && selectedCareer.skills.length > 0 && (
                    <p style={{ margin: "8px 0" }}><strong>Skills:</strong> {selectedCareer.skills.join(", ")}</p>
                  )}
                  <p style={{ margin: "8px 0" }}><strong>Average Salary:</strong> {selectedCareer.averageSalary}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: 'center' }}>
                    <button
                      onClick={() => {
                        navigate("/course-select", { state: { careerName: selectedCareer.name, tier } });
                      }}
                      style={{ padding: "8px 12px", background: "#673AB7", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer" }}
                    >
                      Select this pathway
                    </button>
                    <button
                      onClick={() => alert("More resources coming soon.")}
                      style={{ padding: "8px 12px", borderRadius: 8, background: "#fff", border: "1px solid #ccc", cursor: "pointer" }}
                    >
                      Learn more
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CareerPage;
