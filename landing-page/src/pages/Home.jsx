import React from 'react';
import { TypeAnimation } from 'react-type-animation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faLock,
  faCode,
  faChartLine,
  faBolt,
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Dashboard from '../assets/dashboard.png';

function Home() {
  const features = [
    {
      icon: faShieldHalved,
      title: 'Dynamic Honeytokens',
      description: 'AI-powered generation of realistic honeytokens that mimic your infrastructure',
    },
    {
      icon: faLock,
      title: 'Real-Time Detection',
      description: 'Instant alerts and monitoring when honeytokens are accessed by potential threats',
    },
    {
      icon: faCode,
      title: 'Smart Integration',
      description: 'Seamless integration with SIEM systems and existing security infrastructure',
    },
    // {
    //   icon: faChartLine,
    //   title: 'Advanced Analytics',
    //   description: 'Comprehensive dashboard for monitoring and analyzing attack patterns',
    // },
    // {
    //   icon: faBolt,
    //   title: 'Automated Response',
    //   description: 'Immediate threat response and automated security measures',
    // },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-emerald-100/30 to-transparent rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 pt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gradient">Dynamic</span>
                <br />
                <span className="text-slate-900">Honeytoken</span>
                <br />
                <span className="text-gradient">Protection</span>
              </h1>

              <p className="text-slate-600 text-xl mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Advanced threat detection through AI-powered dynamic honeytoken generation.
                Protect your infrastructure with intelligent decoys and real-time monitoring.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-8 py-4 text-lg"
                >
                  <FontAwesomeIcon icon={faShieldHalved} className="mr-2" />
                  Start Free Trial
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary px-8 py-4 text-lg"
                >
                  Watch Demo
                </motion.button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-8 text-sm text-slate-500">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span>99.9% Detection Rate</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span>24/7 Monitoring</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span>Enterprise Ready</span>
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative">
                {/* Main dashboard mockup */}
                <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                        <FontAwesomeIcon icon={faShieldHalved} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">HoneyGuard Dashboard</h3>
                        <p className="text-sm text-slate-500">Real-time monitoring</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                  </div>

                  {/* Mock charts and data */}
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-emerald-600">1,247</div>
                        <div className="text-sm text-slate-600">Threats Detected</div>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">99.9%</div>
                        <div className="text-sm text-slate-600">Accuracy</div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">24/7</div>
                        <div className="text-sm text-slate-600">Monitoring</div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">System Health</span>
                        <span className="text-sm text-emerald-600 font-medium">98.5%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full w-[98.5%]"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 glass-effect p-4 rounded-2xl shadow-xl"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">AI</div>
                    <div className="text-xs text-slate-600">Powered</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 glass-effect p-4 rounded-2xl shadow-xl"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">24/7</div>
                    <div className="text-xs text-slate-600">Active</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
              Comprehensive Threat Detection
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our advanced honeytoken technology provides multi-layered protection against sophisticated cyber threats
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-modern group hover:border-emerald-200"
              >
                <div className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <FontAwesomeIcon icon={feature.icon} className="text-2xl text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
              Trusted by Security Professionals Worldwide
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join thousands of organizations that rely on HoneyGuard for their cybersecurity needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: '1000+', label: 'Threats Detected Daily', icon: faShieldHalved },
              { number: '99.9%', label: 'Detection Accuracy', icon: faChartLine },
              { number: '24/7', label: 'Real-Time Monitoring', icon: faBolt },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-modern p-8 text-center group hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={stat.icon} className="text-2xl text-white" />
                </div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.number}</div>
                <div className="text-slate-700 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
