import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCode,
  faTerminal,
  faNetworkWired,
  faCopy,
  faCheck,
  faExclamationTriangle,
  faSearch
} from '@fortawesome/free-solid-svg-icons';

function Documentation() {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navItems = [
    { id: 'getting-started', label: '1. Getting Started', icon: faBook },
    { id: 'api-reference', label: '2. API Reference', icon: faCode },
    { id: 'doc-tracking', label: '3. Document Tracking', icon: faNetworkWired },
    { id: 'siem-sync', label: '4. SIEM Integration', icon: faTerminal }
  ];

  const content = {
    'getting-started': {
      title: "Quick Start & Deployment",
      desc: "Get started with HoneyGuard. Learn how to deploy decoy nodes and active tokens directly in your cloud environments.",
      steps: [
        {
          num: "01",
          title: "Install the HoneyGuard CLI",
          detail: "Manage credentials and deploy bait templates locally using our Node.js helper utility.",
          code: "npm install -g @honeyguard/cli",
          command: "npm install -g @honeyguard/cli"
        },
        {
          num: "02",
          title: "Authorize Command Node",
          detail: "Authenticate your shell session using the security token generated in your cloud dashboard.",
          code: "honeyguard login --token <your_auth_token>",
          command: "honeyguard login --token secret_hg_auth_token_9901"
        },
        {
          num: "03",
          title: "Deploy First API Bait",
          detail: "Construct an AWS access key decoy model, syncing alerts with your local webhook endpoint.",
          code: "honeyguard deploy --type api --name aws-s3-prod-token",
          command: "honeyguard deploy --type api --name aws-s3-prod-token"
        }
      ]
    },
    'api-reference': {
      title: "API Credentials Schemas",
      desc: "Our collector endpoints accept HTTPS handshake callbacks. Review trigger parameters and authentication keys below.",
      steps: [
        {
          num: "01",
          title: "Webhook Telemetry Endpoint",
          detail: "HTTP POST requests to our collector record intruder connection parameters instantly.",
          code: "POST https://collector.honeyguard.io/v1/trigger/{decoy_id}\nContent-Type: application/json\n\n{\n  \"attacker_ip\": \"185.190.140.23\",\n  \"user_agent\": \"Mozilla/5.0...\",\n  \"handshake_port\": 5432\n}",
          command: "POST https://collector.honeyguard.io/v1/trigger/{decoy_id}\nContent-Type: application/json\n\n{\n  \"attacker_ip\": \"185.190.140.23\",\n  \"user_agent\": \"Mozilla/5.0...\",\n  \"handshake_port\": 5432\n}"
        },
        {
          num: "02",
          title: "Alert Hook Response payload",
          detail: "Successful triggers return HTTP status 202 Accepted. Telemetry processing runs out-of-band.",
          code: "HTTP/1.1 202 Accepted\nContent-Type: application/json\n\n{\n  \"status\": \"incident_logged\",\n  \"incident_id\": \"HG-8820-A\",\n  \"routing_latency_ms\": 0.04\n}",
          command: "HTTP/1.1 202 Accepted\nContent-Type: application/json\n\n{\n  \"status\": \"incident_logged\",\n  \"incident_id\": \"HG-8820-A\",\n  \"routing_latency_ms\": 0.04\n}"
        }
      ]
    },
    'doc-tracking': {
      title: "Document Beacon Insertion",
      desc: "We embed tracking pixel signatures directly within file headers. Read instructions below for compiling beacon objects.",
      steps: [
        {
          num: "01",
          title: "Setup PDF Beacon Tracking",
          detail: "Insert tracking coordinates during file compile processes. Ensure triggers are set to capture dns leakage data.",
          code: "honeyguard doc --compile --input audit_draft.pdf --beacon-id doc-payroll-trap",
          command: "honeyguard doc --compile --input audit_draft.pdf --beacon-id doc-payroll-trap"
        },
        {
          num: "02",
          title: "Verify File System Triggers",
          detail: "Ensure directories host the trackable file. Accessing or copying triggers the beacon pixel callback.",
          code: "ls -la /shared/finance/secure/\n-rwxr-xr-x 1 root root 82010 Jul 24 23:10 Q4_Payroll_Baits.pdf",
          command: "ls -la /shared/finance/secure/\n-rwxr-xr-x 1 root root 82010 Jul 24 23:10 Q4_Payroll_Baits.pdf"
        }
      ]
    },
    'siem-sync': {
      title: "SIEM Systems Synchronization",
      desc: "Pipe trigger logs directly to external security monitoring nodes (Splunk, Elastic, Datadog).",
      steps: [
        {
          num: "01",
          title: "Define Daemon Webhook Destination",
          detail: "Map callback dispatch channels. Log entries will compile into standard CEF (Common Event Format) payloads.",
          code: "honeyguard config --siem splunk --endpoint https://splunk-hec.corp.internal:8088",
          command: "honeyguard config --siem splunk --endpoint https://splunk-hec.corp.internal:8088"
        },
        {
          num: "02",
          title: "Test Logging handshakes",
          detail: "Dispatch a mock test alert packet to confirm connection channels work.",
          code: "honeyguard test --target splunk-hec",
          command: "honeyguard test --target splunk-hec"
        }
      ]
    }
  };

  const currentContent = content[activeSection];

  return (
    <div className="min-h-screen py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section with search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-slate-900 pb-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full text-xs font-mono text-cyber-cyan">
              ENGINEERING RESOURCES
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white">Documentation Explorer</h1>
            <p className="text-slate-400 text-sm font-light">Deploy codes, API schemas, and active token hooks.</p>
          </div>
          
          <div className="relative max-w-xs w-full">
            <span className="absolute left-3 top-3.5 text-slate-500 text-sm">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input
              type="text"
              placeholder="Search schemas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#05070c] border border-slate-900 rounded pl-9 pr-4 py-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-cyber-cyan"
            />
          </div>
        </div>

        {/* Documentation Layout Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Nav Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs uppercase font-mono tracking-widest text-slate-500 mb-4 pl-3">
              Surveillance Topics
            </div>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left p-4 rounded border flex items-center gap-4 transition-all duration-300 font-mono text-xs ${
                  activeSection === item.id
                    ? 'border-cyber-cyan bg-cyber-cyan/10 text-white'
                    : 'border-slate-800 bg-[#070a13]/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className={activeSection === item.id ? 'text-cyber-cyan' : 'text-slate-500'} />
                <span>{item.label}</span>
              </button>
            ))}

            <div className="cyber-card p-5 rounded-xl border-slate-800 mt-6 space-y-3 bg-[#0e1322]/20">
              <div className="flex items-center gap-2 text-honey-amber text-xs font-mono font-bold">
                <FontAwesomeIcon icon={faExclamationTriangle} />
                <span>IMPORTANT SEC-RULE</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-light">
                Do not upload actual Honeytoken authorization credentials directly inside open Github directories. Use environmental configurations or secure configuration managers.
              </p>
            </div>
          </div>

          {/* Main Docs Content Panel */}
          <div className="lg:col-span-8 space-y-8">
            <div className="cyber-card p-8 rounded-xl border-slate-900 bg-[#0e1322]/30 relative">
              <div className="cyber-scan-line"></div>
              
              <h2 className="text-2xl font-display font-bold text-slate-100 mb-3">
                {currentContent.title}
              </h2>
              <p className="text-slate-400 text-sm font-light leading-relaxed mb-8">
                {currentContent.desc}
              </p>

              <div className="space-y-8 border-t border-slate-900/60 pt-8">
                {currentContent.steps.map((step, idx) => (
                  <div key={idx} className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="font-mono text-sm text-cyber-cyan font-bold bg-cyber-cyan/10 border border-cyber-cyan/30 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                        {step.num}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-200 text-sm">{step.title}</h3>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed font-light">{step.detail}</p>
                      </div>
                    </div>

                    <div className="relative group rounded overflow-hidden">
                      <button
                        onClick={() => copyToClipboard(step.code)}
                        className="absolute right-3 top-3.5 bg-slate-900/80 border border-slate-800 hover:bg-slate-800/80 p-1.5 rounded text-slate-400 hover:text-slate-200 text-[10px] flex items-center gap-1.5 transition-colors font-mono"
                      >
                        {copied ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="text-cyber-cyan" />
                            <span>COPIED!</span>
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faCopy} />
                            <span>COPY</span>
                          </>
                        )}
                      </button>
                      
                      <pre className="p-4 bg-[#04060b] border border-slate-900 font-mono text-[11px] text-slate-300 leading-relaxed overflow-x-auto whitespace-pre">
                        {step.code}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default Documentation;
