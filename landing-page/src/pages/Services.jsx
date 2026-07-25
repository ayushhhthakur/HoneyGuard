import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faKey,
  faFileCode,
  faBug,
  faEnvelope,
  faDatabase,
  faChartLine,
  faServer,
  faChevronRight,
  faLock,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { faAws, faGoogle, faMicrosoft, faSlack } from '@fortawesome/free-brands-svg-icons';

function Services() {
  const services = [
    {
      icon: faKey,
      title: "Credential Decoys",
      description: "Inject trackable API keys, database URLs, and root passwords into development directories and source control repositories to trap internal and external threat actors.",
      useCase: "Detect developers copying source code, malicious internal scans, and Git leakage."
    },
    {
      icon: faFileCode,
      title: "Document Beacons",
      description: "Generate Excel sheets, Word files, and PDF guides that beacon back location logs and device markers to HoneyGuard collectors the instant they are opened.",
      useCase: "Track sensitive file leakage, phishing downloads, and intellectual property theft."
    },
    {
      icon: faBug,
      title: "Malware Simulation",
      description: "Deploy binary files mimicking critical cluster configuration scripts or deployment files. Alert security operators whenever they are accessed or execution is attempted.",
      useCase: "Detect host privilege escalations, unauthorized server access, and container breakout tests."
    },
    {
      icon: faEnvelope,
      title: "Email Baits & Traps",
      description: "Seamlessly seed fake corporate addresses and mail credentials into server caches, immediately notifying SOC managers if they are targeted in password spray attacks.",
      useCase: "Expose phishing groups, server mailbox scanning, and email compromise campaigns."
    },
    {
      icon: faDatabase,
      title: "SIEM Collectors",
      description: "Stream webhook telemetry and metadata payloads directly into monitoring stacks, automatically triggering automated remediation policies in real-time.",
      useCase: "Centralize alert logging, sync with existing SOC pipelines, and auto-quarantine."
    },
    {
      icon: faChartLine,
      title: "Threat Intel Analytics",
      description: "Visualize geographical vectors, intruder system fingerprint signatures, and targeted decoy nodes in an interactive incident command dashboard.",
      useCase: "Analyze attack methods, map threat actor groups, and build security audits."
    }
  ];

  const integrationCategories = [
    {
      title: "Cloud Infrastructure Platforms",
      items: [
        { name: "Amazon Web Services", icon: faAws, active: true },
        { name: "Google Cloud Platform", icon: faGoogle, active: true },
        { name: "Microsoft Azure", icon: faMicrosoft, active: true }
      ]
    },
    {
      title: "Communication & Messaging Channels",
      items: [
        { name: "Slack Alerts", icon: faSlack, active: true },
        { name: "Email Server (IMAP)", icon: faEnvelope, active: true },
        { name: "Syslog Endpoint", icon: faServer, active: true }
      ]
    },
    {
      title: "Operational SIEM Pipelines",
      items: [
        { name: "Splunk Daemon", icon: faDatabase, active: true },
        { name: "Elastic Stack", icon: faDatabase, active: true },
        { name: "Custom API Sync", icon: faChevronRight, active: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen py-16 relative">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full text-xs font-mono text-cyber-cyan">
          SERVICE CATALOG
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white leading-tight">
          Active Defense <span className="text-transparent bg-clip-text bg-gradient-to-r from-honey-amber to-yellow-400">Capabilities</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
          Deploy tactical, high-fidelity security traps to detect insider anomalies, network discoveries, and credential breaches.
        </p>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <div key={i} className="cyber-card p-8 rounded-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="w-12 h-12 bg-honey-amber/5 border border-honey-amber/20 rounded flex items-center justify-center mb-6 text-honey-amber">
                  <FontAwesomeIcon icon={s.icon} className="text-xl" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-100 mb-3">{s.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">{s.description}</p>
              </div>
              
              <div className="space-y-4 border-t border-slate-900 pt-4">
                <div className="text-xs text-slate-500 font-mono">
                  <span className="text-honey-amber font-semibold">PRIMARY USE:</span><br />
                  <span className="text-slate-400">{s.useCase}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-600 flex justify-between items-center">
                  <span>METRIC: LOG_INSTANT</span>
                  <span className="flex items-center gap-1 text-cyber-cyan">
                    <span className="w-1 h-1 rounded-full bg-cyber-cyan"></span>
                    MONITORED
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ecosystem Integrations Section */}
      <section className="py-24 border-t border-slate-900 bg-[#06080f]/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-display font-bold text-white">
              Ecosystem Integrations
            </h2>
            <p className="text-slate-400 text-sm font-light max-w-xl mx-auto">
              We sync alert signals directly with your existing infrastructure. No custom code or agents needed in your production containers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {integrationCategories.map((category, idx) => (
              <div key={idx} className="cyber-card p-6 rounded-xl space-y-6">
                <h3 className="font-display font-bold text-sm uppercase text-slate-400 border-l-2 border-cyber-cyan pl-3">
                  {category.title}
                </h3>
                
                <div className="space-y-3">
                  {category.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-3 bg-[#05070c] border border-slate-800 rounded flex items-center justify-between font-mono text-xs text-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-cyber-cyan text-sm w-5 text-center">
                          <FontAwesomeIcon icon={item.icon} />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      <span className="text-[10px] text-cyber-cyan font-bold tracking-widest flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-cyber-cyan"></span>
                        ACTIVE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment SLA CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="cyber-card p-12 rounded-xl text-center space-y-6 border-honey-amber/20 relative overflow-hidden">
          <div className="cyber-scan-line cyber-scan-line-amber"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-honey-amber/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
            Custom Security Integration Required?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto font-light leading-relaxed">
            We provide on-premise monitoring consoles, private VPC subnet beacon routing, and compliance SLAs (SOC2/HIPAA) for enterprise customers requiring offline systems.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <a href="mailto:contact.ideatex@gmail.com" className="btn-cyber-amber px-8 py-3 rounded text-sm">
              Contact Infrastructure Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Services;
