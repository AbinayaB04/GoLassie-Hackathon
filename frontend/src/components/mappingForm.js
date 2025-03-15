import React, { useState } from 'react';
import axios from 'axios';

const MappingForm = () => {
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post('http://localhost:5000/api/payers/map', formData);
        console.log(response.data);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Map Payer Details</h2>
            <input type="file" onChange={handleFileChange} />
            <button type="submit">Map Payers</button>
        </form>
    );
};

export default MappingForm;