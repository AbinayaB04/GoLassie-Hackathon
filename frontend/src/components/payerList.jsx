import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PayerList = () => {
    const [payers, setPayers] = useState([]);
    const [newPayer, setNewPayer] = useState({ name: '', payer_group_id: '' });

    useEffect(() => {
        const fetchPayers = async () => {
            const response = await axios.get('http://localhost:5000/api/payers');
            setPayers(response.data);
        };
        fetchPayers();
    }, []);

    const handleAddPayer = async () => {
        if (newPayer.name && newPayer.payer_group_id) {
            const response = await axios.post('http://localhost:5000/api/payers', newPayer);
            setPayers([...payers, response.data]);
            setNewPayer({ name: '', payer_group_id: '' });
        }
    };

    return (
        <div>
            <h1>Payer List</h1>
            <ul>
                {payers.map(payer => (
                    <li key={payer.id}>{payer.name} (Group ID: {payer.payer_group_id})</li>
                ))}
            </ul>
            <h2>Add New Payer</h2>
            <input
                type="text"
                placeholder="Payer Name"
                value={newPayer.name}
                onChange={(e) => setNewPayer({ ...newPayer, name: e.target.value })}
            />
            <input
                type="number"
                placeholder="Payer Group ID"
                value={newPayer.payer_group_id}
                onChange={(e) => setNewPayer({ ...newPayer, payer_group_id: e.target.value })}
            />
            <button onClick={handleAddPayer}>Add Payer</button>
        </div>
    );
};

export default PayerList;