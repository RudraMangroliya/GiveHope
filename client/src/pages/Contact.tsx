import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an API request
    setTimeout(() => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-12 px-2 sm:px-6 lg:px-8">
      <div className="text-center mb-8 sm:mb-16 px-2">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight"
        >
          Get in Touch
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-3 text-base sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          We'd love to hear from you. Whether you have a question about campaigns, donations, or anything else, our team is ready to answer all your questions.
        </motion.p>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-8">
        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-indigo-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 text-white shadow-xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl sm:text-3xl font-extrabold mb-3 sm:mb-6">Contact Information</h3>
            <p className="text-indigo-100 mb-6 sm:mb-12 text-sm sm:text-lg">
              Fill out the form and our team will get back to you within 24 hours.
            </p>
 
            <div className="space-y-4 sm:space-y-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-indigo-100">Phone</p>
                  <p className="text-sm xs:text-base sm:text-xl font-bold break-words">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-indigo-100">Email</p>
                  <p className="text-sm xs:text-base sm:text-xl font-bold break-all">support@givehope.org</p>
                </div>
              </div>
 
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-indigo-100">Location</p>
                  <p className="text-sm xs:text-base sm:text-xl font-bold break-words">123 Hope Street, NY 10001</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
 
        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 shadow-xl border border-gray-100"
        >
          {isSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 sm:mb-4">
                <Send className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Message Sent!</h3>
              <p className="text-sm sm:text-lg text-gray-600 leading-relaxed">Thank you for reaching out. We will get back to you shortly.</p>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="mt-6 sm:mt-8 text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="contact-name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                  <input
                    required
                    type="text"
                    id="contact-name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 sm:py-3 px-3.5 sm:px-4 bg-gray-50 text-sm sm:text-base transition-colors focus:bg-white border"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    id="contact-email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 sm:py-3 px-3.5 sm:px-4 bg-gray-50 text-sm sm:text-base transition-colors focus:bg-white border"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
 
              <div>
                <label htmlFor="contact-subject" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <input
                  required
                  type="text"
                  id="contact-subject"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 sm:py-3 px-3.5 sm:px-4 bg-gray-50 text-sm sm:text-base transition-colors focus:bg-white border"
                  placeholder="How can we help?"
                />
              </div>
 
              <div>
                <label htmlFor="contact-message" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                <textarea
                  required
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="block w-full rounded-xl border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2.5 sm:py-3 px-3.5 sm:px-4 bg-gray-50 text-sm sm:text-base transition-colors focus:bg-white resize-none border"
                  placeholder="Write your message here..."
                />
              </div>
 
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 sm:py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Send Message <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
