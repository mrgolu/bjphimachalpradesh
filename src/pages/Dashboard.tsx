import React from 'react';
import UserPanel from '../components/UserPanel';

const Dashboard: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">My Dashboard</h1>
        <p className="text-gray-600 mb-8">View and manage your meetings and activities</p>
        
        <UserPanel />
      </div>
    </div>
  );
};

export default Dashboard