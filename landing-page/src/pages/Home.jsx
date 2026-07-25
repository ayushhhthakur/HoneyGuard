import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldHalved,
  faTerminal,
  faLock,
  faGlobe,
  faDatabase,
  faFileCode,
  faKey,
  faPlay,
  faUserSecret,
  faCheckCircle,
  faExclamationTriangle,
  faMicrochip,
  faClock,
  faWifi
} from '@fortawesome/free-solid-svg-icons';

function Home() {
  // Sandbox State
  const [selectedType, setSelectedType] = useState('api'); // api, doc, db
  const [decoyName, setDecoyName] = useState('aws-s3-prod-key');
  const [sandboxStep, setSandboxStep] = useState('config'); // config, simulating, alerts
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  const tokenTemplates = {
    api: {
      label: 'AWS Cloud API Key',
      defaultName: 'aws-s3-backup-token',
      snippet: (name) => `{
  "aws_access_key_id": "AKIAIOSFODNN7EXAMPLE",
  "aws_secret_access_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "metadata_callback": "https://api.honeyguard.io/v1/trigger/${name}"
}`
    },
    doc: {
      label: 'Financial Excel Spreadsheet',
      defaultName: 'q4_payroll_master.xlsx',
      snippet: (name) => `[File System Decoy Object]
Type: Excel 2021 Document (.xlsx)
Binary Size: 1.2 MB
Tracking Webhook: https://beacon.honeyguard.io/tr/${name}.png
Embedded Beacon: Embedded S3 Signed URL Tracking Pixel`
    },
    db: {
      label: 'Database Credentials',
      defaultName: 'production-user-credentials',
      snippet: (name) => `DATABASE_URL=postgresql://db_honey_admin:db_pass_decoys99@postgres-prod-replica.honeyguard.internal:5432/${name}
# Decoy credentials linked to trigger alerts immediately upon connection handshake.`
    }
  };

  useEffect(() => {
    if (selectedType) {
      setDecoyName(tokenTemplates[selectedType].defaultName);
    }
  }, [selectedType]);

  const runSimulation = () => {
    setSandboxStep('simulating');
    setLogs([]);
    
    const logsSequence = [
      { text: `[SYSTEM] Generating dynamic honeytoken decoy: "${decoyName}"...`, delay: 200 },
      { text: `[SYSTEM] Syncing active monitoring nodes with global HoneyGuard SIEM pipes...`, delay: 700 },
      { text: `[SYSTEM] Decoy successfully injected into target directory. Monitoring active.`, delay: 1200 },
      { text: `[WAITING] Awaiting intruder engagement... (Simulating hacker network discovery)`, delay: 2200 },
      { text: `[ATTACK] >>> Intruder connection handshake detected from IP 198.51.100.72`, delay: 3500 },
      { text: `[ALERT] UNUASUAL ACCESS DETECTED ON DECOY: [${decoyName}]`, delay: 4200, isAlert: true },
      { text: `[METADATA] Geolocation: Kiev, Ukraine | Latitude: 50.45, Longitude: 30.52`, delay: 4800 },
      { text: `[METADATA] Agent Profile: Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0`, delay: 5400 },
      { text: `[METADATA] Request Payload: attempting database authentication handshake`, delay: 6000 },
      { text: `[ACTION] Logging telemetry, matching signatures, and sending webhook dispatch...`, delay: 6600 },
      { text: `[SUCCESS] Slack incident notification pushed to #soc-alerts (ID: HG-8812)`, delay: 7200 },
      { text: `[SUCCESS] Splunk dashboard synchronized. Threat intelligence updated.`, delay: 7800 },
      { text: `[SYSTEM] Decoy neutralized. Command node locked. Simulation complete.`, delay: 8400 }
    ];

    logsSequence.forEach((log) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
      }, log.delay);
    });

    setTimeout(() => {
      setSandboxStep('alerts');
    }, 9000);
  };

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Immersive Cyber Header/Hero Section */}
      <section className="relative pt-12 pb-24 md:py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyber-cyan/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-honey-amber/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Hero text content */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full text-xs font-mono tracking-widest text-cyber-cyan">
              <span className="w-2 h-2 bg-cyber-cyan rounded-full animate-ping"></span>
              ACTIVE THREAT DEFENSE V2.8
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-bold leading-none tracking-tight text-white">
              Lure Intruders.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-honey-amber via-yellow-400 to-cyber-cyan">
                Expose Breaches
              </span><br />
              Instantly.
            </h1>

            <p className="text-slate-400 text-lg sm:text-xl font-light leading-relaxed max-w-2xl">
              Stop relying solely on passive barriers. Deploy intelligent, AI-powered honeytoken decoys across files, cloud credentials, and databases. Detect inside threats and advanced phishing before data exfiltration occurs.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <a href="#sandbox" className="btn-cyber-amber px-8 py-3 rounded text-sm flex items-center gap-2">
                <FontAwesomeIcon icon={faTerminal} />
                <span>Launch Sandbox</span>
              </a>
              <Link to="/pricing" className="btn-cyber-outline px-8 py-3 rounded text-sm">
                View Security Plans
              </Link>
            </div>

            {/* Micro Stats indicators */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-900 font-mono">
              <div>
                <div className="text-2xl font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="text-cyber-cyan">0</span>ms
                </div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Alert Latency</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">99.9%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">True Positive</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">10s</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Deploy Time</div>
              </div>
            </div>
          </div>

          {/* Hero visual grid elements (Decoy Map visualization) */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-cyber-cyan to-honey-amber rounded-2xl blur opacity-25" />
            <div className="relative bg-[#0e1322] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-pulse"></span>
                  <span className="text-slate-400">SIEM MONITORING HUB</span>
                </div>
                <span className="text-slate-500">SYS_OK: SECURE</span>
              </div>

              {/* Graphical radar decoy state */}
              <div className="relative aspect-video bg-[#05070c] rounded-lg border border-slate-900/60 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-cyber-cyan/[0.01] cyber-grid"></div>
                <div className="absolute w-24 h-24 rounded-full border border-cyber-cyan/10 animate-ping"></div>
                <div className="absolute w-48 h-48 rounded-full border border-cyber-cyan/5"></div>
                
                {/* Node icons representation */}
                <div className="absolute top-1/4 left-1/3 text-honey-amber text-glow-amber">
                  <FontAwesomeIcon icon={faDatabase} className="text-xl" />
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[9px] font-mono text-slate-500">db-replica</div>
                </div>

                <div className="absolute top-1/2 right-1/4 text-cyber-cyan text-glow-cyan">
                  <FontAwesomeIcon icon={faShieldHalved} className="text-xl" />
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[9px] font-mono text-slate-500">guard-node</div>
                </div>

                <div className="absolute bottom-1/4 left-1/2 text-honey-amber text-glow-amber">
                  <FontAwesomeIcon icon={faFileCode} className="text-xl animate-bounce" />
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[9px] font-mono text-slate-500">payroll.csv</div>
                </div>

                <div className="absolute top-10 right-10 text-cyber-crimson text-glow-crimson animate-pulse">
                  <FontAwesomeIcon icon={faUserSecret} className="text-lg" />
                  <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[9px] font-mono text-cyber-crimson">INTRUDER?</div>
                </div>
              </div>

              {/* Virtual event stream */}
              <div className="mt-4 space-y-2">
                <div className="bg-[#04060b] px-3 py-2 rounded border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Threat Index:</span>
                  <span className="text-cyber-cyan">MINIMAL (0.02)</span>
                </div>
                <div className="bg-[#04060b] px-3 py-2 rounded border border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Bait Nodes Engaged:</span>
                  <span className="text-honey-amber">47 Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Section: Interactive Honeytoken Sandbox */}
      <section id="sandbox" className="py-24 border-t border-slate-900 bg-[#06080f]/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
              Interactive Honeytoken Sandbox
            </h2>
            <p className="text-slate-400 font-light">
              Experience the active defense cycle. Configure a mock trap below, activate surveillance, and watch the telemetry record a simulated attacker breach instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Sandbox Controls Column */}
            <div className="lg:col-span-5 flex flex-col justify-between cyber-card p-6 rounded-xl border-white/5 space-y-6">
              <div className="cyber-scan-line"></div>
              
              <div>
                <h3 className="text-lg font-display font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">
                  1. Select Trap Type
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'api', label: 'API Key', icon: faKey },
                    { id: 'doc', label: 'Tracker Doc', icon: faFileCode },
                    { id: 'db', label: 'Database', icon: faDatabase }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        if (sandboxStep !== 'simulating') {
                          setSelectedType(t.id);
                          setSandboxStep('config');
                          setLogs([]);
                        }
                      }}
                      disabled={sandboxStep === 'simulating'}
                      className={`flex flex-col items-center justify-center p-3 rounded border text-xs font-mono font-medium transition-all ${
                        selectedType === t.id
                          ? 'border-honey-amber bg-honey-amber/10 text-honey-amber'
                          : 'border-slate-800 bg-[#090d16]/50 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <FontAwesomeIcon icon={t.icon} className="text-lg mb-2" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-display font-semibold text-slate-200 mb-4 border-b border-slate-800 pb-2">
                  2. Customize Decoy Object
                </h3>
                <div className="space-y-3 font-mono text-sm">
                  <label className="block text-xs text-slate-500 uppercase tracking-wider">Decoy Name / ID</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-slate-600 select-none">ID_</span>
                    <input
                      type="text"
                      value={decoyName}
                      onChange={(e) => {
                        if (sandboxStep !== 'simulating') {
                          setDecoyName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''));
                        }
                      }}
                      disabled={sandboxStep === 'simulating'}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#05070c] border border-slate-800 rounded font-mono text-sm text-slate-200 focus:outline-none focus:border-cyber-cyan transition-colors"
                      placeholder="token-identifier"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">This signature identifier identifies alerts originating from this decoy.</span>
                </div>
              </div>

              <div className="pt-4">
                {sandboxStep === 'config' && (
                  <button
                    onClick={runSimulation}
                    className="w-full btn-cyber-amber py-3.5 rounded flex items-center justify-center gap-3 font-semibold"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    Deploy & Simulate Attack
                  </button>
                )}

                {sandboxStep === 'simulating' && (
                  <div className="w-full bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan py-3.5 rounded font-mono text-xs flex items-center justify-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyber-cyan animate-ping"></span>
                    SIMULATING ATTACK SEQUENCE...
                  </div>
                )}

                {sandboxStep === 'alerts' && (
                  <button
                    onClick={() => {
                      setSandboxStep('config');
                      setLogs([]);
                    }}
                    className="w-full btn-cyber-cyan py-3.5 rounded flex items-center justify-center gap-2 font-semibold"
                  >
                    <FontAwesomeIcon icon={faCheckCircle} />
                    Reset Simulation Node
                  </button>
                )}
              </div>
            </div>

            {/* Sandbox Simulated Output Display */}
            <div className="lg:col-span-7 flex flex-col bg-[#04060b] border border-slate-900 rounded-xl overflow-hidden shadow-2xl">
              {/* Terminal Title Bar */}
              <div className="terminal-header px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  <span className="pl-2 font-mono text-xs text-slate-500 font-semibold">syslog-monitor@honeyguard-node-9</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-cyber-cyan">
                  <FontAwesomeIcon icon={faWifi} className="animate-pulse" />
                  <span>ONLINE_TELEMETRY</span>
                </div>
              </div>

              {/* Terminal Code Snippet representation (if configuring) */}
              <div className="flex-grow flex flex-col justify-between p-4 min-h-[350px]">
                {sandboxStep === 'config' && (
                  <div className="flex flex-col justify-between h-full space-y-4">
                    <div className="text-xs text-slate-500 font-mono">
                      // CONFIGURING DYNAMIC OBJECT [{selectedType.toUpperCase()}]
                    </div>
                    <pre className="p-4 bg-[#080d16] border border-slate-800 rounded font-mono text-xs text-slate-400 overflow-x-auto select-none leading-relaxed">
                      {tokenTemplates[selectedType].snippet(decoyName)}
                    </pre>
                    <div className="text-xs font-mono text-slate-500 text-center italic">
                      Ready for bait injection. Click the left trigger to test routing alerts.
                    </div>
                  </div>
                )}

                {/* Scrolling Logs Screen */}
                {(sandboxStep === 'simulating' || sandboxStep === 'alerts') && (
                  <div className="font-mono text-xs space-y-2 overflow-y-auto max-h-[360px] flex-grow pr-2">
                    {logs.map((log, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`leading-relaxed border-l-2 pl-3 py-0.5 ${
                          log.isAlert
                            ? 'border-cyber-crimson bg-cyber-crimson/5 text-cyber-crimson font-semibold text-glow-crimson'
                            : 'border-slate-800 text-slate-300'
                        }`}
                      >
                        {log.text}
                      </motion.div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                )}
              </div>

              {/* Terminal Bottom HUD */}
              <div className="border-t border-slate-900 bg-[#070a13] px-4 py-3 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse"></span>
                  Node Location: AWS us-east-1
                </span>
                <span>Telemetry size: {logs.length * 110} B</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cyber Threat Defense Features Cards Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered Mimicry",
              description: "HoneyGuard runs advanced contextual scanners to construct decoy API keys, Slack webhook integrations, and S3 credentials that seamlessly blend into your configuration files.",
              icon: faMicrochip,
              accent: "cyan"
            },
            {
              title: "Instant Verification",
              description: "Our beacon servers execute immediate metadata extraction. Capture intruder IP, host user-agent, geolocation markers, and access parameters within milliseconds of decoy trigger.",
              icon: faClock,
              accent: "amber"
            },
            {
              title: "Autonomous Lockdown",
              description: "Configure automatic firewall rules, API revocations, and SIEM ticketing policies that lock down breached nodes autonomously before attackers pivot to production resources.",
              icon: faLock,
              accent: "cyan"
            }
          ].map((item, idx) => (
            <div key={idx} className="cyber-card p-8 rounded-xl flex flex-col justify-between h-full space-y-6">
              <div>
                <div className={`w-12 h-12 rounded bg-gradient-to-br flex items-center justify-center mb-6 border ${
                  item.accent === 'amber'
                    ? 'from-honey-amber/20 to-yellow-500/10 border-honey-amber/30 text-honey-amber'
                    : 'from-cyber-cyan/20 to-teal-500/10 border-cyber-cyan/30 text-cyber-cyan'
                }`}>
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </div>
                <h3 className="text-xl font-display font-bold text-slate-100 mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
              <div className="pt-2 text-xs font-mono font-medium text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                ACTIVE PROTOCOL SEC-{idx + 10}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Client Proof Section */}
      <section className="py-20 border-t border-slate-900/60 bg-[#04060a]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="text-xs uppercase tracking-widest text-slate-500 font-mono">
            DEPLOYED IN THE DEFENSE INFRASTRUCTURE OF SECURITY TEAMS AT
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-40 grayscale contrast-200">
            <div className="font-display font-bold text-lg text-slate-400 uppercase tracking-widest">NETSEC_CORP</div>
            <div className="font-display font-bold text-lg text-slate-400 uppercase tracking-widest">VIRTUAL_SHIELD</div>
            <div className="font-display font-bold text-lg text-slate-400 uppercase tracking-widest">BLOCKCORE</div>
            <div className="font-display font-bold text-lg text-slate-400 uppercase tracking-widest">SIEM_CENTRAL</div>
            <div className="font-display font-bold text-lg text-slate-400 uppercase tracking-widest">CYBERMETRIC</div>
          </div>
        </div>
      </section>

      {/* Call To Action Block */}
      <section className="py-24 border-t border-slate-900 relative">
        <div className="absolute inset-0 bg-[#0e1322]/20 backdrop-blur-xl cyber-radial-glow pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex p-3 bg-honey-amber/10 border border-honey-amber/20 rounded-full text-honey-amber text-2xl text-glow-amber">
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>

          <h2 className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight">
            Stop waiting for threat logs.<br />
            <span className="text-cyber-cyan text-glow-cyan">Lure them</span> with Honeytokens.
          </h2>

          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Get started with up to 5 free dynamic honeytokens. Seamless setup takes under 10 seconds. Protect cloud storage, credentials, and user systems immediately.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/pricing" className="btn-cyber-cyan px-8 py-3.5 rounded text-sm">
              Deploy Your First Bait
            </Link>
            <Link to="/contact" className="btn-cyber-outline px-8 py-3.5 rounded text-sm">
              Request POC Audit
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
