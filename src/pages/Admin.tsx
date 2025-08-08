import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AdminPanel from '../components/AdminPanel';

const Admin: React.FC = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Create and manage content</p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Management</h2>
            <p className="text-gray-600 mb-6">Create posts and activities for BJP Himachal Pradesh</p>
            
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-3 rounded-lg transition-colors flex items-center mx-auto"
            >
              <Plus size={20} className="mr-2" />
              Create Content
            </button>
          </div>
        </div>
        
        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}
      </div>
    </div>
  );
};

export default Admin;