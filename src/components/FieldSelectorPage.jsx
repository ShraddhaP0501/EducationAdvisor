import React from 'react';
import { Link, useParams } from 'react-router-dom';

function FieldSelectorPage() {
    const { stream } = useParams();

    const fields = {
        science: ['Biology', 'Maths'],
        commerce: ['Accounting', 'Business Studies'],
        arts: ['History', 'Sociology']
    };

    const currentFields = fields[stream.toLowerCase()] || [];

    return (
        <div className="container">
            <h1>Select a Field in {stream.charAt(0).toUpperCase() + stream.slice(1)}</h1>
            <div className="button-group">
                {currentFields.map(field => (
                    <Link to={`/career/10th/${stream}/${field.toLowerCase()}`} key={field}>
                        <button>{field}</button>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default FieldSelectorPage;