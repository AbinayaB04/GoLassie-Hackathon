import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManualMappingForm = () => {
    const [unmappedDetails, setUnmappedDetails] = useState([]);

    useEffect(() => {
        const fetchUnmappedDetails = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/payers/unmapped'); // Adjust URL
                console.log('Fetched Data:', response.data);
                setUnmappedDetails(response.data || []); // Ensure it's always an array
            } catch (error) {
                console.error('Failed to fetch unmapped details:', error);
                setUnmappedDetails([]); // Fallback to an empty array
            }
        };

        fetchUnmappedDetails();
    }, []);

    return (
        <div>
            <h1>Manual Mapping</h1>
            {Array.isArray(unmappedDetails) && unmappedDetails.length > 0 ? (
                <ul>
                    {unmappedDetails.map((detail) => (
                        <li key={detail.id}>
                            {detail.name} - {detail.payer_number}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No unmapped details available.</p>
            )}
        </div>
    );
};

export default ManualMappingForm;
