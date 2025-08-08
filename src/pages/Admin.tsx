import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Plus, LogIn, LogOut, User } from 'lucide-react';

const Admin: React.FC = () => {
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'admin@bjphp.com',
        password: 'admin123'
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in:', error);
      alert('Error signing in: ' + (error as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <div className="pt-24 pb-16 bg-bjp-lightGray min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-bjp-darkGray mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Create and manage content</p>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          {!user ? (
            <div className="text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please sign in to access the admin panel</p>
              
              <button
                onClick={handleSignIn}
                disabled={loading}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center mx-auto disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="w-5 h-5 mr-2" />
                )}
                Sign In as Admin
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Content Management</h2>
                  <p className="text-gray-600">Signed in as: {user.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Sign Out
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-gray-600 mb-6">Create and manage posts, activities, and other content</p>
                
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center mx-auto"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Content
                </button>
              </div>
            </div>
          )}
        </div>
        
        {showAdminPanel && (
          <AdminPanel onClose={() => setShowAdminPanel(false)} />
        )}
      </div>
    </div>
  );
};

export default Admin;