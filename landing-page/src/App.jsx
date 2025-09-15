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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900">
        <nav
          className={`fixed w-full z-50 transition-all duration-500 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-xl shadow-lg shadow-slate-900/5 border-b border-slate-200/50'
              : 'bg-white/90 backdrop-blur-xl'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <a
                href="/"
                className="flex items-center space-x-3 text-emerald-600 hover:text-emerald-700 transition-all duration-300 transform hover:scale-105"
              >
                <FontAwesomeIcon icon={faShieldHalved} className="text-3xl" />
                <span className="font-extrabold text-2xl tracking-tight">HoneyGuard</span>
              </a>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.text}
                    href={item.path}
                    className="text-slate-600 hover:text-emerald-600 transition-all duration-300 relative group text-sm font-medium"
                  >
                    {item.text}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary text-sm px-5 py-2.5"
                >
                  <a href="https://honeyguard.vercel.app/">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-lg mr-2" />
                  <span>Try Demo</span>
                  </a>
                </motion.button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-slate-600 hover:text-emerald-600 p-2 transition-colors duration-300 rounded-lg hover:bg-slate-100"
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
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50 shadow-xl"
              >
                <div className="px-4 pt-4 pb-6 space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.text}
                      to={item.path}
                      className="block py-3 text-slate-600 hover:text-emerald-600 transition-colors duration-300 text-sm font-medium rounded-lg hover:bg-slate-50 px-3"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.text}
                    </Link>
                  ))}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="w-full btn-primary text-sm py-3 mt-4"
                  >
                  <a href="https://honeyguard.vercel.app/">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-lg mr-2" />
                    <span>Try Demo</span>
                    </a>
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

        <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-emerald-600 font-semibold text-lg mb-4">
                  HoneyGuard
                </h3>
                <p className="text-slate-600">Securing the future of Web3 with intelligent honeytoken technology.</p>
                <div className="flex space-x-4 mt-6">
                  <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
                  </a>
                  <a href="#" className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-4">Quick Links</h4>
                <div className="flex flex-col space-y-2">
                  {navItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.text}
                      to={item.path}
                      className="text-slate-600 hover:text-emerald-600 transition-colors"
                    >
                      {item.text}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-4">Resources</h4>
                <div className="flex flex-col space-y-2">
                  <a
                    href="#"
                    className="text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    Documentation
                  </a>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    API Reference
                  </a>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    Blog
                  </a>
                  <a
                    href="#"
                    className="text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    Support
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-slate-900 font-semibold mb-4">Contact</h4>
                <p className="text-slate-600 mb-2">contact.ideatex@gmail.com</p>
                <p className="text-slate-600">+91 8715808090</p>
                <p className="text-slate-600">Jammu, India</p>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-200 text-center text-slate-500">
              <p>&copy; {new Date().getFullYear()} HoneyGuard. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
