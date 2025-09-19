import React from 'react';
import { Link, useParams } from 'react-router-dom';

const courseData = {
    biology: ['Botany', 'Zoology', 'Anatomy', 'Microbiology', 'Genetics'],
    maths: ['Calculus', 'Algebra', 'Statistics', 'Geometry', 'Trigonometry', 'Computer Engineering'],
    accounting: ['Financial Accounting', 'Cost Accounting'],
    'business-studies': ['Marketing', 'Human Resources'],
    history: ['Ancient History', 'Medieval History'],
    sociology: ['Social Theory', 'Urban Sociology']
};

function CourseListPage() {
    const { stream, field } = useParams();
    const courses = courseData[field.toLowerCase()] || [];

    return (
        <div className="container">
            <div className="breadcrumbs">
                <Link to="/">Home</Link> &gt; <Link to={`/career/10th/${stream}`}>{stream.charAt(0).toUpperCase() + stream.slice(1)}</Link> &gt; {field.charAt(0).toUpperCase() + field.slice(1)}
            </div>
            <h1>Select a Course in {field.charAt(0).toUpperCase() + field.slice(1)}</h1>
            <p>Click on any course to view its related job opportunities.</p>
            <div className="button-group">
                {courses.map(course => (
                    <Link
                        to={`/career/10th/${stream}/${field}/${course.toLowerCase().replace(/\s/g, '-')}/jobs`}
                        key={course}
                        className="course-link"
                    >
                        <button>{course}</button>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default CourseListPage;