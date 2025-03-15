import React from 'react';
import PayerList from './components/payerList';
import PayerGroupList from './components/payerGroupList';
import MappingForm from './components/mappingForm';
import ManualMappingForm from './components/ManualMappingForm';
import HierarchyView from './components/HierarchyView';
const App = () => {
    return (
        <div>
            <PayerGroupList />
            <PayerList />
            <MappingForm />
            <ManualMappingForm/>
            <HierarchyView/>
        </div>
    );
};

export default App;