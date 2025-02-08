import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldHalved, 
  faLock, 
  faCode, 
  faSearch, 
  faBug, 
  faRobot,
  faChartLine,
  faServer,
  faFileCode,
  faKey,
  faEnvelope,
  faDatabase
} from '@fortawesome/free-solid-svg-icons';

function Services() {
  const services = [
    {
      icon: faKey,
      title: "Credential Honeytoken Service",
      description: "Generate and monitor sophisticated fake credentials that blend seamlessly with your infrastructure.",
      features: [
        "AI-generated usernames and passwords",
        "API key honeytokens",
        "Email login tracking",
        "Access pattern monitoring"
      ]
    },
    {
      icon: faFileCode,
      title: "Document Tracking Service",
      description: "Create trackable documents with embedded honeytokens for comprehensive threat detection.",
      features: [
        "PDF tracking links",
        "Word document monitoring",
        "Excel file tracking",
        "Cloud storage integration"
      ]
    },
    {
      icon: faBug,
      title: "Malware Simulation Service",
      description: "Deploy fake malware files that trigger alerts when accessed by potential threats.",
      features: [
        "Executable honeytokens",
        "Archive file tracking",
        "Signature monitoring",
        "Behavior analysis"
      ]
    },
    {
      icon: faEnvelope,
      title: "Email Integration Service",
      description: "Seamlessly integrate honeytokens with your email systems for phishing detection.",
      features: [
        "Gmail/Outlook integration",
        "Email credential tracking",
        "Phishing attempt detection",
        "Real-time alerts"
      ]
    },
    {
      icon: faDatabase,
      title: "SIEM Integration Service",
      description: "Connect HoneyGuard with your existing security infrastructure for centralized monitoring.",
      features: [
        "Splunk integration",
        "Elasticsearch support",
        "Custom API endpoints",
        "Data synchronization"
      ]
    },
    {
      icon: faChartLine,
      title: "Analytics Service",
      description: "Comprehensive analytics and visualization of threat detection data.",
      features: [
        "Real-time dashboards",
        "Attack pattern analysis",
        "Threat intelligence",
        "Custom reporting"
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
          Our Services
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Comprehensive honeytoken generation and threat detection services to protect your infrastructure
        </motion.p>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
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
                  <FontAwesomeIcon icon={service.icon} className="text-2xl text-[#00ff9d]" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-white group-hover:text-[#00ff9d] transition-colors">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-3">
                  {service.features.map((feature, fIndex) => (
                    <motion.li 
                      key={fIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + fIndex * 0.1 }}
                      className="flex items-center space-x-3 text-gray-300"
                    >
                      <span className="w-1.5 h-1.5 bg-[#00ff9d] rounded-full"></span>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Integration Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient"
        >
          Seamless Integration
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: faServer,
              title: "Infrastructure",
              items: ["AWS", "Google Cloud", "Azure", "On-premise"]
            },
            {
              icon: faEnvelope,
              title: "Communication",
              items: ["Gmail", "Outlook", "Slack", "Teams"]
            },
            {
              icon: faDatabase,
              title: "Security Systems",
              items: ["Splunk", "ELK Stack", "Custom SIEM", "API Integration"]
            }
          ].map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#00ff9d]/20 to-[#64ffda]/20 rounded-lg flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={platform.icon} className="text-xl text-[#00ff9d]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-4">{platform.title}</h3>
              <ul className="space-y-2">
                {platform.items.map((item, iIndex) => (
                  <li key={iIndex} className="text-gray-400 flex items-center space-x-2">
                    <span className="w-1 h-1 bg-[#00ff9d] rounded-full"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
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
            Ready to Deploy HoneyGuard?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Get started with our advanced honeytoken generation and threat detection services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-all duration-300"
            >
              Schedule Demo
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border border-[#00ff9d] text-[#00ff9d] px-8 py-3 rounded-lg font-medium hover:bg-[#00ff9d]/10 transition-all duration-300"
            >
              Contact Sales
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Services;
