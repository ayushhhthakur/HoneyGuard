import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faTerminal, faUserShield, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

// Import pages
import Home from './pages/Home';
import Services from './pages/Services';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Documentation from './pages/Documentation';

// Scroll to top on navigation helper
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NavContent({ scrolled, isOpen, setIsOpen, navItems }) {
  const location = useLocation();

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#070a13]/85 backdrop-blur-md border-b border-cyber-cyan/10 shadow-[0_4px_30px_rgba(0,240,255,0.03)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 group transition-transform duration-300"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-cyber-cyan/30 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative bg-[#0e1322] border border-cyber-cyan/30 p-2 rounded-lg text-cyber-cyan">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
                </div>
              </div>
              <span className="font-display font-bold text-xl tracking-wider text-slate-100 group-hover:text-cyber-cyan transition-colors">
                HONEY<span className="text-cyber-cyan">GUARD</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.text}
                    to={item.path}
                    className={`font-display text-sm uppercase tracking-widest transition-all duration-300 relative py-2 ${
                      isActive 
                        ? 'text-cyber-cyan text-glow-cyan' 
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {item.text}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavLine"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-cyber-cyan"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
              
              <a
                href="https://honeyguard.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyber-cyan px-5 py-2.5 rounded text-xs flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faTerminal} />
                <span>Console Demo</span>
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-slate-400 hover:text-cyber-cyan p-2 transition-colors duration-300 rounded-lg"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-5 relative flex flex-col justify-between">
                  <span className={`h-[2px] w-6 bg-current transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
                  <span className={`h-[2px] w-6 bg-current transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                  <span className={`h-[2px] w-6 bg-current transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0a0e1a]/95 border-b border-cyber-cyan/10 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-3">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.text}
                      to={item.path}
                      className={`block py-3 px-4 font-display text-sm uppercase tracking-wider rounded transition-colors ${
                        isActive
                          ? 'bg-cyber-cyan/10 text-cyber-cyan'
                          : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.text}
                    </Link>
                  );
                })}
                <div className="pt-4 border-t border-slate-800/60 px-4">
                  <a
                    href="https://honeyguard.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center btn-cyber-cyan py-3 rounded text-xs block"
                    onClick={() => setIsOpen(false)}
                  >
                    <FontAwesomeIcon icon={faTerminal} className="mr-2" />
                    Console Demo
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { text: 'Features', path: '/features' },
    { text: 'Services', path: '/services' },
    { text: 'Pricing', path: '/pricing' },
    { text: 'Docs', path: '/documentation' },
    { text: 'Contact', path: '/contact' },
  ];

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-[#070a13] text-slate-300 flex flex-col cyber-grid relative">
        <div className="absolute inset-0 cyber-radial-glow pointer-events-none z-0" />
        
        {/* Navigation Content Wrapper */}
        <NavContent 
          scrolled={scrolled} 
          isOpen={isOpen} 
          setIsOpen={setIsOpen} 
          navItems={navItems} 
        />

        {/* Main Content Area */}
        <main className="flex-grow pt-20 z-10 relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/documentation" element={<Documentation />} />
          </Routes>
        </main>

        {/* Cyber Footer */}
        <footer className="bg-[#04060b] border-t border-slate-900 z-10 relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-cyber-cyan/10 border border-cyber-cyan/30 p-2 rounded text-cyber-cyan">
                    <FontAwesomeIcon icon={faShieldHalved} />
                  </div>
                  <span className="font-display font-bold text-lg tracking-wider text-slate-100">
                    HONEY<span className="text-cyber-cyan">GUARD</span>
                  </span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Next-generation active threat defense. Deploy dynamic, high-fidelity honeytokens to intercept intruders before data exfiltration occurs.
                </p>
              </div>

              <div>
                <h4 className="font-display font-semibold uppercase text-xs tracking-widest text-slate-400 mb-6 border-l-2 border-cyber-cyan pl-3">
                  Ecosystem
                </h4>
                <ul className="space-y-3 text-sm">
                  {navItems.map((item) => (
                    <li key={item.text}>
                      <Link to={item.path} className="text-slate-500 hover:text-cyber-cyan transition-colors">
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-display font-semibold uppercase text-xs tracking-widest text-slate-400 mb-6 border-l-2 border-cyber-cyan pl-3">
                  Support Nodes
                </h4>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><Link to="/documentation" className="hover:text-cyber-cyan transition-colors">API Docs</Link></li>
                  <li><a href="#" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">Github <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" /></a></li>
                  <li><a href="#" className="hover:text-cyber-cyan transition-colors flex items-center gap-1">Discord Community <FontAwesomeIcon icon={faExternalLinkAlt} className="text-[10px]" /></a></li>
                  <li><Link to="/contact" className="hover:text-cyber-cyan transition-colors">Node Support</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-display font-semibold uppercase text-xs tracking-widest text-slate-400 mb-6 border-l-2 border-cyber-cyan pl-3">
                  Contact Endpoint
                </h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li className="font-mono text-slate-400">contact.ideatex@gmail.com</li>
                  <li>+91 8715808090</li>
                  <li>Jammu, India</li>
                  <li className="pt-2 text-xs flex items-center gap-1.5 text-cyber-cyan font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse"></span>
                    SECURE NODE ACTIVE
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-900/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 font-mono">
              <p>&copy; {new Date().getFullYear()} HoneyGuard. All systems operational.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <a href="#" className="hover:text-cyber-cyan transition-colors">Security Policy</a>
                <a href="#" className="hover:text-cyber-cyan transition-colors">Compliance (SOC2)</a>
                <a href="#" className="hover:text-cyber-cyan transition-colors">PGP Key</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
