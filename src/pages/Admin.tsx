import React, { useState } from 'react';
import AdminPanel from '../components/AdminPanel';

const Admin: React.FC = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(true);

  return (
    <div className="pt-20 pb-20 md:pt-24 md:pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-bjp-darkGray mb-6">
          Admin Dashboard
        </h1>

        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}

        {!showAdminPanel && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600 mb-4">Create posts, activities, and manage content</p>
            <button
              onClick={() => setShowAdminPanel(true)}
              className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors"
            >
              Open Admin Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
