import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PayerGroupList = () => {
    const [payerGroups, setPayerGroups] = useState([]);
    const [newPayerGroup, setNewPayerGroup] = useState('');

    useEffect(() => {
        const fetchPayerGroups = async () => {
            const response = await axios.get('http://localhost:5000/api/payer-groups');
            setPayerGroups(response.data);
        };
        fetchPayerGroups();
    }, []);

    const handleAddPayerGroup = async () => {
        if (newPayerGroup) {
            const response = await axios.post('http://localhost:5000/api/payer-groups', { name: newPayerGroup });
            setPayerGroups([...payerGroups, response.data]);
            setNewPayerGroup('');
        }
    };

    return (
        <div>
            <h1>Payer Groups</h1>
            <ul>
                {payerGroups.map(group => (
                    <li key={group.id}>{group.name}</li>
                ))}
            </ul>
            <h2>Add New Payer Group</h2>
            <input
                type="text"
                placeholder="Payer Group Name"
                value={newPayerGroup}
                onChange={(e) => setNewPayerGroup(e.target.value)}
            />
            <button onClick={handleAddPayerGroup}>Add Payer Group</button>
        </div>
    );
};

export default PayerGroupList;