import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from '@/sections/Hero';
import { LogoStream } from '@/sections/LogoStream';
import { FeatureParsing } from '@/sections/FeatureParsing';
import { FeatureCompliance } from '@/sections/FeatureCompliance';
import { FeatureCollaboration } from '@/sections/FeatureCollaboration';
import { FeatureMemory } from '@/sections/FeatureMemory';
import { HowItWorks } from '@/sections/HowItWorks';
import { BackendAPI } from '@/sections/BackendAPI';
import { Pricing } from '@/sections/Pricing';
import { FAQ } from '@/sections/FAQ';
import { Testimonials } from '@/sections/Testimonials';
import { CTA } from '@/sections/CTA';
import { Footer } from '@/sections/Footer';
import { DemoSection } from '@/sections/DemoSection';
import { TrialModal } from '@/components/TrialModal';
import { VideoModal } from '@/components/VideoModal';
import { Shield, Menu, X } from 'lucide-react';
import { MagneticButton } from '@/components/MagneticButton';

const navLinks = [
  { name: '功能', href: '#features' },
  { name: '演示', href: '#demo' },
  { name: '工作原理', href: '#how-it-works' },
  { name: 'API', href: '#api' },
  { name: '定价', href: '#pricing' },
  { name: '常见问题', href: '#faq' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTrialOpen, setIsTrialOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleTrialSuccess = () => {
    setIsTrialOpen(false);
    // Navigate to login after successful registration
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white grain-overlay">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-lg shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-lime flex items-center justify-center">
                <Shield className="w-6 h-6 text-charcoal" />
              </div>
              <span className="text-xl font-bold text-charcoal">NexDoc AI</span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm text-gray-600 hover:text-charcoal transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-charcoal transition-colors"
              >
                登录
              </button>
              <MagneticButton 
                variant="primary" 
                className="py-2 px-4 text-sm"
                onClick={() => setIsTrialOpen(true)}
              >
                免费试用
              </MagneticButton>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-charcoal" />
              ) : (
                <Menu className="w-6 h-6 text-charcoal" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100">
            <div className="container mx-auto px-6 py-4">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left text-gray-600 hover:text-charcoal transition-colors py-2"
                  >
                    {link.name}
                  </button>
                ))}
                <hr className="border-gray-100" />
                <button 
                  onClick={() => navigate('/login')}
                  className="text-left text-gray-600 hover:text-charcoal transition-colors py-2"
                >
                  登录
                </button>
                <MagneticButton 
                  variant="primary" 
                  className="w-full justify-center"
                  onClick={() => {
                    setIsTrialOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  免费试用
                </MagneticButton>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        <Hero 
          onOpenTrial={() => setIsTrialOpen(true)} 
          onOpenVideo={() => setIsVideoOpen(true)} 
        />
        <LogoStream />
        <div id="features">
          <FeatureParsing />
          <FeatureCompliance />
          <FeatureCollaboration />
          <FeatureMemory />
        </div>
        <div id="demo">
          <DemoSection />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="api">
          <BackendAPI />
        </div>
        <Testimonials />
        <div id="pricing">
          <Pricing onOpenTrial={() => setIsTrialOpen(true)} />
        </div>
        <div id="faq">
          <FAQ />
        </div>
        <CTA onOpenTrial={() => setIsTrialOpen(true)} />
      </main>

      <Footer />

      {/* Modals */}
      <TrialModal 
        isOpen={isTrialOpen} 
        onClose={() => setIsTrialOpen(false)} 
        onSuccess={handleTrialSuccess}
      />
      <VideoModal 
        isOpen={isVideoOpen} 
        onClose={() => setIsVideoOpen(false)} 
      />
    </div>
  );
};
