import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Gift, Sparkles, Info, Mail, LogOut, Shield, ArrowUp } from 'lucide-react';
import Home from './pages/Home';
import DonationFlow from './pages/DonationFlow';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import FullScreenAuth from './components/FullScreenAuth';
import Profile from './pages/Profile'; // Supporter dashboard view

// Automatically scroll window to top when routing changes
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Premium Unified Brand Logo Component (Bypasses WebKit composition bugs by using solid text color + gradient icon)
export function BrandLogo({ onClick, showTextOnMicro = true }: { onClick?: () => void; showTextOnMicro?: boolean }) {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link to="/" onClick={handleClick} className="flex items-center gap-2 group active:scale-[0.98] transition-all duration-300 shrink-0">
      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-100 shrink-0 transition-transform duration-300">
        <Gift className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white" />
      </div>
      <span className={`font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl transition-colors duration-300 group-hover:text-indigo-600 ${showTextOnMicro ? 'hidden min-[280px]:block' : ''}`}>
        GiveHope
      </span>
    </Link>
  );
}

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // User Authentication State
  const [user, setUser] = useState<{ name: string; email: string; role: 'user' | 'admin'; createdAt?: string } | null>(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.name) {
          return parsed;
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (userData: any) => {
    setUser({
      name: userData.name,
      email: userData.email,
      role: userData.role,
      createdAt: userData.createdAt,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Lock the entire app behind authentication guard (requires valid user context)
  // Positioned after hooks to comply with React's Rules of Hooks
  if (!user || !user.name) {
    return <FullScreenAuth onSuccess={handleAuthSuccess} />;
  }

  const menuItems = [
    { name: 'Campaigns', path: '/', icon: Sparkles },
    { name: 'About Us', path: '/about', icon: Info },
    { name: 'Contact', path: '/contact', icon: Mail },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', path: '/admin', icon: Shield }] : [])
  ];

  // Animation variants for sidebar stagger
  const linkVariants = {
    hidden: { opacity: 0, x: 25 },
    visible: (custom: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.08,
        duration: 0.25,
        ease: 'easeOut' as const
      }
    })
  };

  return (
    <>
      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop Overlay - Mathematically stacked below panel using z-[100] */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] lg:hidden"
            />

            {/* Sidebar Drawer - Mathematically stacked above backdrop using z-[200] */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
              className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl z-[200] lg:hidden flex flex-col justify-between border-l border-slate-100 overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-100 flex justify-between items-center h-16 sm:h-20 shrink-0 bg-white">
                <BrandLogo onClick={() => setIsMenuOpen(false)} showTextOnMicro={true} />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-50 active:bg-slate-100 hover:rotate-90 transition-all duration-300 shrink-0"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Sidebar Links with micro-animations & active highlight */}
              <div className="flex-1 py-6 px-3 sm:px-4 space-y-2 overflow-y-auto bg-white">
                {/* Mobile Drawer Account Status Segment - Click to open profile */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigate('/profile');
                  }}
                  className="w-full text-left px-4 py-4 mb-4 bg-slate-50/70 hover:bg-slate-100/50 border border-slate-100/50 rounded-2xl flex items-center gap-3 active:scale-[0.99] transition-all duration-300 outline-none"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{user.name}</h4>
                    <span className="text-[11px] font-bold text-slate-400 truncate block mt-0.5">{user.email}</span>
                  </div>
                </button>

                {menuItems.map((item, index) => {
                  const isActive = item.path === '/' 
                    ? (pathname === '/' || pathname.startsWith('/donate/')) 
                    : pathname === item.path;
                  const IconComponent = item.icon;
                  return (
                    <motion.div
                      key={item.path}
                      custom={index}
                      variants={linkVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-base font-semibold transition-all duration-300 group ${
                          isActive
                            ? 'bg-indigo-50/80 text-indigo-600 shadow-sm border-l-4 border-indigo-600'
                            : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                        <span className="relative">
                          {item.name}
                        </span>
                      </Link>
                    </motion.div>
                  );
                })}

              </div>

              {/* Sidebar Footer with Log Out, Social Links & Copyright */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-center space-y-4">
                {/* Log Out Button */}
                <div className="pb-2">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full py-3 px-4 bg-white hover:bg-rose-50/50 text-slate-600 hover:text-rose-600 border border-slate-100 hover:border-rose-100 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
                  >
                    <LogOut className="h-4.5 w-4.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                    <span>Log Out</span>
                  </button>
                </div>

                <div className="flex justify-center items-center gap-4">
                  <a href="#" className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all duration-300 flex items-center justify-center shrink-0" aria-label="Twitter">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="#" className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all duration-300 flex items-center justify-center shrink-0" aria-label="Instagram">
                    <svg className="h-4 w-4 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#" className="p-2 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-indigo-600 hover:shadow-sm transition-all duration-300 flex items-center justify-center shrink-0" aria-label="GitHub">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                </div>
                <div className="text-xs text-slate-400 font-semibold tracking-wide">&copy; {new Date().getFullYear()} GiveHope</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-slate-50 font-sans flex flex-col justify-between">
        {/* Sticky Glassmorphic Desktop Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16 sm:h-20">
              <BrandLogo onClick={() => setIsMenuOpen(false)} showTextOnMicro={true} />
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-6">
                {menuItems.map((item) => {
                  const isActive = item.path === '/' 
                    ? (pathname === '/' || pathname.startsWith('/donate/')) 
                    : pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`relative font-semibold text-sm sm:text-base transition-colors duration-300 py-2 group ${
                        isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                      }`}
                    >
                      {item.name}
                      <span
                        className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-300 group-hover:w-full ${
                          isActive ? 'w-full' : 'w-0'
                        }`}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Desktop CTA Button */}
              <div className="hidden lg:flex items-center gap-3">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 py-2 px-4 bg-slate-50 hover:bg-slate-100/80 text-slate-700 hover:text-slate-900 border border-slate-100 rounded-xl font-bold text-sm transition-all duration-300 group shrink-0 active:scale-95 shadow-sm"
                >
                  <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 py-2 px-4 bg-white hover:bg-rose-50/50 text-slate-600 hover:text-rose-600 border border-slate-100 hover:border-rose-100 rounded-xl font-bold text-sm transition-all duration-300 group shrink-0 active:scale-95 shadow-sm"
                >
                  <LogOut className="h-4.5 w-4.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                  <span>Log Out</span>
                </button>
              </div>

              {/* Hamburger Button (Mobile) */}
              <div className="flex lg:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2.5 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 active:scale-95 transition-all duration-300"
                  aria-expanded={isMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                  </motion.div>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate/:campaignId" element={<DonationFlow />} />
            <Route path="/profile" element={<Profile user={user} onProfileUpdate={(updatedUser) => { setUser(updatedUser); localStorage.setItem('user', JSON.stringify(updatedUser)); }} />} />
            {user?.role === 'admin' && <Route path="/admin" element={<Admin />} />}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
      
      {/* Floating Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-[90] p-3 rounded-full bg-white/85 backdrop-blur-md text-indigo-600 hover:text-white hover:bg-gradient-to-tr hover:from-indigo-600 hover:to-violet-600 shadow-xl shadow-slate-200/80 border border-slate-100 hover:border-transparent hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-indigo-100/50"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}

export default App;
