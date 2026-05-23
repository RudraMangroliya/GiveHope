import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-12 px-2 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 sm:mb-16 px-2"
      >
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">About GiveHope</h2>
        <p className="mt-3 text-base sm:text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">Empowering communities through transparent and impactful giving.</p>
      </motion.div>
 
      <div className="space-y-6 sm:space-y-12">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Our Mission</h3>
          <p className="text-sm sm:text-lg text-gray-600 leading-relaxed">
            At GiveHope, our mission is to bridge the gap between generosity and urgent needs across the globe. 
            We believe that every person has the power to make a difference, and we provide a seamless, secure, 
            and transparent platform to make that happen.
          </p>
        </motion.section>
 
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-indigo-50 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-indigo-100"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-indigo-900 mb-3 sm:mb-4">Why Choose Us?</h3>
          <ul className="space-y-3.5 text-sm sm:text-lg text-indigo-800">
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full shrink-0"></div>
              <div>
                <strong className="font-bold">100% Transparency:</strong> Track exactly where your donations go.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full shrink-0"></div>
              <div>
                <strong className="font-bold">Verified Campaigns:</strong> We carefully vet every campaign on our platform.
              </div>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full shrink-0"></div>
              <div>
                <strong className="font-bold">Secure Payments:</strong> Your financial data is protected with enterprise-grade security.
              </div>
            </li>
          </ul>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
