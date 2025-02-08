import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faShieldAlt,
  faRocket,
  faCrown,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

function Pricing() {
  const plans = [
    {
      icon: faShieldAlt,
      name: "Starter",
      price: "5",
      description: "Perfect for small projects and startups",
      features: [
        "5 Dynamic Honeytokens",
        "Basic Threat Detection",
        "Daily Security Reports",
        "Email Support",
        "Basic API Access",
        "Community Forum Access"
      ]
    },
    {
      icon: faRocket,
      name: "Professional",
      price: "10",
      description: "Ideal for growing projects and businesses",
      features: [
        "20 Dynamic Honeytokens",
        "Advanced Threat Detection",
        "Real-time Monitoring",
        "Priority Support",
        "Full API Access",
        "Custom Token Templates",
        "Automated Alerts",
        "Threat Analytics"
      ]
    },
    {
      icon: faCrown,
      name: "Enterprise",
      price: "Custom",
      description: "For large-scale security requirements",
      features: [
        "Unlimited Honeytokens",
        "Custom Security Solutions",
        "24/7 Dedicated Support",
        "Custom API Integration",
        "Advanced Threat Detection",
        "Custom Reporting",
        "On-premise Deployment",
        "SLA Guarantee"
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
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Choose the perfect plan for your security needs
        </motion.p>
      </section>

      {/* Pricing Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 bg-white/5 backdrop-blur-lg rounded-2xl border ${
                plan.name === 'Professional' 
                  ? 'border-[#00ff9d] shadow-lg shadow-[#00ff9d]/10' 
                  : 'border-white/10 hover:border-[#00ff9d]/50'
              } transition-all duration-300`}
            >
              {plan.name === 'Professional' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-[#00ff9d]/20 to-[#64ffda]/20 rounded-xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={plan.icon} className="text-2xl text-[#00ff9d]" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <span className="text-3xl font-bold text-white">Contact Us</span>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-gray-400 text-xl">$</span>
                      <span className="text-4xl font-bold text-white mx-1">{plan.price}</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 mb-8">{plan.description}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <motion.li 
                      key={fIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + fIndex * 0.1 }}
                      className="flex items-center space-x-3 text-gray-300"
                    >
                      <FontAwesomeIcon icon={faCheck} className="text-[#00ff9d] text-sm" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all duration-300 ${
                    plan.name === 'Professional'
                      ? 'bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] hover:shadow-lg hover:shadow-[#00ff9d]/20'
                      : 'border border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10'
                  }`}
                >
                  <span>{plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}</span>
                  <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-3xl font-bold text-center mb-12 text-white"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              question: "Can I change plans later?",
              answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
            },
            {
              question: "What payment methods do you accept?",
              answer: "We accept all major credit cards, cryptocurrency payments, and wire transfers for enterprise customers."
            },
            {
              question: "Is there a free trial?",
              answer: "Yes, we offer a 14-day free trial for all our plans. No credit card required."
            },
            {
              question: "What's included in the Enterprise plan?",
              answer: "Enterprise plans are customized to your needs and include dedicated support, custom integrations, and advanced security features."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
              <p className="text-gray-400">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-12 bg-gradient-to-r from-[#00ff9d]/10 to-transparent backdrop-blur-lg rounded-3xl border border-[#00ff9d]/20 text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-gradient">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Contact our sales team to create a custom plan that fits your security requirements
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] px-8 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-all duration-300"
          >
            Contact Sales
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}

export default Pricing;
