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
      description: 'Generation of realistic honeytokens that mimic your infrastructure',
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
    {
      icon: faChartLine,
      title: 'Advanced Analytics',
      description: 'Comprehensive dashboard for monitoring and analyzing attack patterns',
    },
    {
      icon: faBolt,
      title: 'Automated Response',
      description: 'Immediate threat response and automated security measures',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[#020c1b] z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center md:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-transparent bg-clip-text">
                <TypeAnimation
                  sequence={[
                    'Dynamic Honeytoken Generation',
                    2000,
                    'Real-Time Threat Detection',
                    2000,
                    'Proactive Security Defense',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                />
              </h1>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto md:mx-0">
                Advanced threat detection through dynamic honeytoken generation. Protect your infrastructure with intelligent decoys and real-time monitoring.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-shadow"
                >
                  Try HoneyGuard
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer border-2 border-[#00ff9d] text-[#00ff9d] px-8 py-3 rounded-lg font-medium hover:bg-[#00ff9d]/10 transition-colors"
                >
                  View Documentation
                </motion.button>
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00ff9d]/20 to-transparent rounded-3xl blur-3xl" />
              <img
                src={Dashboard}
                alt="HoneyGuard Dashboard"
                className="relative rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-[#0a192f]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-transparent bg-clip-text"
            data-aos="fade-up"
          >
            Comprehensive Threat Detection
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-6 bg-gradient-to-b from-[#0a192f] to-[#0a192f]/50 rounded-xl border border-[#00ff9d]/10 hover:border-[#00ff9d]/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00ff9d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="relative">
                  <div className="text-[#00ff9d] text-4xl mb-4">
                    <FontAwesomeIcon icon={feature.icon} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20" data-aos="fade-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '-', label: 'Threats Detected' },
              { number: '99.9%', label: 'Detection Accuracy' },
              { number: '24/7', label: 'Real-Time Monitoring' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
              >
                <div className="text-3xl font-bold text-[#00ff9d] mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
