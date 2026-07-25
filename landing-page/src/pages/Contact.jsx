import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faComments,
  faHeadset,
  faPaperPlane,
  faTerminal,
  faGlobe,
  faLock,
  faKey
} from '@fortawesome/free-solid-svg-icons';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

function Contact() {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderMessage, setSenderMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API write
    setTimeout(() => {
      setLoading(false);
      setFormSubmitted(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen py-16 relative">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-24 space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-full text-xs font-mono text-cyber-cyan">
          COMMUNICATION NODE
        </div>
        <h1 className="text-4xl sm:text-6xl font-display font-bold tracking-tight text-white leading-tight">
          Initialize <span className="text-cyber-cyan text-glow-cyan">Contact Pipeline</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto font-light">
          Establish secure tunnels to our infrastructure security team or query decoy deployments.
        </p>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          
          {/* Node Information Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between cyber-card p-8 rounded-xl border-white/5 space-y-8">
            <div className="cyber-scan-line"></div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-slate-100 border-b border-slate-900 pb-3">
                Active Channels
              </h2>
              
              <div className="space-y-5 font-mono text-xs text-slate-400">
                <div className="p-4 bg-[#05070c] border border-slate-800 rounded relative overflow-hidden group">
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse"></span>
                    <span className="text-[8px] text-cyber-cyan font-bold">ONLINE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-1">PGP SMTP ENDPOINT</div>
                  <div className="text-sm font-semibold text-slate-200">contact.ideatex@gmail.com</div>
                </div>

                <div className="p-4 bg-[#05070c] border border-slate-800 rounded relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span>
                    <span className="text-[8px] text-slate-500 font-bold">SECURE</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-1">VOIP TRUNK LINK</div>
                  <div className="text-sm font-semibold text-slate-200">+91 8715808090</div>
                </div>

                <div className="p-4 bg-[#05070c] border border-slate-800 rounded relative overflow-hidden">
                  <div className="absolute top-2 right-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"></span>
                    <span className="text-[8px] text-slate-500 font-bold">LOC_ID</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mb-1">GEOGRAPHICAL HQ</div>
                  <div className="text-sm font-semibold text-slate-200">Jammu, India</div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-900 pt-6">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Security Ping:</span>
                <span className="text-cyber-cyan font-semibold">12ms (FAST)</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Protocol Node:</span>
                <span className="text-slate-300">HTTPS / TLS 1.3</span>
              </div>
            </div>

          </div>

          {/* Terminal Command Form */}
          <div className="lg:col-span-7 flex flex-col bg-[#04060b] border border-slate-900 rounded-xl overflow-hidden shadow-2xl min-h-[450px]">
            {/* Terminal Header */}
            <div className="terminal-header px-4 py-3 flex items-center justify-between border-b border-slate-900">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <span className="pl-2 font-mono text-xs text-slate-500">secure-envelope@honeyguard-comms</span>
              </div>
              <span className="text-[10px] font-mono text-honey-amber uppercase">SHIELDED</span>
            </div>

            {formSubmitted ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan text-2xl text-glow-cyan">
                  <FontAwesomeIcon icon={faPaperPlane} className="animate-bounce" />
                </div>
                <h3 className="font-display text-xl font-bold text-slate-100">Message Encoded & Dispatched</h3>
                <p className="text-slate-400 text-xs font-mono max-w-sm">
                  Packet transmitted successfully. Our incident response team will return payload callback responses on your sender channel within 12 hours.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="btn-cyber-outline px-6 py-2 rounded text-xs font-mono"
                >
                  Clear Buffer & Send New Packet
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex-grow flex flex-col justify-between p-6 space-y-6 font-mono text-xs">
                <div className="space-y-5">
                  
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-slate-500 uppercase tracking-widest">
                      honeyguard:~$ input --sender-name
                    </label>
                    <input
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-[#05070c] border border-slate-900 rounded p-3 text-slate-200 focus:outline-none focus:border-cyber-cyan transition-colors"
                      placeholder="e.g. John Doe, Director of Security"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label className="text-slate-500 uppercase tracking-widest">
                      honeyguard:~$ input --sender-email
                    </label>
                    <input
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full bg-[#05070c] border border-slate-900 rounded p-3 text-slate-200 focus:outline-none focus:border-cyber-cyan transition-colors"
                      placeholder="e.g. j.doe@enterprise-cyber.net"
                    />
                  </div>

                  {/* Message field */}
                  <div className="space-y-2">
                    <label className="text-slate-500 uppercase tracking-widest">
                      honeyguard:~$ input --message-body
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={senderMessage}
                      onChange={(e) => setSenderMessage(e.target.value)}
                      className="w-full bg-[#05070c] border border-slate-900 rounded p-3 text-slate-200 focus:outline-none focus:border-cyber-cyan transition-colors resize-none"
                      placeholder="Input message payload here..."
                    ></textarea>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900/60">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-cyber-cyan py-3.5 rounded flex items-center justify-center gap-2 font-bold tracking-widest"
                  >
                    {loading ? (
                      <>
                        <span className="w-2 h-2 bg-slate-900 rounded-full animate-ping mr-2"></span>
                        DISPATCHING PACKETS...
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faPaperPlane} />
                        TRANSMIT PACKET
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Community Discord Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-12">
        <div className="cyber-card p-10 rounded-xl space-y-6 border-slate-900">
          <div className="inline-flex p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-2xl">
            <FontAwesomeIcon icon={faDiscord} />
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-100">
            Join the Active Defense Discord
          </h2>
          <p className="text-slate-400 text-xs font-mono max-w-md mx-auto leading-relaxed">
            Collaborate on custom decoy templates, get implementation tips, and talk real-time threat intelligence with our netsec engineering community.
          </p>
          <a
            href="https://discord.gg/honeyguard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block btn-cyber-outline px-8 py-3 rounded text-xs font-mono tracking-widest"
          >
            !join discord
          </a>
        </div>
      </section>
    </div>
  );
}

export default Contact;
