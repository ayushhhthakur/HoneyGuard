import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faLock,
  faCode,
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
    {
      icon: faGears,
      title: "System Integration",
      description: "Seamless integration with your existing security infrastructure.",
      details: [
        "SIEM integration",
        "Email system support",
        "Cloud storage monitoring",
        "Cross-platform coverage"
      ]
    },
    {
      icon: faChartLine,
      title: "Advanced Analytics",
      description: "Comprehensive dashboard for monitoring and analyzing threats.",
      details: [
        "Attack visualization",
        "Trend analysis",
        "Threat intelligence",
        "Custom reporting"
      ]
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold mb-6 text-gradient"
        >
          Advanced Features
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto"
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
              className="card-modern group hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FontAwesomeIcon icon={feature.icon} className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.details.map((detail, dIndex) => (
                    <motion.li
                      key={dIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + dIndex * 0.1 }}
                      className="flex items-center space-x-3 text-slate-700"
                    >
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
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
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-gradient"
        >
          Why Choose HoneyGuard?
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="card-modern border-red-200"
          >
            <h3 className="text-2xl font-semibold mb-6 text-slate-700 flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              Traditional Security
            </h3>
            <ul className="space-y-4">
              {[
                'Static honeypots',
                'Manual monitoring',
                'Delayed detection',
                'Limited coverage'
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3 text-slate-600">
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="card-modern border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-teal-50/50"
          >
            <h3 className="text-2xl font-semibold mb-6 text-emerald-700 flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
              HoneyGuard Security
            </h3>
            <ul className="space-y-4">
              {[
                'Dynamic honeytokens',
                'AI-powered monitoring',
                'Real-time detection',
                'Comprehensive protection'
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3 text-slate-700">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
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
          className="glass-effect p-12 rounded-3xl border-emerald-200/50 text-center bg-gradient-to-r from-emerald-50/30 to-teal-50/30"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Ready to Enhance Your Security?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Start protecting your infrastructure with HoneyGuard's next-generation honeytoken technology
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary px-8 py-4 text-lg"
            >
              Get Started Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-ghost px-8 py-4 text-lg"
            >
              Schedule Demo
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Features;
