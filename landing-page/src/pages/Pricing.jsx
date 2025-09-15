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
      price: "499",
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
      price: "999",
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
    <div className="min-h-screen py-20 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold mb-6 text-gradient"
        >
          Simple, Transparent Pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-600 max-w-2xl mx-auto"
        >
          Choose the perfect plan for your security needs. All plans include our core features.
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
              className={`card-modern relative ${
                plan.name === 'Professional'
                  ? 'border-emerald-300 shadow-2xl shadow-emerald-500/20 scale-105'
                  : 'hover:shadow-xl hover:shadow-slate-500/10'
              }`}
            >
              {plan.name === 'Professional' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                  <FontAwesomeIcon icon={plan.icon} className="text-2xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{plan.name}</h3>
                <div className="mb-6">
                  {plan.price === 'Custom' ? (
                    <div className="text-3xl font-bold text-slate-900">Contact Us</div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-slate-500 text-xl">$</span>
                      <span className="text-4xl font-bold text-slate-900 mx-1">{plan.price}</span>
                      <span className="text-slate-500">/month</span>
                    </div>
                  )}
                </div>
                <p className="text-slate-600 mb-8 leading-relaxed">{plan.description}</p>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <motion.li
                      key={fIndex}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + fIndex * 0.1 }}
                      className="flex items-center space-x-3 text-slate-700"
                    >
                      <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0"></div>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.name === 'Professional'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
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
          className="text-4xl md:text-5xl font-bold text-center mb-12 text-slate-900"
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
              className="card-modern p-6"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-3">{faq.question}</h3>
              <p className="text-slate-600">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="glass-effect p-12 rounded-3xl border-emerald-200/50 text-center bg-gradient-to-r from-emerald-50/30 to-teal-50/30"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Contact our sales team to create a custom plan that fits your security requirements
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-primary px-8 py-4 text-lg"
          >
            Contact Sales
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}

export default Pricing;
