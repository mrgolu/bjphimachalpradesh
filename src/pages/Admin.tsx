import React, { useState } from 'react';
import AdminPanel from '../components/AdminPanel';
import AdminAuth from '../components/AdminAuth';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleAuthChange = (authenticated: boolean, email: string | null) => {
    setIsAuthenticated(authenticated);
    setUserEmail(email);
    if (authenticated) {
      setShowAdminPanel(true);
    } else {
      setShowAdminPanel(false);
    }
  };

  return (
    <div className="pt-20 pb-20 md:pt-24 md:pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-2xl md:text-3xl font-bold text-bjp-darkGray mb-6">
          Admin Dashboard
        </h1>

        <AdminAuth onAuthChange={handleAuthChange} />

        {isAuthenticated && showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}

        {isAuthenticated && !showAdminPanel && (
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
