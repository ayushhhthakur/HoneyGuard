import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faRobot,
  faCode,
  faBolt,
  faGears,
  faChartLine,
  faFileCode,
  faMicrochip,
  faCheckCircle,
  faKey,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

function Features() {
  const [activeCodeTab, setActiveCodeTab] = useState('api'); // api, doc, malware

  const codeSnippets = {
    api: {
      title: "Active AWS API Decoy Configuration",
      lang: "json",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::production-backup-tokens",
      "Condition": {
        "StringLike": {
          "aws:userId": "AIDA_DECOY_NODE_HG78"
        }
      }
    }
  ]
}
// ALERT WEBHOOK URL: https://alert-node.honeyguard.io/hooks/s3-decoy`
    },
    doc: {
      title: "PDF Tracker Beacon Initialization",
      lang: "javascript",
      code: `// HoneyGuard Document Tracker Compiler v1.2
const pdfDocument = await PDF.load('./templates/financial_audit.pdf');

// Embed high-fidelity tracking beacon linked to AWS presigned S3 url
const beaconUri = 'https://beacon.honeyguard.io/tr/doc-audit-q4.png';
pdfDocument.addTrackingPixel({
  url: beaconUri,
  triggerOnOpen: true,
  extractMetadata: ['IP', 'User-Agent', 'DNS-Leak']
});

await pdfDocument.save('./output/q4_payroll_master.pdf');`
    },
    malware: {
      title: "Fake Binary Trojan Simulator Config",
      lang: "yaml",
      code: `# HoneyGuard Malware Simulator Decoy Descriptor
metadata:
  binary_name: "prod_k8s_cluster_deployment_tool.exe"
  mimic_size_bytes: 8492010
  signature_hash: "da39a3ee5e6b4b0d3255bfef95601890afd80709"
alert_policy:
  trigger_handshake: TCP_PORT_CLOSE_ATTEMPT
  syslog_notify: true
  callback_endpoint: "https://collector.honeyguard.io/v2/handshake/node-998"`
    }
  };

  const features = [
    {
      icon: faKey,
      title: "Dynamic Credentials",
      description: "Generates realistic AWS access keys, database passwords, and API credentials that link immediately to telemetry alert channels.",
      details: ["AWS, GCP, Azure keys", "DB configs & connection strings", "Mimics active environments", "No system overhead"]
    },
    {
      icon: faFileCode,
      title: "Document Tracking",
      description: "Embeds invisible beacon callbacks within PDFs, Word files, and Excel tables to alert when documents are opened or moved.",
      details: ["Invisible tracker pixels", "Presigned S3 callback loops", "Document leakage logs", "Automatic metadata grab"]
    },
    {
      icon: faMicrochip,
      title: "Binary Mimicry",
      description: "Deploys fake scripts, executables, or compressed archives that trigger immediate threat alerts the moment they are compiled or extracted.",
      details: ["Dummy .exe & .sh files", "Compressed archive baits", "Malware signature matches", "System folder placements"]
    },
    {
      icon: faBolt,
      title: "Instant Webhooks",
      description: "Sends incident logging signals to security pipelines the exact millisecond a honeypot resource is targeted.",
      details: ["<10ms routing delay", "Slack/Discord pipes", "Real-time SMS notifies", "Autonomous node tracking"]
    },
    {
      icon: faGears,
      title: "SIEM Sync Integrations",
      description: "Pipes telemetry feeds directly into your operational security hubs like Splunk, Datadog, or Elasticsearch.",
      details: ["Splunk collector API", "Elasticsearch indexes", "Custom webhook formats", "CLI tooling agent"]
    },
    {
      icon: faRobot,
      title: "AI Mimic Optimization",
      description: "Uses system scanning agents to analyze real system file names, variables, and formats, dynamically creating matched decoys.",
      details: ["Infrastructure audits", "Matched naming models", "Auto-deploy schedules", "Telemetry correlations"]
    }
  ];

  return (
    <div className="min-h-screen py-16 relative">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-honey-amber/10 border border-honey-amber/20 rounded-full text-xs font-mono text-honey-amber">
          DEFENSIVE ARCHITECTURE
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white leading-tight">
          High-Fidelity <span className="text-cyber-cyan text-glow-cyan">Decoy Capabilities</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
          Configure, generate, and monitor trackable security triggers across multiple digital assets in one unified platform.
        </p>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="cyber-card p-8 rounded-xl flex flex-col justify-between space-y-6">
              <div>
                <div className="w-12 h-12 bg-cyber-cyan/5 border border-cyber-cyan/20 rounded flex items-center justify-center mb-6 text-cyber-cyan">
                  <FontAwesomeIcon icon={f.icon} className="text-xl" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-100 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">{f.description}</p>
                <ul className="space-y-2.5 font-mono text-xs text-slate-500">
                  {f.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-2 text-[10px] font-mono text-slate-600 flex items-center justify-between">
                <span>SECTOR: 0{i + 1}</span>
                <span className="text-cyber-cyan">ACTIVE</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Code Visualizer Section */}
      <section className="py-24 border-t border-slate-900 bg-[#06080f]/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visualizer text */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl font-display font-bold text-white leading-tight">
                Decoy Initialization<br />
                Under the Hood
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Honeytokens should look and behave exactly like real resources to fool seasoned attackers. Review the configuration formats below to see how easy it is to define bait nodes that generate alerts automatically when touched.
              </p>
              
              <div className="space-y-3 font-mono text-sm">
                {[
                  { id: 'api', label: 'AWS Credential Block', desc: 'JSON format deployment' },
                  { id: 'doc', label: 'PDF Tracking Pixel', desc: 'JavaScript beacon loader' },
                  { id: 'malware', label: 'Fake Binary Descriptor', desc: 'YAML binary mimic config' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCodeTab(item.id)}
                    className={`w-full text-left p-3.5 rounded border flex items-center justify-between transition-all ${
                      activeCodeTab === item.id
                        ? 'border-cyber-cyan bg-cyber-cyan/10 text-slate-100'
                        : 'border-slate-800 hover:border-slate-700 bg-transparent text-slate-500'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs tracking-wider text-slate-200">{item.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                    </div>
                    <FontAwesomeIcon icon={faArrowRight} className={`text-xs transition-transform ${
                      activeCodeTab === item.id ? 'translate-x-1 text-cyber-cyan' : 'text-slate-600'
                    }`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Code Block visualizer container */}
            <div className="lg:col-span-7 flex flex-col bg-[#04060b] border border-slate-900 rounded-xl overflow-hidden shadow-2xl">
              <div className="terminal-header px-4 py-3 flex items-center justify-between border-b border-slate-900">
                <span className="font-mono text-xs text-slate-500">{codeSnippets[activeCodeTab].title}</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-400 uppercase font-mono">
                  {codeSnippets[activeCodeTab].lang}
                </span>
              </div>
              <pre className="p-5 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto whitespace-pre select-all min-h-[300px]">
                {codeSnippets[activeCodeTab].code}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Speed & Comparison Dashboard */}
      <section className="py-24 border-t border-slate-900 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-display font-bold text-white">
            Breach Detection Response Matrix
          </h2>
          <p className="text-slate-400 text-sm font-light max-w-xl mx-auto">
            Traditional security works from logging layers, compiling alerts hours after intrusion. HoneyGuard works at injection levels, triggering instant alerts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional Terminal logs */}
          <div className="bg-[#04060b]/60 border border-slate-900 rounded-xl overflow-hidden flex flex-col justify-between min-h-[320px]">
            <div className="terminal-header px-4 py-2 border-b border-slate-900 flex justify-between items-center">
              <span className="font-mono text-xs text-slate-500">Traditional firewall_syslog.log</span>
              <span className="text-[10px] font-mono text-cyber-crimson uppercase">Passive Monitor</span>
            </div>
            
            <div className="p-4 font-mono text-xs text-slate-500 space-y-2.5 flex-grow select-none">
              <div>[19:02:11] LOG: Connection handshake accepted.</div>
              <div>[19:15:32] LOG: Database read queries executing (50k rows).</div>
              <div>[19:40:02] LOG: High volume output piped to external IP.</div>
              <div className="text-cyber-crimson">[20:10:44] ALERT: Anomaly detector flags network outbound spikes.</div>
              <div className="text-slate-600">// Breach detected ~1 hour after exfiltration completes.</div>
            </div>

            <div className="bg-[#080d16] px-4 py-3 border-t border-slate-900 text-center font-mono text-xs text-cyber-crimson">
              DETECTION DELAY: 1 Hour 8 Minutes
            </div>
          </div>

          {/* HoneyGuard alerts logs */}
          <div className="bg-[#04060b]/60 border border-cyber-cyan/20 rounded-xl overflow-hidden flex flex-col justify-between min-h-[320px] shadow-lg shadow-cyber-cyan/5">
            <div className="terminal-header px-4 py-2 border-b border-slate-900 flex justify-between items-center bg-[#070a13]">
              <span className="font-mono text-xs text-slate-200">HoneyGuard real_time_beacon.log</span>
              <span className="text-[10px] font-mono text-cyber-cyan uppercase animate-pulse">Active Decoy</span>
            </div>
            
            <div className="p-4 font-mono text-xs text-slate-300 space-y-2.5 flex-grow select-none">
              <div>[19:02:11] LOG: Decoy key AKIAIOSFODNN7 accessed.</div>
              <div className="text-cyber-cyan text-glow-cyan font-semibold">[19:02:11.002] ALERT: BREACH TRIGGERED ON DECOY KEY [prod-s3-key]</div>
              <div>[19:02:11.010] METADATA: Source: 198.51.100.72 (Ukraine)</div>
              <div>[19:02:11.015] ACTION: Automatic firewall drop initialized for 198.51.100.72.</div>
              <div className="text-slate-500">// Attacker locked down before exfiltration could start.</div>
            </div>

            <div className="bg-cyber-cyan/15 px-4 py-3 border-t border-cyber-cyan/30 text-center font-mono text-xs text-cyber-cyan font-semibold">
              DETECTION DELAY: 0.002 Seconds (Instant)
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Features;
