import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminPanel from '../components/AdminPanel';
import AuthModal from '../components/AuthModal';

const Admin: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check if supabase is properly initialized before using it
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjp-saffron mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error message if Supabase is not configured
  if (!supabase) {
    return (
      <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-bjp-darkGray mb-4">Configuration Required</h1>
            <p className="text-gray-600 mb-6">
              Supabase is not configured. Please set up your database connection to access the admin dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-bjp-darkGray mb-4">Admin Access Required</h1>
            <p className="text-gray-600 mb-6">
              You need to sign in to access the admin dashboard.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Manage social media posts and content</p>
        
        <AdminPanel />
      </div>
    </div>
  );
};

export default Admin;