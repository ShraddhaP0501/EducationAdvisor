import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Define jobs for all courses & flowcharts
const jobsData = {
    botany: { jobs: ['Botanist', 'Plant Scientist', 'Ecologist'] },
    zoology: { jobs: ['Zoologist', 'Wildlife Biologist', 'Veterinarian'] },
    anatomy: { jobs: ['Anatomy Lab Assistant', 'Forensic Scientist', 'Physician'] },
    microbiology: { jobs: ['Microbiologist', 'Virologist', 'Bacteriologist'] },
    genetics: { jobs: ['Genetic Counselor', 'Research Scientist', 'Bioinformatician'] },
    calculus: { jobs: ['Data Analyst', 'Financial Engineer', 'Operations Research Analyst'] },
    algebra: { jobs: ['Cryptographer', 'Mathematician', 'Statistician'] },
    statistics: { jobs: ['Statistician', 'Market Research Analyst', 'Economist'] },
    geometry: { jobs: ['Architect', 'Urban Planner', 'Civil Engineer'] },
    trigonometry: { jobs: ['Surveyor', 'Astronomer', 'Aerospace Engineer'] },
    'computer-engineering': { jobs: ['Software Engineer', 'Data Scientist', 'AI Engineer', 'Cybersecurity Specialist', 'Full-Stack Developer'] },

    // Business Studies Flowchart
    'business-studies': { jobs: ['Marketing Manager', 'HR Manager', 'Business Development Executive', 'Operations Manager'] },

    'financial-accounting': { jobs: ['Accountant', 'Financial Analyst', 'Auditor'] },
    'cost-accounting': { jobs: ['Cost Analyst', 'Budget Manager', 'Management Accountant'] },
    marketing: { jobs: ['Marketing Manager', 'Digital Marketing Specialist', 'Brand Manager'] },
    'human-resources': { jobs: ['HR Manager', 'Recruiter', 'Training and Development Specialist'] },
    'ancient-history': { jobs: ['Historian', 'Museum Curator', 'Archivist'] },
    'medieval-history': { jobs: ['Archivist', 'Research Scholar', 'Librarian'] },
    'social-theory': { jobs: ['Sociologist', 'Social Worker', 'Policy Analyst'] },
    'urban-sociology': { jobs: ['Urban Planner', 'Community Developer', 'Geographer'] },
};

function JobsPage() {
    const { stream, field, course } = useParams();

    // Use course if it exists, otherwise fall back to field
    const key = (course || field).toLowerCase().replace(/\s/g, '-');
    const data = jobsData[key] || {};
    const formattedTitle = (course || field)
        .charAt(0).toUpperCase() + (course || field).slice(1).replace(/-/g, ' ');

    const initialNodes = [
        {
            id: '1',
            type: 'input',
            data: { label: formattedTitle },
            position: { x: 250, y: 5 }
        },
        ...(data.jobs || []).map((job, index) => ({
            id: `${index + 2}`,
            data: { label: job },
            position: { x: index * 200, y: 150 }
        })),
    ];

    const initialEdges = (data.jobs || []).map((job, index) => ({
        id: `e1-${index + 2}`,
        source: '1',
        target: `${index + 2}`,
        type: 'step',
        animated: true,
    }));

    return (
        <div className="container" style={{ height: '700px', width: '100%' }}>
            <div className="breadcrumbs">
                <Link to="/">Home</Link> &gt;{" "}
                <Link to={`/career/10th/${stream}`}>
                    {stream.charAt(0).toUpperCase() + stream.slice(1)}
                </Link>{" "}
                &gt;{" "}
                <Link to={`/career/10th/${stream}/${field}`}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                </Link>{" "}
                {/* Show course only if it exists */}
                {course && <> &gt; {formattedTitle}</>}
                {!course && <> &gt; {formattedTitle} (Flowchart)</>}
            </div>

            <h1>Job Opportunities for {formattedTitle} Graduates</h1>
            <p>This flowchart shows potential career paths.</p>

            <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow nodes={initialNodes} edges={initialEdges} fitView>
                    <MiniMap />
                    <Controls />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}

export default JobsPage;
