import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlow, MiniMap, Controls, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Define job data for ALL courses
const jobsData = {
    botany: {
        jobs: [
            'Botanist',
            'Plant Scientist',
            'Ecologist'
        ],
        courseNode: { id: '1', data: { label: 'Botany' }, position: { x: 250, y: 5 } },
    },
    zoology: {
        jobs: [
            'Zoologist',
            'Wildlife Biologist',
            'Veterinarian'
        ],
        courseNode: { id: '1', data: { label: 'Zoology' }, position: { x: 250, y: 5 } },
    },
    anatomy: {
        jobs: [
            'Anatomy Lab Assistant',
            'Forensic Scientist',
            'Physician'
        ],
        courseNode: { id: '1', data: { label: 'Anatomy' }, position: { x: 250, y: 5 } },
    },
    microbiology: {
        jobs: [
            'Microbiologist',
            'Virologist',
            'Bacteriologist'
        ],
        courseNode: { id: '1', data: { label: 'Microbiology' }, position: { x: 250, y: 5 } },
    },
    genetics: {
        jobs: [
            'Genetic Counselor',
            'Research Scientist',
            'Bioinformatician'
        ],
        courseNode: { id: '1', data: { label: 'Genetics' }, position: { x: 250, y: 5 } },
    },
    calculus: {
        jobs: [
            'Data Analyst',
            'Financial Engineer',
            'Operations Research Analyst'
        ],
        courseNode: { id: '1', data: { label: 'Calculus' }, position: { x: 250, y: 5 } },
    },
    algebra: {
        jobs: [
            'Cryptographer',
            'Mathematician',
            'Statistician'
        ],
        courseNode: { id: '1', data: { label: 'Algebra' }, position: { x: 250, y: 5 } },
    },
    statistics: {
        jobs: [
            'Statistician',
            'Market Research Analyst',
            'Economist'
        ],
        courseNode: { id: '1', data: { label: 'Statistics' }, position: { x: 250, y: 5 } },
    },
    geometry: {
        jobs: [
            'Architect',
            'Urban Planner',
            'Civil Engineer'
        ],
        courseNode: { id: '1', data: { label: 'Geometry' }, position: { x: 250, y: 5 } },
    },
    trigonometry: {
        jobs: [
            'Surveyor',
            'Astronomer',
            'Aerospace Engineer'
        ],
        courseNode: { id: '1', data: { label: 'Trigonometry' }, position: { x: 250, y: 5 } },
    },
    'computer-engineering': {
        jobs: [
            'Software Engineer',
            'Data Scientist',
            'AI Engineer',
            'Cybersecurity Specialist',
            'Full-Stack Developer'
        ],
        courseNode: { id: '1', data: { label: 'Computer Engineering' }, position: { x: 250, y: 5 } },
    },
    'financial-accounting': {
        jobs: [
            'Accountant',
            'Financial Analyst',
            'Auditor'
        ],
        courseNode: { id: '1', data: { label: 'Financial Accounting' }, position: { x: 250, y: 5 } },
    },
    'cost-accounting': {
        jobs: [
            'Cost Analyst',
            'Budget Manager',
            'Management Accountant'
        ],
        courseNode: { id: '1', data: { label: 'Cost Accounting' }, position: { x: 250, y: 5 } },
    },
    marketing: {
        jobs: [
            'Marketing Manager',
            'Digital Marketing Specialist',
            'Brand Manager'
        ],
        courseNode: { id: '1', data: { label: 'Marketing' }, position: { x: 250, y: 5 } },
    },
    'human-resources': {
        jobs: [
            'HR Manager',
            'Recruiter',
            'Training and Development Specialist'
        ],
        courseNode: { id: '1', data: { label: 'Human Resources' }, position: { x: 250, y: 5 } },
    },
    'ancient-history': {
        jobs: [
            'Historian',
            'Museum Curator',
            'Archivist'
        ],
        courseNode: { id: '1', data: { label: 'Ancient History' }, position: { x: 250, y: 5 } },
    },
    'medieval-history': {
        jobs: [
            'Archivist',
            'Research Scholar',
            'Librarian'
        ],
        courseNode: { id: '1', data: { label: 'Medieval History' }, position: { x: 250, y: 5 } },
    },
    'social-theory': {
        jobs: [
            'Sociologist',
            'Social Worker',
            'Policy Analyst'
        ],
        courseNode: { id: '1', data: { label: 'Social Theory' }, position: { x: 250, y: 5 } },
    },
    'urban-sociology': {
        jobs: [
            'Urban Planner',
            'Community Developer',
            'Geographer'
        ],
        courseNode: { id: '1', data: { label: 'Urban Sociology' }, position: { x: 250, y: 5 } },
    },
};

function JobsPage() {
    const { stream, field, course } = useParams();
    const data = jobsData[course.toLowerCase().replace(/\s/g, '-')] || {};
    const formattedCourse = course.charAt(0).toUpperCase() + course.slice(1).replace(/-/g, ' ');

    const initialNodes = [
        {
            id: '1',
            type: 'input',
            data: { label: formattedCourse },
            position: { x: 250, y: 5 }
        },
        ...(data.jobs || []).map((job, index) => ({
            id: `${index + 2}`,
            data: { label: job },
            position: { x: (index * 200), y: 150 }
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
        <div className="container" style={{ height: '700px' }}>
            <div className="breadcrumbs">
                <Link to="/">Home</Link> &gt; <Link to={`/career/10th/${stream}`}>{stream.charAt(0).toUpperCase() + stream.slice(1)}</Link> &gt; <Link to={`/career/10th/${stream}/${field}`}>{field.charAt(0).toUpperCase() + field.slice(1)}</Link> &gt; {formattedCourse}
            </div>
            <h1>Job Opportunities for {formattedCourse} Graduates</h1>
            <p>This flowchart shows potential career paths.</p>

            <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow
                    nodes={initialNodes}
                    edges={initialEdges}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </div>
        </div>
    );
}

export default JobsPage;