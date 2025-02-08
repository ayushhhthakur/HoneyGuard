import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Import pages
import Home from './pages/Home';
import Services from './pages/Services';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { text: 'Features', path: '/features' },
    { text: 'Services', path: '/services' },
    { text: 'Pricing', path: '/pricing' },
    { text: 'Contact', path: '/contact' },
  ];

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-[#020c1b] to-[#0a192f] text-white">
        <nav
          className={`fixed w-full z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-[#0a192f]/90 backdrop-blur-md shadow-lg shadow-[#00ff9d]/5'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link
                to="/"
                className="flex items-center space-x-3 text-[#00ff9d] hover:text-[#64ffda] transition-all duration-300 transform hover:scale-105"
              >
                <FontAwesomeIcon icon={faShieldHalved} className="text-3xl" />
                <span className="font-extrabold text-2xl tracking-tight">HoneyGuard</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-10">
                {navItems.map((item) => (
                  <Link
                    key={item.text}
                    to={item.path}
                    className="text-gray-300 hover:text-[#00ff9d] transition-all duration-300 relative group text-sm font-medium"
                  >
                    {item.text}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00ff9d] transition-all duration-300 group-hover:w-full"></span>
                  </Link>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] px-6 py-2.5 rounded-lg font-semibold flex items-center space-x-2 hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-all duration-300 text-sm cursor-pointer"
                >
                  <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
                  <span>Try Demo</span>
                </motion.button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-300 hover:text-[#00ff9d] p-2 transition-colors duration-300"
                  aria-label="Toggle menu"
                >
                  <motion.div
                    animate={isOpen ? "open" : "closed"}
                    className="w-6 h-6 relative"
                  >
                    <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
                    <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 translate-y-2 ${isOpen ? 'opacity-0' : ''}`} />
                    <span className={`absolute h-0.5 w-6 bg-current transform transition-all duration-300 translate-y-4 ${isOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
                  </motion.div>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden bg-[#0a192f]/95 backdrop-blur-lg"
              >
                <div className="px-4 pt-2 pb-6 space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.text}
                      to={item.path}
                      className="block py-3 text-gray-300 hover:text-[#00ff9d] transition-colors duration-300 text-sm font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.text}
                    </Link>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] px-4 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-all duration-300 text-sm"
                  >
                    <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
                    <span>Try Demo</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        <main className="pt-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>

        <footer className="bg-[#0a192f] mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-[#00ff9d] font-semibold text-lg mb-4">
                  HoneyGuard
                </h3>
                <p className="text-gray-400">Securing the future of Web3</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                <div className="flex flex-col space-y-2">
                  {navItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.text}
                      to={item.path}
                      className="text-gray-400 hover:text-[#00ff9d] transition-colors"
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <div className="flex flex-col space-y-2">
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#00ff9d] transition-colors"
                  >
                    Blog
                  </a>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-[#00ff9d] transition-colors"
                  >
                    Support
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-4">Contact</h4>
                <p className="text-gray-400">contact.ideatex@gmail.com</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
              &copy; {new Date().getFullYear()} HoneyGuard. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
