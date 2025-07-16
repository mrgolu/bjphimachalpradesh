import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Video, Calendar, Users, Menu } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Live from './pages/Live';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import Meetings from './pages/Meetings';

function App() {
  const location = useLocation();
  const showButtons = location.pathname !== '/' && location.pathname !== '/live';

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      <main className="flex-grow pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/meetings" element={<Meetings />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 gap-1 py-2">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-3 px-2 ${
              location.pathname === '/' ? 'text-bjp-saffron' : 'text-gray-600'
            }`}
          >
            <HomeIcon size={24} />
            <span className="text-xs mt-1.5">Home</span>
          </Link>
          <Link
            to="/live"
            className={`flex flex-col items-center justify-center py-3 px-2 ${
              location.pathname === '/live' ? 'text-bjp-saffron' : 'text-gray-600'
            }`}
          >
            <Video size={24} />
            <span className="text-xs mt-1.5">Live</span>
          </Link>
          <Link
            to="/activities"
            className={`flex flex-col items-center justify-center py-3 px-2 ${
              location.pathname === '/activities' ? 'text-bjp-saffron' : 'text-gray-600'
            }`}
          >
            <Calendar size={24} />
            <span className="text-xs mt-1.5">Activities</span>
          </Link>
          <Link
            to="/meetings"
            className={`flex flex-col items-center justify-center py-3 px-2 ${
              location.pathname === '/meetings' ? 'text-bjp-saffron' : 'text-gray-600'
            }`}
          >
            <Users size={24} />
            <span className="text-xs mt-1.5">Meetings</span>
          </Link>
          <Link
            to="/gallery"
            className={`flex flex-col items-center justify-center py-3 px-2 ${
              location.pathname === '/gallery' ? 'text-bjp-saffron' : 'text-gray-600'
            }`}
          >
            <Menu size={24} />
            <span className="text-xs mt-1.5">Gallery</span>
          </Link>
        </div>
      </div>

      {showButtons && (
        <div className="fixed bottom-24 md:bottom-6 right-6 flex flex-col gap-4 z-40">
          <Link
            to="/live"
            className="bg-bjp-saffron hover:bg-bjp-darkSaffron text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
            title="Go Live"
          >
            <Video size={24} />
          </Link>
          <Link
            to="/"
            className="bg-bjp-blue hover:bg-blue-900 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110"
            title="Home"
          >
            <HomeIcon size={24} />
          </Link>
        </div>
      )}
    </div>
  );
}

export default App;