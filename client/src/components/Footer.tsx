import { Link } from 'react-router-dom';
import { Gift, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for subscribing! We will keep you updated.');
  };

  return (
    <footer className="bg-white border-t border-gray-100 mt-16 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
          {/* Column 1: Platform Pitch & Socials */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 group hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0 group-hover:rotate-6 transition-transform duration-300">
                <Gift className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-xl transition-colors duration-300 group-hover:text-indigo-600">
                GiveHope
              </span>
            </Link>
            <p className="text-gray-500 max-w-xs text-sm sm:text-base leading-relaxed">
              We connect passionate donors with vital causes worldwide. Our transparent platform ensures every contribution directly impacts communities in need.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/55 hover:shadow-sm transition-all duration-300 flex items-center justify-center shrink-0" aria-label="Twitter">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/55 hover:shadow-sm transition-all duration-300 flex items-center justify-center shrink-0" aria-label="Instagram">
                <svg className="h-4 w-4 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="#" className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/55 hover:shadow-sm transition-all duration-300 flex items-center justify-center shrink-0" aria-label="GitHub">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Explore links */}
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-5">Explore Causes</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm sm:text-base text-gray-500 hover:text-indigo-600 transition-colors font-medium">Active Campaigns</Link></li>
              <li><Link to="/about" className="text-sm sm:text-base text-gray-500 hover:text-indigo-600 transition-colors font-medium">Our Mission</Link></li>
              <li><Link to="/contact" className="text-sm sm:text-base text-gray-500 hover:text-indigo-600 transition-colors font-medium">Contact Support</Link></li>
              <li><a href="#" className="text-sm sm:text-base text-gray-500 hover:text-indigo-600 transition-colors font-medium">FAQ & Help</a></li>
            </ul>
          </div>

          {/* Column 3: Contact details */}
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase mb-5">Get In Touch</h3>
            <ul className="space-y-3 text-sm sm:text-base text-gray-500 font-medium">
              <li className="flex items-center justify-center sm:justify-start gap-2.5">
                <MapPin className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <span className="leading-relaxed">100 Hope Way, New York, NY</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2.5">
                <Phone className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <span>+1 (800) 555-HOPE</span>
              </li>
              <li className="flex items-center justify-center sm:justify-start gap-2.5">
                <Mail className="h-4.5 w-4.5 text-indigo-600 shrink-0" />
                <a href="mailto:contact@givehope.org" className="hover:text-indigo-600 transition-colors">contact@givehope.org</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter box */}
          <div className="text-center sm:text-left space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-wider uppercase">Stay Updated</h3>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Subscribe to our newsletter for weekly impact reports and stories.
            </p>
            <form onSubmit={handleSubmit} className="relative mt-2 max-w-xs mx-auto sm:mx-0 group">
              <input
                type="email"
                id="newsletter-email"
                name="newsletter-email"
                required
                placeholder="Email address"
                className="w-full rounded-2xl border border-slate-200 bg-white pl-4 pr-12 py-3 text-sm sm:text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 bottom-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 flex items-center justify-center shadow-sm shadow-indigo-100 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                aria-label="Subscribe"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Copyright bottom area */}
        <div className="mt-12 sm:mt-16 border-t border-gray-100 pt-8 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-slate-400 font-semibold">
            &copy; {new Date().getFullYear()} GiveHope. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-400 font-semibold">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
