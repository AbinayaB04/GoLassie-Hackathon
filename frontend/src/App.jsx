import React from 'react';
import PayerList from './components/payerList';
import PayerGroupList from './components/payerGroupList';
import MappingForm from './components/mappingForm';
import ManualMappingForm from './components/ManualMappingForm';
import HierarchyView from './components/HierarchyView';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => (
    <ErrorBoundary>
        <PayerGroupList />
        <PayerList />
        <MappingForm />
        <ManualMappingForm />
        <HierarchyView />
    </ErrorBoundary>
);

export default App;
