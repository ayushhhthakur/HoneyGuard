import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faShieldHalved,
  faRocket,
  faCrown,
  faPlus,
  faMinus,
  faChevronDown,
  faCoins
} from '@fortawesome/free-solid-svg-icons';

function Pricing() {
  const [activeFaq, setActiveFaq] = useState(null);
  
  // Cost Savings Calculator State
  const [breaches, setBreaches] = useState(1);
  const [companySize, setCompanySize] = useState(250); // employees

  // Mock pricing calculations
  const avgBreachCost = 4.45; // $4.45 Million average breach cost (IBM report)
  const estimatedSavings = (breaches * avgBreachCost).toFixed(2);

  const plans = [
    {
      icon: faShieldHalved,
      name: "Starter",
      price: "199",
      description: "Ideal for startups and independent application developers.",
      features: [
        "10 Active Honeytokens",
        "Standard Webhook Notifications",
        "Geographical Threat Mapping",
        "24-Hour Alert Logs History",
        "Discord Community Support",
        "Standard JSON/YAML Formats"
      ]
    },
    {
      icon: faRocket,
      name: "Professional",
      price: "499",
      description: "Designed for mid-sized networks and active security teams.",
      features: [
        "50 Active Honeytokens",
        "Immediate SIEM Integration Hooks",
        "AI-Powered Decoy Mimicry",
        "30-Day Alert Logs Retention",
        "Priority Slack Channel Support",
        "Custom Beacon Domain Mapping",
        "Autonomous Threat Quarantines",
        "Weekly Vulnerability Reports"
      ],
      popular: true
    },
    {
      icon: faCrown,
      name: "Enterprise",
      price: "Custom",
      description: "For corporate SOC infrastructures requiring offline systems.",
      features: [
        "Unlimited Honeytokens",
        "On-Premise Beacon Nodes",
        "Dedicated Telemetry Subnets",
        "Custom Token Type Development",
        "SLA Response Guarantee (15m)",
        "Single Sign-On (SAML/OIDC)",
        "SOC2/ISO27001 Compliance",
        "24/7 Dedicated Support Hotline"
      ]
    }
  ];

  const faqs = [
    {
      question: "How do Honeytokens alert without causing performance lag?",
      answer: "Honeytokens are passive resources (file descriptors, database credentials, API configurations). They do not run software, agents, or daemons in your production environment. The moment an attacker attempts authentication or loads a document tracker, the request hits HoneyGuard's high-speed callback nodes directly. Telemetry is gathered off-system, causing zero local performance lag."
    },
    {
      question: "Are there risks of false positives?",
      answer: "No. Because Honeytokens are fake resources with zero legitimate operational utility, there is no valid reason for any employee, server daemon, or scanner to access them. Any access attempt is, by definition, unauthorized, resulting in a 99.9% true-positive threat alert accuracy rate."
    },
    {
      question: "Can we deploy Honeytokens inside our local network behind a firewall?",
      answer: "Yes. For our Enterprise customers, we offer localized Private Beacon Nodes that can be installed directly inside your private subnets, routing logging alerts locally to your internal SIEM (e.g. Splunk) without sending outbound traffic to the public internet."
    },
    {
      question: "What happens if a Honeytoken is accessed by our internal backup scripts?",
      answer: "You can easily exclude specific backup daemon IP ranges or system user-agents directly inside your HoneyGuard console settings, preventing administrative scripts from triggering incident notifications."
    }
  ];

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen py-16 relative">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full text-xs font-mono text-cyber-cyan">
          PRICING STRUCTURE
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white leading-tight">
          Flexible Plans for <span className="text-honey-amber text-glow-amber">Active Defense</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
          Choose a threat detection tier sized to your network infrastructure. Deploy bait tokens in minutes.
        </p>
      </section>

      {/* Pricing Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`cyber-card rounded-xl p-8 flex flex-col justify-between relative ${
                p.popular
                  ? 'border-cyber-cyan/40 bg-cyber-cyan/[0.03] shadow-[0_0_30px_rgba(0,240,255,0.06)] lg:scale-105 z-10'
                  : 'border-white/5'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-cyber-cyan text-[#070a13] font-display text-[10px] tracking-widest font-bold px-3 py-1 rounded-full">
                  MOST DEPLOYED
                </span>
              )}
              
              <div className="space-y-6">
                <div className={`w-12 h-12 rounded flex items-center justify-center border ${
                  p.popular
                    ? 'bg-cyber-cyan/10 border-cyber-cyan/30 text-cyber-cyan text-glow-cyan'
                    : 'bg-slate-800/40 border-white/5 text-slate-400'
                }`}>
                  <FontAwesomeIcon icon={p.icon} className="text-xl" />
                </div>

                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-100">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-light leading-relaxed">{p.description}</p>
                </div>

                <div className="pt-2">
                  {p.price === 'Custom' ? (
                    <span className="text-3xl font-display font-bold text-white">CONTACT US</span>
                  ) : (
                    <div className="flex items-baseline">
                      <span className="text-slate-500 text-lg font-mono">$</span>
                      <span className="text-5xl font-display font-bold text-white mx-1">{p.price}</span>
                      <span className="text-slate-500 text-xs font-mono">/ Month</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3.5 border-t border-slate-900 pt-6 text-xs text-slate-400 font-mono">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5">
                      <FontAwesomeIcon icon={faCheck} className="text-cyber-cyan mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <button className={`w-full py-3.5 rounded text-xs font-semibold uppercase tracking-wider ${
                  p.popular ? 'btn-cyber-cyan' : 'btn-cyber-outline'
                }`}>
                  {p.price === 'Custom' ? 'Initiate SLA Audit' : 'Initialize Node'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Savings Calculator (Interactive Sandbox) */}
      <section className="py-24 border-t border-slate-900 bg-[#06080f]/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex p-3 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full text-cyber-cyan text-xl">
                <FontAwesomeIcon icon={faCoins} />
              </div>
              <h2 className="text-3xl font-display font-bold text-white leading-tight">
                Defensive Savings<br />
                Calculator
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Breach costs compile rapidly due to detection latency. By reducing discovery delays from months to milliseconds, HoneyGuard helps prevent costly database exfiltration cycles.
              </p>
              
              <div className="space-y-5 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-2">
                    <span>ESTIMATED BREACHES PREVENTED:</span>
                    <span className="text-honey-amber font-bold">{breaches}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={breaches}
                    onChange={(e) => setBreaches(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-honey-amber"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-2">
                    <span>COMPANY USER NODES:</span>
                    <span className="text-cyber-cyan font-bold">{companySize} Employees</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={companySize}
                    onChange={(e) => setCompanySize(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-900 border border-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 cyber-card p-8 rounded-xl space-y-6 border-cyber-cyan/20 bg-cyber-cyan/[0.01]">
              <div className="cyber-scan-line"></div>
              
              <h3 className="font-display font-bold text-xs uppercase tracking-widest text-slate-500">
                ESTIMATED BREACH MITIGATION SAVINGS
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-900">
                <div>
                  <div className="text-4xl sm:text-5xl font-display font-bold text-white">
                    ${estimatedSavings}<span className="text-2xl text-honey-amber">M</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 mt-2 uppercase tracking-wider">
                    Prevented Telemetry Leakage Costs
                  </div>
                </div>

                <div className="space-y-2.5 text-xs font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Industry Avg Cost/Breach:</span>
                    <span className="text-slate-300">$4.45M</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mean Discovery Window:</span>
                    <span className="text-slate-300">204 Days</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-2 text-cyber-cyan">
                    <span>HoneyGuard Delay:</span>
                    <span>&lt;0.01 Sec</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#04060b] p-4 rounded border border-white/5 text-[10px] font-mono text-slate-500 leading-relaxed">
                *Calculation factors industry metrics compiled in the IBM Cost of a Data Breach Report. Absolute savings are dependent on deployment architectures and active decoy response speed.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Accordion FAQ drawer */}
      <section className="py-24 border-t border-slate-900 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-display font-bold text-white text-center mb-16">
          Frequently Answered Telemetries
        </h2>

        <div className="space-y-4 font-mono text-xs">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#04060b]/60 border border-slate-900 rounded-lg overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-slate-900/40"
              >
                <span className="font-semibold text-slate-200">{faq.question}</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-slate-500 transition-transform duration-300 ${
                    activeFaq === index ? 'rotate-180 text-cyber-cyan' : ''
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === index && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-1 text-slate-400 leading-relaxed border-t border-slate-900/60 font-sans text-sm font-light">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Pricing;
