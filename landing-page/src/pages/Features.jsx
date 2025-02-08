import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faLock,
  faBolt,
  faGears,
  faChartLine,
  faRobot,
  faFileCode
} from '@fortawesome/free-solid-svg-icons';

function Features() {
  const features = [
    {
      icon: faShieldHalved,
      title: "Dynamic Honeytoken Creation",
      description: "Generate sophisticated honeytokens that seamlessly blend with your infrastructure.",
      details: [
        "AI-powered credential generation",
        "Trackable document creation",
        "Fake malware signatures",
        "Custom token templates"
      ]
    },
    {
      icon: faRobot,
      title: "AI-Powered Detection",
      description: "Leverage machine learning for intelligent threat detection and analysis.",
      details: [
        "Pattern recognition",
        "Behavioral analysis",
        "Attack prediction",
        "Anomaly detection"
      ]
    },
    {
      icon: faFileCode,
      title: "Multi-Token Support",
      description: "Comprehensive coverage across different types of honeytokens.",
      details: [
        "Fake credentials",
        "API keys",
        "Document tracking",
        "Network tokens"
      ]
    },
    {
      icon: faBolt,
      title: "Real-time Monitoring",
      description: "Instant detection and response to potential security threats.",
      details: [
        "Immediate alerts",
        "Access tracking",
        "Metadata collection",
        "Geolocation tracking"
      ]
    },
    /*{
      icon: faGears,
      title: "System Integration",
      description: "Seamless integration with your existing security infrastructure.",
      details: [
        "SIEM integration",
        "Email system support",
        "Cloud storage monitoring",
        "Cross-platform coverage"
      ]
    },*/
    {
      icon: faChartLine,
      title: "Advanced Analytics",
      description: "Comprehensive dashboard for monitoring and analyzing threats.",
      details: [
        "GenAI Integration",
        "Threat Intelligence Correlation",
        "User & Entity Behavior Analytics (UEBA)",
        "Risk Scoring & Prioritization"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-[#020c1b] to-[#0a192f]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 text-gradient"
        >
          Advanced Features
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Discover how HoneyGuard's dynamic honeytoken generation revolutionizes threat detection
        </motion.p>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-[#00ff9d]/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#00ff9d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#00ff9d]/20 to-[#64ffda]/20 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={feature.icon} className="text-2xl text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-[#00ff9d] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.details.map((detail, dIndex) => (
                    <motion.li 
                      key={dIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + dIndex * 0.1 }}
                      className="flex items-center space-x-3 text-gray-300"
                    >
                      <FontAwesomeIcon icon={faLock} className="text-[#00ff9d] text-sm" />
                      <span>{detail}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Comparison Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient"
        >
          Why Choose HoneyGuard?
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-300">Traditional Security</h3>
            <ul className="space-y-4">
              {[
                'Static honeypots',
                'Manual monitoring',
                'Delayed detection',
                'Limited coverage'
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3 text-gray-400">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-8 bg-gradient-to-br from-[#00ff9d]/10 to-transparent backdrop-blur-lg rounded-2xl border border-[#00ff9d]/20"
          >
            <h3 className="text-xl font-semibold mb-6 text-[#00ff9d]">HoneyGuard Security</h3>
            <ul className="space-y-4">
              {[
                'Dynamic honeytokens',
                'AI-powered monitoring',
                'Real-time detection',
                'Comprehensive protection'
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3 text-white">
                  <FontAwesomeIcon icon={faLock} className="text-[#00ff9d] text-sm" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-12 bg-gradient-to-r from-[#00ff9d]/10 to-transparent backdrop-blur-lg rounded-3xl border border-[#00ff9d]/20 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
            Ready to Enhance Your Security?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Start protecting your infrastructure with HoneyGuard's next-generation honeytoken technology
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-all duration-300"
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}

export default Features;
