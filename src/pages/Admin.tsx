import React, { useState, useEffect } from 'react';
import AdminPanel from '../components/AdminPanel';

const Admin: React.FC = () => {
  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Create and manage content</p>
        
        <AdminPanel />
      </div>
    </div>
  );
};

export default Admin;