import React, { useState } from 'react';
import axios from 'axios';

const MappingForm = () => {
    const [file, setFile] = useState(null);
    const [mappedData, setMappedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError(null); // Reset error state

        try {
            const response = await axios.post('http://localhost:5000/api/payers/map', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMappedData(response.data);
        } catch (error) {
            setError('Error mapping payers: ' + error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2>Map Payer Details</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                <button type="submit" disabled={loading}>
                    {loading ? 'Mapping...' : 'Map Payers'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

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