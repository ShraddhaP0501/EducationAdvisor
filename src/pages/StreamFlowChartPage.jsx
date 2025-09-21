import React, { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// =======================
// JOBS DATA
// =======================
const jobsData = {
    // 🔹 Biology Stream
    'mbbs-(bachelor-of-medicine-and-bachelor-of-surgery)': {
        jobs: ['Doctor', 'Surgeon', 'Medical Researcher', 'Public Health Specialist']
    },
    'bds-(dental-surgery)': {
        jobs: ['Dentist', 'Dental Surgeon', 'Orthodontist']
    },
    'bams-(ayurvedic-medicine)': {
        jobs: ['Ayurvedic Doctor', 'Researcher', 'Healthcare Consultant']
    },
    'bhms-(homeopathy)': {
        jobs: ['Homeopathy Doctor', 'Alternative Medicine Specialist']
    },
    'bums-(unani-medicine)': {
        jobs: ['Unani Doctor', 'Alternative Medicine Practitioner']
    },
    'b.sc.-nursing': {
        jobs: ['Nurse', 'Healthcare Administrator', 'Clinical Instructor']
    },
    'bpt-(physiotherapy)': {
        jobs: ['Physiotherapist', 'Rehabilitation Specialist']
    },
    'b.-pharma-(pharmacy)': {
        jobs: ['Pharmacist', 'Drug Inspector', 'Pharmaceutical Scientist']
    },

    // 🔹 Maths / Science Stream
    'b.tech-/-be-(engineering-–-all-branches:-computer,-mechanical,-civil,-electrical,-ai,-it,-etc.)': {
        jobs: ['Software Engineer', 'Civil Engineer', 'Mechanical Engineer', 'AI Engineer']
    },
    'b.arch-(architecture)': {
        jobs: ['Architect', 'Urban Planner', 'Interior Designer']
    },
    'bca-(computer-applications)': {
        jobs: ['Software Developer', 'System Analyst', 'IT Consultant']
    },
    'b.sc.-computer-science-/-it': {
        jobs: ['Data Scientist', 'Software Engineer', 'Cybersecurity Analyst']
    },
    'b.sc.-data-science-/-artificial-intelligence': {
        jobs: ['Data Scientist', 'AI Engineer', 'Machine Learning Specialist']
    },
    'b.sc.-mathematics-/-statistics': {
        jobs: ['Statistician', 'Actuary', 'Data Analyst']
    },
    'b.sc.-aviation-/-aeronautics-/-aerospace': {
        jobs: ['Pilot', 'Aerospace Engineer', 'Air Traffic Controller']
    },

    // 🔹 Commerce Stream
    'b.com-(general-/-hons)': {
        jobs: ['Accountant', 'Financial Analyst', 'Business Consultant']
    },
    'bba-(bachelor-of-business-administration)': {
        jobs: ['Business Manager', 'HR Manager', 'Marketing Executive']
    },
    'bms-(bachelor-of-management-studies)': {
        jobs: ['Operations Manager', 'Business Analyst', 'Project Manager']
    },
    'baf-(accounting-&-finance)': {
        jobs: ['Auditor', 'Financial Planner', 'Tax Consultant']
    },
    'bfm-(financial-markets)': {
        jobs: ['Stock Broker', 'Investment Banker', 'Portfolio Manager']
    },
    'b.sc.-economics': {
        jobs: ['Economist', 'Policy Analyst', 'Financial Consultant']
    },
    'bachelor-of-economics-(be)': {
        jobs: ['Economist', 'Research Analyst', 'Market Analyst']
    },
    'bca-(commerce-eligible)': {
        jobs: ['Software Developer', 'Database Administrator']
    },
    'hotel-management-(bhm)': {
        jobs: ['Hotel Manager', 'Chef', 'Event Manager']
    },

    // 🔹 Arts Stream
    'ba-(bachelor-of-arts)-–-general-/-hons-(subjects:-english,-history,-political-science,-sociology,-etc.)': {
        jobs: ['Teacher', 'Writer', 'Civil Services Officer', 'Researcher']
    },
    'bfa-(fine-arts)': {
        jobs: ['Artist', 'Graphic Designer', 'Animator']
    },
    'bjmc-(journalism-&-mass-communication)': {
        jobs: ['Journalist', 'News Anchor', 'Media Manager']
    },
    'bsw-(social-work)': {
        jobs: ['Social Worker', 'NGO Manager', 'Community Development Officer']
    },
    'b.ed-(integrated)': {
        jobs: ['Teacher', 'Educational Consultant']
    },
    'ba-psychology-/-economics-/-geography': {
        jobs: ['Psychologist', 'Economist', 'Geographer']
    },
    'ba-llb-(integrated-law)': {
        jobs: ['Lawyer', 'Legal Advisor', 'Corporate Counsel']
    }
};

// =======================
// STREAM STRUCTURE DATA
// =======================
const streamStructure = {
    science: {
        Biology: [
            'MBBS (Bachelor of Medicine and Bachelor of Surgery)',
            'BDS (Dental Surgery)',
            'BAMS (Ayurvedic Medicine)',
            'BHMS (Homeopathy)',
            'BUMS (Unani Medicine)',
            'B.Sc. Nursing',
            'BPT (Physiotherapy)',
            'B. Pharma (Pharmacy)',
        ],
        Maths: [
            'B.Tech / BE (Engineering – all branches: Computer, Mechanical, Civil, Electrical, AI, IT, etc.)',
            'B.Arch (Architecture)',
            'BCA (Computer Applications)',
            'B.Sc. Computer Science / IT',
            'B.Sc. Data Science / Artificial Intelligence',
            'B.Sc. Mathematics / Statistics',
            'B.Sc. Aviation / Aeronautics / Aerospace'
        ],
    },
    commerce: {
        Core: [
            'B.Com (General / Hons)',
            'BBA (Bachelor of Business Administration)',
            'BMS (Bachelor of Management Studies)',
            'BAF (Accounting & Finance)',
            'BFM (Financial Markets)',
            'B.Sc. Economics',
            'Bachelor of Economics (BE)',
            'BCA (Computer Applications – some colleges allow commerce students)',
            'Hotel Management (BHM)'
        ]
    },
    arts: {
        Core: [
            'BA (Bachelor of Arts) – General / Hons (Subjects: English, History, Political Science, Sociology, etc.)',
            'BFA (Fine Arts)',
            'BJMC (Journalism & Mass Communication)',
            'BSW (Social Work)',
            'B.Ed (Integrated)',
            'BA Psychology / Economics / Geography',
            'BA LLB (Integrated Law)'
        ]
    },
};

// =======================
// REACT COMPONENT
// =======================
function StreamFlowChartPage() {
    const { stream } = useParams();
    const structure = streamStructure[stream.toLowerCase()] || {};

    const initialNodes = [];
    const initialEdges = [];

    // Root node (Stream)
    initialNodes.push({
        id: `root`,
        type: 'input',
        data: { label: stream.charAt(0).toUpperCase() + stream.slice(1) },
        position: { x: 200, y: 0 }
    });

    // Fields and Courses
    let verticalOffset = 200; // Starting Y position for the first course

    Object.entries(structure).forEach(([field, courses], fieldIndex) => {
        const fieldId = `field-${fieldIndex}`;

        // Position the field node vertically
        initialNodes.push({
            id: fieldId,
            data: { label: field },
            position: { x: 200, y: verticalOffset - 100 } // Position the field above its courses
        });
        initialEdges.push({ id: `e-root-${fieldId}`, source: 'root', target: fieldId, animated: true });

        courses.forEach((course, courseIndex) => {
            const courseId = `course-${fieldIndex}-${courseIndex}`;
            initialNodes.push({
                id: courseId,
                data: { label: course },
                // Courses are all aligned on the same vertical line (x = 200)
                position: { x: 200, y: verticalOffset }
            });
            initialEdges.push({ id: `e-${fieldId}-${courseId}`, source: fieldId, target: courseId, animated: true });

            verticalOffset += 100; // Increment the vertical position for the next course
        });
    });

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [expandedCourses, setExpandedCourses] = useState({});

    const onNodeClick = useCallback(
        (event, node) => {
            if (node.id.startsWith('course-')) {
                const courseLabel = node.data.label;
                const jobKey = courseLabel.toLowerCase().replace(/\s/g, '-');

                if (jobsData[jobKey] && !expandedCourses[node.id]) {
                    const newNodes = [...nodes];
                    const newEdges = [...edges];
                    const jobs = jobsData[jobKey].jobs;

                    jobs.forEach((job, jobIndex) => {
                        const jobId = `${node.id}-job-${jobIndex}`;
                        newNodes.push({
                            id: jobId,
                            data: { label: job },
                            // Jobs are placed in a column to the right of the course node
                            position: { x: node.position.x + 300, y: node.position.y + jobIndex * 60 },
                        });
                        newEdges.push({
                            id: `e-${node.id}-${jobId}`,
                            source: node.id,
                            target: jobId,
                            animated: true,
                        });
                    });

                    setNodes(newNodes);
                    setEdges(newEdges);
                    setExpandedCourses(prev => ({ ...prev, [node.id]: true }));
                }
            }
        },
        [nodes, edges, expandedCourses, setNodes, setEdges]
    );

    return (
        <div className="container" style={{ height: '900px', width: '100%' }}>
            <div className="breadcrumbs">
                <Link to="/">Home</Link> &gt; {stream.charAt(0).toUpperCase() + stream.slice(1)} Chart
            </div>

            <h1>{stream.charAt(0).toUpperCase() + stream.slice(1)} Career Flowchart</h1>
            <p>Click on a course to see the related job opportunities.</p>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
            >
                <MiniMap />
                <Controls />
                <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}

export default StreamFlowChartPage;

