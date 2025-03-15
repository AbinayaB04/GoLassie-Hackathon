import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManualMappingForm = () => {
    const [unmappedDetails, setUnmappedDetails] = useState([]);
    const [selectedPayer, setSelectedPayer] = useState(null);

    useEffect(() => {
        const fetchUnmappedDetails = async () => {
            const response = await axios.get('/api/payer-details/unmapped');
            setUnmappedDetails(response.data);
        };
        fetchUnmappedDetails();
    }, []);

    const handleMap = async (detailId) => {
        if (!selectedPayer) return alert('Please select a payer');
        await axios.post('/api/map-payer-detail', { detailId, payerId: selectedPayer });
    };

    return (
        <div>
            <h1>Manual Mapping</h1>
            <ul>
                {unmappedDetails.map((detail) => (
                    <li key={detail.id}>
                        {detail.name} - {detail.payer_number}
                        <button onClick={() => handleMap(detail.id)}>Map</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ManualMappingForm;
