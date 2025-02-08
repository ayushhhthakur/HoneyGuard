import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faComments,
  faHeadset,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';

function Contact() {
  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-[#020c1b] to-[#0a192f]">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-6 text-gradient"
        >
          Get in Touch
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto"
        >
          We're here to help with your security needs
        </motion.p>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { icon: faEnvelope, title: "Email", content: "contact.ideatex@gmail.com" },
                { icon: faPhone, title: "Phone", content: "+91 8715808090" },
                { icon: faMapMarkerAlt, title: "Location", content: "Jammu, India" },
                { icon: faComments, title: "Live Chat", content: "Available 24/7" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group p-6 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-[#00ff9d]/50 transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00ff9d]/20 to-[#64ffda]/20 rounded-lg flex items-center justify-center">
                      <FontAwesomeIcon icon={item.icon} className="text-[#00ff9d]" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">{item.title}</h3>
                      <p className="text-gray-400">{item.content}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="p-8 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10"
          >
            <h2 className="text-2xl font-bold text-white mb-8">Send us a Message</h2>
            <form className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-gray-300 text-sm">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#00ff9d]/50 focus:ring-1 focus:ring-[#00ff9d]/50 text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-gray-300 text-sm">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#00ff9d]/50 focus:ring-1 focus:ring-[#00ff9d]/50 text-white placeholder-gray-500 transition-all duration-300"
                    placeholder="Your email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-gray-300 text-sm">Subject</label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#00ff9d]/50 focus:ring-1 focus:ring-[#00ff9d]/50 text-white placeholder-gray-500 transition-all duration-300"
                  placeholder="Message subject"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-gray-300 text-sm">Message</label>
                <textarea
                  id="message"
                  rows="5"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-[#00ff9d]/50 focus:ring-1 focus:ring-[#00ff9d]/50 text-white placeholder-gray-500 transition-all duration-300 resize-none"
                  placeholder="Your message"
                ></textarea>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send Message</span>
              </motion.button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-2xl font-bold text-white text-center mb-12"
        >
          Other Ways to Connect
        </motion.h2>
        <div className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: faHeadset,
              title: "Technical Support",
              description: "Get help with technical issues and implementation",
              button: "Open Ticket"
            },
            {
              icon: faComments,
              title: "Community",
              description: "Join our Discord community for discussions",
              button: "Join Discord"
            }
          ].map((channel, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group p-8 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 hover:border-[#00ff9d]/50 transition-all duration-300 text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-[#00ff9d]/20 to-[#64ffda]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon icon={channel.icon} className="text-2xl text-[#00ff9d]" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">{channel.title}</h3>
              <p className="text-gray-400 mb-6">{channel.description}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 border border-[#00ff9d] text-[#00ff9d] rounded-lg font-medium hover:bg-[#00ff9d]/10 transition-all duration-300"
              >
                {channel.button}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="p-12 bg-gradient-to-r from-[#00ff9d]/10 to-transparent backdrop-blur-lg rounded-3xl border border-[#00ff9d]/20"
        >
          <h2 className="text-2xl font-bold text-white text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid sm:grid-cols-2 gap-8 mb-12">
            {[
              {
                question: "What is your typical response time?",
                answer: "We aim to respond to all inquiries within 24 hours during business days."
              },
              {
                question: "Do you offer emergency support?",
                answer: "Yes, enterprise customers have access to 24/7 emergency support."
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
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-[#00ff9d] to-[#64ffda] text-[#0a192f] rounded-lg font-medium hover:shadow-lg hover:shadow-[#00ff9d]/20 transition-all duration-300"
            >
              View All FAQs
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

export default Contact;
