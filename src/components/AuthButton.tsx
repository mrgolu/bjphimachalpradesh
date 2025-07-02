import React, { useState, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import { toast } from 'react-toastify';

const AuthButton: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if supabase is properly initialized
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

  const handleSignOut = async () => {
    if (!supabase) {
      toast.error('Authentication service not available');
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="w-8 h-8 border-2 border-bjp-saffron border-t-transparent rounded-full animate-spin"></div>
    );
  }

  // If supabase is not available, show a disabled state
  if (!supabase) {
    return (
      <button
        disabled
        className="bg-gray-400 text-white px-4 py-2 rounded-md cursor-not-allowed flex items-center space-x-2"
        title="Authentication service not available"
      >
        <User size={20} />
        <span>Sign In</span>
      </button>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User size={20} className="text-bjp-saffron" />
            <span className="text-sm text-gray-700 hidden md:block">
              {user.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-1 text-gray-600 hover:text-bjp-saffron transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
            <span className="hidden md:block">Sign Out</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
        >
          <User size={20} />
          <span>Sign In</span>
        </button>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default AuthButton;