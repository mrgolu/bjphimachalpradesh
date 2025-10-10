import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseReady } from '../lib/supabase';
import { toast } from 'react-toastify';
import { LogIn, LogOut, User } from 'lucide-react';

interface AdminAuthProps {
  onAuthChange: (isAuthenticated: boolean, userEmail: string | null) => void;
}

export default function AdminAuth({ onAuthChange }: AdminAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!isSupabaseReady || !supabase) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user?.email) {
      setIsAuthenticated(true);
      setUserEmail(session.user.email);
      onAuthChange(true, session.user.email);
    } else {
      setIsAuthenticated(false);
      setUserEmail(null);
      onAuthChange(false, null);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    if (!isSupabaseReady || !supabase) {
      toast.error('Database not configured');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user?.email) {
        setIsAuthenticated(true);
        setUserEmail(data.user.email);
        setShowLoginForm(false);
        onAuthChange(true, data.user.email);
        toast.success('Logged in successfully!');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!isSupabaseReady || !supabase) return;

    setLoading(true);
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserEmail(null);
      onAuthChange(false, null);
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error('Logout failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && userEmail) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
            <User size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-semibold text-gray-900">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={loading}
          className="flex items-center text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>
    );
  }

  if (!showLoginForm) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center mb-6">
        <div className="w-16 h-16 bg-bjp-lightSaffron rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn size={32} className="text-bjp-saffron" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h3>
        <p className="text-gray-600 mb-4">
          Please login with your admin credentials to create posts and manage content.
        </p>
        <button
          onClick={() => setShowLoginForm(true)}
          className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white px-6 py-2 rounded-md transition-colors"
        >
          Login as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Admin Login</h3>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@bjphimachal.org"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bjp-saffron focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bjp-saffron focus:border-transparent"
            required
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-bjp-saffron hover:bg-bjp-darkSaffron text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={18} className="mr-2" />
                Login
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowLoginForm(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-1">Default Admin Credentials:</p>
        <p>Email: admin@bjphimachal.org</p>
        <p className="text-xs mt-2 text-blue-600">
          Contact your system administrator for credentials or to set up your admin account.
        </p>
      </div>
    </div>
  );
}
