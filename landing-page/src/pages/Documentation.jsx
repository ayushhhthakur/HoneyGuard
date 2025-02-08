import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCode,
  faFileAlt,
  faTools,
  faQuestionCircle,
  faRocket
} from '@fortawesome/free-solid-svg-icons';

function Documentation() {
  const docs = [
    {
      icon: faBook,
      title: "Getting Started",
      description: "Learn the basics of HoneyGuard and how to integrate it into your project",
      sections: [
        "Quick Start Guide",
        "Installation",
        "Basic Configuration",
        "First Security Scan"
      ]
    },
    {
      icon: faCode,
      title: "API Reference",
      description: "Complete API documentation for integrating HoneyGuard into your workflow",
      sections: [
        "Authentication",
        "Endpoints",
        "Response Formats",
        "Rate Limits"
      ]
    },
    {
      icon: faFileAlt,
      title: "Smart Contract Security",
      description: "Best practices and guidelines for securing your smart contracts",
      sections: [
        "Security Patterns",
        "Common Vulnerabilities",
        "Audit Process",
        "Security Checklist"
      ]
    },
    {
      icon: faTools,
      title: "Integration Guides",
      description: "Step-by-step guides for integrating with popular frameworks and tools",
      sections: [
        "Hardhat Integration",
        "Truffle Integration",
        "CI/CD Setup",
        "Custom Integrations"
      ]
    }
  ];

  return (
    <div className="documentation-page">
      <section className="documentation-hero" data-aos="fade-up">
        <h1>Documentation</h1>
        <p>Everything you need to know about HoneyGuard</p>
        <div className="search-container">
          <input type="text" placeholder="Search documentation..." />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Search
          </motion.button>
        </div>
      </section>

      <section className="documentation-grid">
        {docs.map((doc, index) => (
          <motion.div
            key={index}
            className="doc-card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            data-aos="fade-up"
          >
            <div className="doc-icon">
              <FontAwesomeIcon icon={doc.icon} />
            </div>
            <h3>{doc.title}</h3>
            <p>{doc.description}</p>
            <ul className="doc-sections">
              {doc.sections.map((section, sIndex) => (
                <li key={sIndex}>
                  <a href="#">{section}</a>
                </li>
              ))}
            </ul>
            <motion.button
              className="view-docs-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Documentation
            </motion.button>
          </motion.div>
        ))}
      </section>

      <section className="quick-links" data-aos="fade-up">
        <h2>Quick Links</h2>
        <div className="quick-links-grid">
          <a href="#" className="quick-link">
            <FontAwesomeIcon icon={faRocket} />
            <span>Quick Start</span>
          </a>
          <a href="#" className="quick-link">
            <FontAwesomeIcon icon={faQuestionCircle} />
            <span>FAQs</span>
          </a>
          <a href="#" className="quick-link">
            <FontAwesomeIcon icon={faTools} />
            <span>Tutorials</span>
          </a>
          <a href="#" className="quick-link">
            <FontAwesomeIcon icon={faFileAlt} />
            <span>API Docs</span>
          </a>
        </div>
      </section>

      <section className="support-section" data-aos="fade-up">
        <h2>Need Help?</h2>
        <p>Our support team is here to help you with any questions</p>
        <div className="support-options">
          <motion.button
            className="primary-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Support
          </motion.button>
          <motion.button
            className="secondary-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Discord
          </motion.button>
        </div>
      </section>
    </div>
  );
}

export default Documentation;
