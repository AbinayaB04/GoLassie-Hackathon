import React from 'react';
import PayerList from './components/payerList';
import PayerGroupList from './components/payerGroupList';
import MappingForm from './components/mappingForm';

const App = () => {
    return (
        <div>
            <PayerGroupList />
            <PayerList />
            <MappingForm />
        </div>
    );
};

export default App;