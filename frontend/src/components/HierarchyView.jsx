import React, { useState, useEffect } from 'react';
import axios from 'axios';

const HierarchyView = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchHierarchy = async () => {
            const response = await axios.get('/api/payers/hierarchy');
            setData(response.data);
        };
        fetchHierarchy();
    }, []);

    return (
        <div>
            <h1>Payer Hierarchy</h1>
            {data.map((group) => (
                <div key={group.id}>
                    <h2>{group.name}</h2>
                    <ul>
                        {group.payers.map((payer) => (
                            <li key={payer.id}>
                                {payer.name} - {payer.pretty_name}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default HierarchyView;
