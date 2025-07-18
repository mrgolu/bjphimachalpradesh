import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AuthButton from './AuthButton';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Live', path: '/live' },
    { name: 'Activities', path: '/activities' },
    { name: 'Meetings', path: '/meetings' },
    { name: 'Gallery', path: '/gallery' },
  ];

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/src/assets/bjp-logo.svg" alt="BJP Logo" className="h-10 w-10" />
            <div>
              <h1 className="font-bold text-bjp-darkSaffron text-xl leading-none">BJP</h1>
              <p className="text-xs text-bjp-darkGreen leading-none">Himachal Pradesh</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-8">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`font-medium transition-colors hover:text-bjp-saffron flex items-center ${
                      location.pathname === link.path
                        ? 'text-bjp-saffron'
                        : scrolled ? 'text-bjp-darkGray' : 'text-white'
                    }`}
                  >
                    {link.name === 'Live' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    )}
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <AuthButton />
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <AuthButton />
            <button
              className="text-bjp-darkGray p-2 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white shadow-lg animate-fade-in">
          <ul className="container mx-auto px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.path} className="py-2">
                <Link
                  to={link.path}
                  className={`block font-medium transition-colors hover:text-bjp-saffron ${
                    location.pathname === link.path
                      ? 'text-bjp-saffron'
                      : 'text-bjp-darkGray'
                  }`}
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default Navbar;