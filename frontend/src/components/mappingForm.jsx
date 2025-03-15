import React, { useState } from 'react';
import axios from 'axios';

const MappingForm = () => {
    const [file, setFile] = useState(null);
    const [mappedData, setMappedData] = useState([]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/api/payers/map', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMappedData(response.data);
        } catch (error) {
            console.error('Error mapping payers:', error);
        }
    };

    return (
        <div>
            <h2>Map Payer Details</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit">Map Payers</button>
            </form>

            <h3>Mapped Payers</h3>
            <ul>
                {mappedData.map((item, index) => (
                    <li key={index}>
                        <strong>Payer:</strong> {item.payer.name} (ID: {item.payer.id})<br />
                        <strong>Detail:</strong> {JSON.stringify(item.detail)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MappingForm;