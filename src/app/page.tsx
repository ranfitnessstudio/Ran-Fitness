/* eslint-disable */
"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Award, 
  Shield, 
  Users, 
  TrendingUp, 
  Sparkles,
  Lock,
  Menu,
  X,
  Calendar,
  Briefcase,
  Star,
  Activity,
  Smile,
  Play
} from 'lucide-react';

import { db, Trainer, Equipment, MembershipPlan, Transformation, WebsiteSettings, SocialLinks, GymEvent, VirtualTour } from '@/lib/database';
import { Logo } from '@/components/ui/logo';
import { Loader } from '@/components/ui/loader';
import { EquipmentSvg } from '@/components/ui/equipment-svgs';
import { BeforeAfterSlider } from '@/components/before-after-slider';
import { BookingModal } from '@/components/booking-modal';
import { AdminModal } from '@/components/admin-modal';
import { MemberLoginModal } from '@/components/member-login-modal';
import { CoachChat } from '@/components/coach-chat';
import { ThemeToggle } from '@/components/theme-toggle';
import { VirtualTourModal } from '@/components/virtual-tour-modal';

// Custom SVG Instagram icon
const Instagram = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// ---------------------------------------------------------------------------
// COUNTER COMPONENT (Scroll-Triggered)
// ---------------------------------------------------------------------------
const StatCounter: React.FC<{ value: string; label: string; suffix?: string }> = ({ value, label, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/\D/g, '')) || 0;

  return (
    <motion.div
      onViewportEnter={() => {
        let start = 0;
        const duration = 1500;
        const steps = 50;
        const increment = target / steps;
        const stepTime = duration / steps;
        
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, stepTime);
      }}
      viewport={{ once: true }}
      className="flex flex-col items-center p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl relative overflow-hidden group hover:border-yellow-400/30 transition-all duration-300"
    >
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-yellow-400/5 rounded-full blur-xl group-hover:bg-yellow-400/10 transition-all" />
      
      <div className="relative mb-3 flex items-center justify-center h-16 w-16">
        <svg viewBox="0 0 100 100" className="absolute w-full h-full animate-spin-slow opacity-15 text-zinc-300 dark:text-zinc-800">
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
        </svg>
        <Dumbbell className="text-yellow-450 dark:text-yellow-400" size={24} />
      </div>

      <span className="font-display text-3xl md:text-4xl font-black italic text-yellow-500 dark:text-yellow-400">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-zinc-550 dark:text-zinc-400 text-xs uppercase tracking-wider font-semibold font-mono mt-1 text-center">
        {label}
      </span>
    </motion.div>
  );
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [socials, setSocials] = useState<SocialLinks | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [transformations, setTransformations] = useState<Transformation[]>([]);
  const [events, setEvents] = useState<GymEvent[]>([]);
  const [virtualTour, setVirtualTour] = useState<VirtualTour | null>(null);
  const [tourModalOpen, setTourModalOpen] = useState(false);

  // Navigation & UI control state
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [equipmentFilter, setEquipmentFilter] = useState<'All' | 'Strength' | 'Cardio' | 'Functional'>('All');
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const updateThemeOnDom = (newTheme: 'light' | 'dark') => {
    if (typeof window === 'undefined') return;
    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  };

  const handleThemeToggle = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('ran_fitness_color_theme', newTheme);
    updateThemeOnDom(newTheme);
  };

  // Banners UI state
  const [offerRibbonOpen, setOfferRibbonOpen] = useState(true);
  const [announcementOpen, setAnnouncementOpen] = useState(true);

  // Hiring Form state
  const [careerForm, setCareerForm] = useState({
    name: '',
    phone: '',
    role: 'Trainer',
    experience: '',
  });
  const [careerSubmitting, setCareerSubmitting] = useState(false);
  const [careerSuccess, setCareerSuccess] = useState(false);

  // Modals state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingGoal, setBookingGoal] = useState('');
  const [adminOpen, setAdminOpen] = useState(false);
  const [memberLoginOpen, setMemberLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Google Testimonials Seed Data (Ready for Google Business API integration)
  const googleReviews = [
    {
      name: "Sai Krishna",
      rating: 5,
      relativeTime: "1 week ago",
      text: "Hands down the best gym in Habsiguda! The Aerofit Smith Machine and cable crossover systems are incredibly smooth. Coach Vikram Ran is a powerhouse of lifting knowledge.",
      avatar: "S"
    },
    {
      name: "Ananya Reddy",
      rating: 5,
      relativeTime: "3 weeks ago",
      text: "Love the hybrid CrossFit conditioning setups here! Also, the Zumba dance nights with Coach Rohan are absolute cardio gold. Extremely neat shower areas and friendly community.",
      avatar: "A"
    },
    {
      name: "Sandeep Varma",
      rating: 5,
      relativeTime: "1 month ago",
      text: "Lost 14 kg fat and gained solid muscle mass in 3 months. Sameer's keto diets and target compound lifting charts changed my lifestyle. The trainers keep checking my form. Recommended!",
      avatar: "S"
    }
  ];

  // Load database resources
  const loadContent = async () => {
    try {
      const [s, soc, t, e, p, tr, ev, vt] = await Promise.all([
        db.getSettings(),
        db.getSocialLinks(),
        db.getTrainers(),
        db.getEquipment(),
        db.getPlans(),
        db.getTransformations(),
        db.getEvents(),
        db.getVirtualTour(),
        db.logVisit()
      ]);
      setSettings(s);
      setSocials(soc);
      setTrainers(t);
      setEquipment(e);
      setPlans(p);
      setTransformations(tr);
      setEvents(ev);
      setVirtualTour(vt);
      console.log("[VIRTUAL TOUR LOADED]", vt);
    } catch (err) {
      console.error('Failed to load page content:', err);
    }
  };

  useEffect(() => {
    loadContent();
    
    // Theme initialization
    const storedTheme = localStorage.getItem('ran_fitness_color_theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      updateThemeOnDom(storedTheme);
    } else {
      localStorage.setItem('ran_fitness_color_theme', 'dark');
      updateThemeOnDom('dark');
    }
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      const sections = ['home', 'about', 'equipment', 'trainers', 'plans', 'transformations', 'contact'];
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openBooking = (goal = '') => {
    setBookingGoal(goal);
    setBookingOpen(true);
  };

  // Filter equipment based on tabs
  const filteredEquipment = equipment.filter((eq) => {
    if (equipmentFilter === 'All') return true;
    return eq.category === equipmentFilter;
  });

  // Smooth scroll handler
  const handleNavClick = (id: string) => {
    console.log("Navigating to:", id);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 80;
        const elementPosition = el.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
        setActiveSection(id);
      }
    }, 150);
  };

  // Handle Career hiring submission
  const handleCareerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!careerForm.name || !careerForm.phone || !careerForm.experience) return;
    setCareerSubmitting(true);

    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(careerForm),
      });

      if (response.ok) {
        setCareerSuccess(true);
        setCareerForm({ name: '', phone: '', role: 'Trainer', experience: '' });
        setTimeout(() => setCareerSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Career submit failure:', err);
    } finally {
      setCareerSubmitting(false);
    }
  };

  if (!settings) return null;

  return (
    <>
      {/* Barbell Loading Screen */}
      <Loader onComplete={() => setLoading(false)} />

      {!loading && (
        <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white selection:bg-yellow-400 selection:text-black transition-colors duration-300">
          
          {/* Header */}
          <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
            scrolled ? 'bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 py-3' : 'bg-transparent py-5'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
              
              <div onClick={() => handleNavClick('home')} className="cursor-pointer flex items-center">
                <Logo variant="full" />
              </div>

              {/* Desktop Menu */}
              <nav className="hidden lg:flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
                {['about', 'equipment', 'trainers', 'plans', 'transformations', 'contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => handleNavClick(item)}
                    className={`hover:text-yellow-400 transition-colors font-bold ${
                      activeSection === item ? 'text-yellow-400 border-b border-yellow-400 pb-0.5' : 'text-zinc-400'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="hidden sm:flex items-center gap-4">
                <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
                <button
                  onClick={() => setMemberLoginOpen(true)}
                  className="rounded-full border border-zinc-200 dark:border-zinc-800 hover:border-yellow-400 dark:hover:border-yellow-400 px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-650 dark:text-zinc-300 hover:text-yellow-500 dark:hover:text-yellow-400 transition-all bg-transparent"
                >
                  Member Portal
                </button>
                <button
                  onClick={() => openBooking('General Trial')}
                  className="rounded-full bg-yellow-400 text-black px-5 py-2 text-xs font-black italic uppercase tracking-wider hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all animate-heartpulse"
                >
                  Book Free Trial
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <div className="flex items-center gap-3 lg:hidden">
                <ThemeToggle theme={theme} onToggle={handleThemeToggle} />
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-zinc-900 dark:text-white hover:text-yellow-400 transition-colors"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

            </div>
          </header>

          {/* B. Website Announcement Banner (Regional alerts) */}
          {settings.announcement_active && announcementOpen && (
            <div className={`fixed left-4 right-4 z-30 transition-all duration-300 ${
              scrolled ? 'top-20' : 'top-24'
            }`}>
              <div className="max-w-3xl mx-auto bg-white/95 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-xs flex justify-between items-start gap-4 shadow-xl backdrop-blur-md">
                <div className="flex gap-2.5 items-start">
                  <span className="text-yellow-400 mt-0.5 text-sm">📢</span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">{settings.announcement_text}</p>
                </div>
                <button 
                  onClick={() => setAnnouncementOpen(false)}
                  className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Drawer Menu & Backdrop */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                {/* Backdrop Layer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden pointer-events-auto"
                />
                
                {/* Drawer Container */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="fixed top-16 left-0 right-0 z-[9999] bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 py-6 px-4 lg:hidden flex flex-col gap-4 shadow-xl text-zinc-900 dark:text-white pointer-events-auto"
                >
                  {['about', 'equipment', 'trainers', 'plans', 'transformations', 'contact'].map((item) => (
                    <button
                      key={item}
                      onClick={() => handleNavClick(item)}
                      className="text-left py-2 border-b border-zinc-100 dark:border-zinc-900 text-sm font-black italic tracking-widest uppercase hover:text-yellow-400 text-zinc-850 dark:text-zinc-200 cursor-pointer pointer-events-auto"
                    >
                      {item}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setMemberLoginOpen(true);
                    }}
                    className="w-full text-center rounded-lg border border-zinc-200 dark:border-zinc-850 py-3 text-sm font-bold uppercase text-zinc-700 dark:text-zinc-200 hover:text-yellow-500 hover:border-yellow-400 bg-transparent mb-1 cursor-pointer pointer-events-auto"
                  >
                    Member Login
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openBooking('Free Trial Mobile');
                    }}
                    className="w-full text-center rounded-lg bg-yellow-400 py-3 text-sm font-black italic uppercase text-black hover:bg-yellow-300 cursor-pointer pointer-events-auto"
                  >
                    Book Trial Spot
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Hero Section */}
          <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 px-4">
                      {/* Background layers */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
              {/* Gym muscles background */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.12] dark:opacity-[0.16] mix-blend-luminosity filter grayscale"
                style={{ backgroundImage: `url('/images/vascular_gym_muscles.png')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white via-zinc-50/80 to-zinc-100/50 dark:from-zinc-950 dark:via-zinc-950/80 dark:to-zinc-950 transition-colors duration-300" />
              
              {/* Soft grain texture */}
              <div className="absolute inset-0 soft-grain opacity-[0.2] dark:opacity-[0.12]" />
              
              {/* Glow spots */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl" />
              
              {/* Gold energy sparks & light particle bursts */}
              <div className="absolute top-1/3 left-[15%] w-2 h-2 bg-yellow-400 rounded-full animate-spark-pulse blur-[1px]" />
              <div className="absolute top-[60%] right-[20%] w-1.5 h-1.5 bg-yellow-400 rounded-full animate-spark-pulse blur-[1px] [animation-delay:1s]" />
              <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-yellow-550 rounded-full animate-spark-pulse blur-[2px] [animation-delay:0.5s]" />
              <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-spark-pulse blur-[1px] [animation-delay:1.5s]" />

              {/* Left Gold Energy Effects (Flares, Streaks, Sparks in colors #FFD700, #FACC15, #FFE87C) */}
              <div className="absolute left-[2%] md:left-[5%] top-[15%] md:top-[10%] w-[25%] h-[70%] z-0 pointer-events-none select-none overflow-hidden opacity-90 dark:opacity-60 transition-opacity duration-300">
                <svg viewBox="0 0 200 600" className="w-full h-full">
                  <defs>
                    <linearGradient id="goldStreak1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFE87C" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FACC15" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="goldFlare1" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFE87C" stopOpacity="0.6" />
                      <stop offset="40%" stopColor="#FACC15" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Energy Streaks */}
                  <path d="M10,100 Q60,150 20,250 T80,400" fill="none" stroke="url(#goldStreak1)" strokeWidth="2" className="animate-pulse" />
                  <path d="M40,50 Q10,180 70,280 T30,480" fill="none" stroke="url(#goldStreak1)" strokeWidth="1.5" className="animate-pulse [animation-delay:1s]" />
                  
                  {/* Light Flares */}
                  <circle cx="50" cy="200" r="40" fill="url(#goldFlare1)" className="animate-glow-pulse" />
                  <circle cx="120" cy="380" r="30" fill="url(#goldFlare1)" className="animate-glow-pulse [animation-delay:2s]" />

                  {/* Gold Sparks / Particle Bursts */}
                  <circle cx="30" cy="150" r="3" fill="#FFE87C" className="animate-spark-pulse" />
                  <circle cx="80" cy="180" r="2" fill="#FACC15" className="animate-spark-pulse [animation-delay:0.5s]" />
                  <circle cx="60" cy="240" r="4" fill="#FFD700" className="animate-spark-pulse [animation-delay:1.2s]" />
                  <circle cx="20" cy="310" r="2.5" fill="#FFE87C" className="animate-spark-pulse [animation-delay:1.8s]" />
                  <circle cx="90" cy="340" r="3.5" fill="#FACC15" className="animate-spark-pulse [animation-delay:0.3s]" />
                  <circle cx="40" cy="420" r="2" fill="#FFD700" className="animate-spark-pulse [animation-delay:1.5s]" />
                </svg>
              </div>

              {/* Right Gold Energy Effects (Flares, Streaks, Sparks in colors #FFD700, #FACC15, #FFE87C) */}
              <div className="absolute right-[2%] md:right-[5%] top-[15%] md:top-[10%] w-[25%] h-[70%] z-0 pointer-events-none select-none overflow-hidden opacity-90 dark:opacity-60 transition-opacity duration-300">
                <svg viewBox="0 0 200 600" className="w-full h-full">
                  <defs>
                    <linearGradient id="goldStreak2" x1="100%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFE87C" stopOpacity="0" />
                      <stop offset="50%" stopColor="#FACC15" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </linearGradient>
                    <radialGradient id="goldFlare2" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FFE87C" stopOpacity="0.6" />
                      <stop offset="40%" stopColor="#FACC15" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Energy Streaks */}
                  <path d="M190,120 Q140,180 180,290 T120,420" fill="none" stroke="url(#goldStreak2)" strokeWidth="2.5" className="animate-pulse [animation-delay:0.5s]" />
                  <path d="M160,70 Q190,200 130,320 T170,500" fill="none" stroke="url(#goldStreak2)" strokeWidth="1.5" className="animate-pulse [animation-delay:1.5s]" />
                  
                  {/* Light Flares */}
                  <circle cx="150" cy="220" r="45" fill="url(#goldFlare2)" className="animate-glow-pulse [animation-delay:1s]" />
                  <circle cx="80" cy="400" r="35" fill="url(#goldFlare2)" className="animate-glow-pulse [animation-delay:3s]" />

                  {/* Gold Sparks / Particle Bursts */}
                  <circle cx="170" cy="140" r="2.5" fill="#FFE87C" className="animate-spark-pulse [animation-delay:0.7s]" />
                  <circle cx="120" cy="190" r="3.5" fill="#FACC15" className="animate-spark-pulse [animation-delay:1.4s]" />
                  <circle cx="140" cy="260" r="2" fill="#FFD700" className="animate-spark-pulse [animation-delay:0.2s]" />
                  <circle cx="180" cy="330" r="4" fill="#FFE87C" className="animate-spark-pulse [animation-delay:2.1s]" />
                  <circle cx="110" cy="370" r="3" fill="#FACC15" className="animate-spark-pulse [animation-delay:0.9s]" />
                  <circle cx="160" cy="450" r="2.5" fill="#FFD700" className="animate-spark-pulse [animation-delay:1.1s]" />
                </svg>
              </div>

              {/* Technical circular overlays & Premium fitness rings (8%-10% opacity) */}
              <div className="absolute -right-32 md:-right-60 top-1/4 w-80 md:w-[600px] h-80 md:h-[600px] opacity-[0.10] dark:opacity-[0.12] animate-rotate-rings">
                <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-400 dark:text-zinc-650">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 5" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="1 1" />
                  <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="50" cy="15" r="1.5" fill="currentColor" />
                  <circle cx="50" cy="85" r="1.5" fill="currentColor" />
                  <circle cx="15" cy="50" r="1.5" fill="currentColor" />
                  <circle cx="85" cy="50" r="1.5" fill="currentColor" />
                </svg>
              </div>

              <div className="absolute -left-32 md:-left-60 bottom-1/4 w-80 md:w-[600px] h-80 md:h-[600px] opacity-[0.09] dark:opacity-[0.08] animate-rotate-rings [animation-duration:35s]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-400 dark:text-zinc-700">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="5 2" />
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.25" />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 10" />
                  <line x1="15" y1="15" x2="85" y2="85" stroke="currentColor" strokeWidth="0.25" />
                  <line x1="15" y1="85" x2="85" y2="15" stroke="currentColor" strokeWidth="0.25" />
                  <line x1="50" y1="2" x2="50" y2="8" stroke="currentColor" strokeWidth="1" />
                  <line x1="50" y1="92" x2="50" y2="98" stroke="currentColor" strokeWidth="1" />
                  <line x1="2" y1="50" x2="8" y2="50" stroke="currentColor" strokeWidth="1" />
                  <line x1="92" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            </div>

            {/* Female Character Image Overlay (Safe Zone, Face + Upper Torso on Mobile, Responsive Opacity) */}
            <div className="absolute left-0 top-0 bottom-0 w-[24%] xs:w-[22%] md:w-1/4 z-0 pointer-events-none select-none overflow-hidden flex items-start pt-[16%] md:pt-0 md:items-end">
              <div 
                className="w-full h-[45%] md:h-[90%] bg-no-repeat animate-float-hero transition-all duration-300
                           bg-[length:260%] bg-[position:-10px_0px] opacity-[0.10]
                           dark:opacity-[0.05]
                           md:bg-contain md:bg-left-bottom md:opacity-[0.16]
                           dark:md:opacity-[0.08]
                           lg:opacity-[0.25]
                           dark:lg:opacity-[0.12]
                           mix-blend-multiply dark:mix-blend-screen dark:invert"
                style={{ backgroundImage: `url('/images/hero_female_sketch.png')` }}
              />
            </div>

            {/* Male Character Image Overlay (Safe Zone, Face + Upper Torso on Mobile, Responsive Opacity) */}
            <div className="absolute right-0 top-0 bottom-0 w-[24%] xs:w-[22%] md:w-1/4 z-0 pointer-events-none select-none overflow-hidden flex items-start pt-[16%] md:pt-0 md:items-end">
              <div 
                className="w-full h-[45%] md:h-[90%] bg-no-repeat animate-float-hero transition-all duration-300 [animation-delay:1.5s]
                           bg-[length:260%] bg-[position:right_-10px_top_0px] opacity-[0.10]
                           dark:opacity-[0.05]
                           md:bg-contain md:bg-right-bottom md:opacity-[0.16]
                           dark:md:opacity-[0.08]
                           lg:opacity-[0.25]
                           dark:lg:opacity-[0.12]
                           mix-blend-multiply dark:mix-blend-screen dark:invert"
                style={{ backgroundImage: `url('/images/hero_male_sketch.png')` }}
              />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/5 px-4 py-1 text-xs font-mono uppercase tracking-widest text-yellow-400 animate-pulse"
              >
                <Sparkles size={12} className="fill-yellow-400" />
                {settings.hero_subtitle}
              </motion.div>

              <h1 className="font-display text-5xl md:text-8xl font-black italic tracking-tighter text-zinc-900 dark:text-white leading-none flex flex-wrap justify-center overflow-hidden">
                {settings.hero_title.split(' ').map((word, idx) => (
                  <motion.span
                    key={idx}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className={word.toLowerCase().includes('fitness') || word.toLowerCase().includes('ran') ? 'text-yellow-400 font-black mr-2.5 md:mr-4' : 'mr-2.5 md:mr-4'}
                  >
                    {word}
                  </motion.span>
                ))}
              </h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="max-w-2xl mx-auto text-zinc-650 dark:text-zinc-400 text-sm md:text-base font-sans"
              >
                Elite fitness, hybrid CrossFit conditioning, and body transformations powered by premium Aerofit equipment. Experience street-level power right here in Habsiguda.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <button
                  onClick={() => openBooking('Hero Trial')}
                  className="w-full sm:w-auto rounded-full bg-yellow-400 text-black px-8 py-4 text-sm font-black italic uppercase tracking-wider hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(250,204,21,0.3)] cursor-pointer"
                >
                  START FREE TRIAL
                </button>
                <button
                  onClick={() => handleNavClick('plans')}
                  className="w-full sm:w-auto rounded-full border border-zinc-300 dark:border-zinc-850 hover:border-yellow-400 px-8 py-4 text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
                >
                  VIEW MEMBERSHIPS
                </button>
              </motion.div>

            </div>
          </section>

          {/* Why Choose RAN Section */}
          <section id="about" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">WHY CHOOSE US</span>
                <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
                  HYBRID PERFORMANCE ZONE
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  {settings.about_text}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-12">
                {/* Visual Muscle Feature Card */}
                <motion.div 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="lg:col-span-5 relative h-[420px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-900 group shadow-2xl"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center grayscale mix-blend-luminosity opacity-85 group-hover:scale-105 transition-transform duration-700" 
                    style={{ backgroundImage: `url('/images/back_muscle_traps.png')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 space-y-1 z-10">
                    <span className="text-[10px] text-yellow-400 font-mono font-bold tracking-widest uppercase">RAN HYBRID SYSTEM</span>
                    <h4 className="text-2xl font-display font-black italic text-white uppercase leading-tight">UNLEASH THE ANIMAL</h4>
                    <p className="text-zinc-300 text-[11px] leading-relaxed">Scientific hypertrophy models, high-tempo conditioning, and targeted strength compounds.</p>
                  </div>
                </motion.div>

                {/* Features list */}
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      icon: <Award className="text-yellow-450 dark:text-yellow-400" size={24} />,
                      title: "Certified Coaches",
                      desc: "Train under Head Coach Vikram Ran and certified specialists dedicated to technical lifting rules."
                    },
                    {
                      icon: <Dumbbell className="text-yellow-400" size={24} />,
                      title: "Aerofit Equipment",
                      desc: "Industrial-strength plate loaded Smith machines, cable crossovers, and commercial treadmills."
                    },
                    {
                      icon: <Shield className="text-yellow-400" size={24} />,
                      title: "CrossFit Zone",
                      desc: "Access diverse HIIT areas and tactical weight training programs."
                    },
                    {
                      icon: <Sparkles className="text-yellow-400" size={24} />,
                      title: "Zumba Carnivals",
                      desc: "High-tempo group dance cardio sessions led by verified coordinators."
                    }
                  ].map((card, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="p-6 rounded-xl bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 hover:border-yellow-400/40 dark:hover:border-yellow-400/40 transition-all duration-300 flex flex-col space-y-3 shadow-lg hover:shadow-yellow-400/5 hover:-translate-y-1"
                    >
                      <div className="p-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-fit">{card.icon}</div>
                      <h3 className="font-display text-base font-bold italic uppercase text-zinc-900 dark:text-white">{card.title}</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══════════════════════════════════════════════════
              360° VIRTUAL GYM TOUR — Premium Centerpiece Section
              ═══════════════════════════════════════════════════ */}
          {virtualTour && (
            <section className="relative py-24 md:py-32 overflow-hidden bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
              {/* Debug Badge */}
              <div className="absolute top-4 left-4 z-50 bg-red-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1 rounded border border-red-500 shadow-lg">
                VIRTUAL TOUR LOADED
              </div>

              {/* Background ambient effects */}
              <div className="absolute inset-0 pointer-events-none select-none z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-400/5 rounded-full blur-[120px]" />
                <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-yellow-400/3 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-yellow-400/3 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                {/* Section header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true }}
                >
                  <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">IMMERSIVE EXPERIENCE</span>
                  <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white mt-2">
                    EXPERIENCE RAN FITNESS
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base max-w-xl mx-auto mt-3">
                    Take a complete walkthrough of our facility before you visit.
                  </p>
                </motion.div>

                {/* Visible Debug Output */}
                <div className="text-[10px] font-mono text-zinc-500 mt-4 mb-2">
                  Video URL: {virtualTour.video_url ? (
                    <span className="text-green-400">{virtualTour.video_url}</span>
                  ) : (
                    <span className="text-red-500">EMPTY / NULL</span>
                  )}
                </div>

                {!virtualTour.video_url ? (
                  /* Fallback Placeholder Section when video_url is null/empty */
                  <div className="space-y-6">
                    {/* Direct debug video tag preview */}
                    <div className="max-w-md mx-auto p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-left shadow-lg">
                      <p className="text-[9px] font-mono text-zinc-400 mb-2 uppercase tracking-wider">DEBUG: Direct Video Tag Preview</p>
                      <video
                        src={virtualTour.video_url || undefined}
                        controls
                        className="w-full aspect-video bg-black rounded border border-zinc-800"
                      />
                      <p className="text-[8px] font-mono text-zinc-500 mt-2 truncate">
                        Raw URL Value: {JSON.stringify(virtualTour.video_url)}
                      </p>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="max-w-lg mx-auto p-8 rounded-2xl bg-white dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 text-center backdrop-blur-sm shadow-xl"
                    >
                      <div className="w-16 h-16 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-2xl">🎥</span>
                      </div>
                      <h3 className="font-display text-lg font-bold italic uppercase text-zinc-900 dark:text-white mb-2">
                        360° Virtual Tour Coming Soon
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed mb-6">
                        We are currently filming and processing a premium high-definition walkthrough of our state-of-the-art facility. Stay tuned to experience RAN Fitness online!
                      </p>
                      <button
                        onClick={() => { setBookingGoal('Virtual Tour Interest'); setBookingOpen(true); }}
                        className="px-6 py-2.5 rounded-lg bg-zinc-900 dark:bg-yellow-400 text-white dark:text-black text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300 shadow-md"
                      >
                        Book Free Trial & Notify Me
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <>
                  <div className="mt-12 max-w-3xl mx-auto space-y-8">
                    {/* Widescreen Preview Card */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.7 }}
                      viewport={{ once: true }}
                      onClick={() => setTourModalOpen(true)}
                      className="relative aspect-video w-full rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-900 bg-black cursor-pointer shadow-2xl group transition-all duration-500 hover:border-yellow-400/30"
                    >
                      {/* Thumbnail Image */}
                      {virtualTour.thumbnail_url ? (
                        <img
                          src={virtualTour.thumbnail_url}
                          alt="RAN Fitness Gym Tour Preview"
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.2] mix-blend-luminosity filter grayscale" style={{ backgroundImage: `url('/images/vascular_gym_muscles.png')` }} />
                      )}

                      {/* Ambient Dark Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/35 group-hover:via-black/10 transition-colors duration-500" />

                      {/* Centered Glass Play Button with Rotating Orbit Ring */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative flex items-center justify-center">
                          {/* Pulsing ring */}
                          <div className="absolute w-[84px] h-[84px] rounded-full border border-yellow-400/40 animate-ping opacity-60" />
                          <div className="absolute w-[110px] h-[110px] rounded-full border border-zinc-500/20 dark:border-zinc-800/40 animate-tour-ring-spin-reverse" />
                          
                          <div className="relative h-16 w-16 rounded-full bg-black/60 dark:bg-zinc-900/80 border border-yellow-400/40 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-yellow-400 group-hover:border-yellow-400 transition-all duration-300 shadow-2xl">
                            <Play size={24} className="text-yellow-400 group-hover:text-black fill-current translate-x-0.5 transition-colors" />
                          </div>
                        </div>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end text-left">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-yellow-400 text-black shadow-lg">
                            <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
                            FACILITY TOUR
                          </span>
                          <h3 className="font-display text-lg md:text-xl font-black italic uppercase text-white mt-1.5 drop-shadow-md">
                            Walk Through RAN Fitness (360° Walkthrough)
                          </h3>
                        </div>
                        <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-400 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded border border-zinc-800 backdrop-blur-sm">
                          HD Video Tour
                        </span>
                      </div>
                    </motion.div>

                    {/* Conversion CTA */}
                    <div className="text-center pt-2">
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-3">
                        Want to see the setup in person? Book your slot now!
                      </p>
                      <button
                        onClick={() => { setBookingGoal('Virtual Tour Landing Page'); setBookingOpen(true); }}
                        className="px-6 py-2.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all duration-300 animate-heartpulse"
                      >
                        Book Free Trial
                      </button>
                    </div>
                  </div>
                  </>
                )}
              </div>

              {/* Tour Video Modal — lazy loaded */}
              <VirtualTourModal
                isOpen={tourModalOpen}
                onClose={() => setTourModalOpen(false)}
                videoUrl={virtualTour.video_url || ''}
                onBookTrial={() => { setBookingGoal(''); setBookingOpen(true); }}
              />
            </section>
          )}

          {/* Equipment Showcase ("Powered by Aerofit") */}
          <section id="equipment" className="py-24 bg-zinc-100/50 dark:bg-zinc-950/20 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                <div>
                  <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">THE ECOSYSTEM</span>
                  <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white mt-1">
                    AEROFIT GYM ECOSYSTEM
                  </h2>
                  <p className="text-zinc-650 dark:text-zinc-500 text-xs uppercase tracking-widest font-bold mt-2">
                    ⚡ Powered by Aerofit Equipment Systems
                  </p>
                </div>
                
                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  {['All', 'Strength', 'Cardio', 'Functional'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setEquipmentFilter(cat as any)}
                      className={`px-4 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        equipmentFilter === cat 
                          ? 'bg-yellow-400 text-black shadow-md' 
                          : 'bg-white dark:bg-zinc-900 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredEquipment.map((eq) => (
                  <EquipmentCard key={eq.id} eq={eq} />
                ))}
              </div>

            </div>
          </section>

          {/* Meet Your Coaches */}
          <section id="trainers" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">COACH SPOTLIGHT</span>
                <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
                  MEET YOUR COACHES
                </h2>
                <p className="text-zinc-650 dark:text-zinc-400 text-sm">
                  Push your limits alongside our elite certified training crew. Hover cards to reveal tilt glow.
                </p>
              </div>

              {/* Staggered Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {trainers.map((trainer, idx) => (
                  <motion.div
                    key={trainer.id}
                    initial={{ opacity: 0, y: 35 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.12 }}
                    viewport={{ once: true }}
                    onClick={() => setSelectedTrainer(trainer)}
                    className="relative rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/30 overflow-hidden cursor-pointer group hover:border-yellow-400/40 dark:hover:border-yellow-400/40 hover:-translate-y-1 transition-all duration-300 shadow-xl flex flex-col justify-between"
                  >
                    {/* Picture */}
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img
                        src={trainer.image_url}
                        alt={trainer.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
                      
                      {/* Designation overlay */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="text-[10px] text-yellow-400 font-mono uppercase tracking-widest font-extrabold bg-zinc-950/80 px-2 py-1 rounded border border-zinc-900">
                          {trainer.experience}
                        </span>
                        <h4 className="font-display text-lg font-black italic text-white uppercase mt-2">{trainer.name}</h4>
                        <p className="text-zinc-300 text-xs">{trainer.designation}</p>
                      </div>
                    </div>

                    {/* Trainer Achievement Badges inside Card */}
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-950/80 border-t border-zinc-150 dark:border-zinc-900 flex flex-wrap gap-1.5 min-h-[44px]">
                      {trainer.badges && trainer.badges.map((badge, bIdx) => (
                        <span 
                          key={bIdx}
                          className="bg-yellow-400/10 text-yellow-500 dark:text-yellow-400 border border-yellow-400/20 rounded-full px-2 py-0.5 text-[8px] font-mono uppercase font-bold tracking-wider"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Head Coach Highlight Spotlight */}
              <div className="mt-16 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden p-6 md:p-12 flex flex-col md:flex-row items-center gap-8 relative shadow-2xl transition-colors duration-300">
                <div className="absolute -left-12 -top-12 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="w-full md:w-1/3 aspect-[3/4] md:aspect-square rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img
                    src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&q=80&w=600"
                    alt="Head Coach Vikram"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 space-y-4">
                  <span className="rounded bg-yellow-400 text-black px-3 py-1 text-[10px] font-black italic uppercase tracking-wider">
                    HEAD COACH SPOTLIGHT
                  </span>
                  <h3 className="font-display text-3xl font-black italic uppercase tracking-wider text-zinc-900 dark:text-white">
                    VIKRAM RAN
                  </h3>
                  <p className="text-zinc-650 dark:text-zinc-400 text-xs italic border-l-2 border-yellow-400 pl-4 font-mono">
                    “Discipline beats motivation every single day. Motivation gets you started, but consistency builds the steel.”
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono pt-2">
                    <div>
                      <strong className="text-yellow-500 dark:text-yellow-400">CERTIFICATIONS:</strong>
                      <p className="text-zinc-500 dark:text-zinc-500 text-[10px] uppercase mt-1">IPF Certified, Bodybuilding Recomp Lead</p>
                    </div>
                    <div>
                      <strong className="text-yellow-500 dark:text-yellow-400">EXPERIENCE:</strong>
                      <p className="text-zinc-500 dark:text-zinc-500 text-[10px] uppercase mt-1">10+ Years Heavy Comp Coaching</p>
                    </div>
                  </div>

                  <button
                    onClick={() => openBooking('Spotlight Session')}
                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 text-black px-6 py-3 text-xs font-black italic uppercase hover:bg-yellow-300 transition-all cursor-pointer"
                  >
                    BOOK COACH ASSESSMENT
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Fitness Journey (Steps Timeline) */}
          <section className="py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 overflow-hidden transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">YOUR PATHWAY</span>
                <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
                  THE TRANSFORMATION TIMELINE
                </h2>
                <p className="text-zinc-650 dark:text-zinc-400 text-sm">
                  What happens when you lock weights with RAN Fitness? Here is your step-by-step progress checklist.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
                <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[1px] bg-zinc-200 dark:bg-zinc-900/50 z-0 -translate-y-8" />
                
                {[
                  { step: "01", title: "Book Trial", desc: "Claim your free trial slot online to trigger our Telegram trainer dispatcher." },
                  { step: "02", title: "Meet Coach", desc: "Arrive at Street 8 Habsiguda facility and match with a personal trainer." },
                  { step: "03", title: "Assessment", desc: "Undergo a full structural body mass & mobility evaluation check." },
                  { step: "04", title: "Custom Plan", desc: "Receive your tailored diet, reps, and CrossFit scheduling map." },
                  { step: "05", title: "Transformation", desc: "Train consistently, document metrics, and enter the Transformation Wall." }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="relative z-10 flex flex-col items-center text-center p-6 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl group hover:border-yellow-400/20 dark:hover:border-yellow-400/20 transition-colors shadow-md"
                  >
                    <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center font-display text-sm font-black italic text-yellow-500 dark:text-yellow-400 mb-4 group-hover:bg-yellow-400 group-hover:text-black transition-all">
                      {item.step}
                    </div>
                    <h3 className="font-display text-sm font-bold uppercase text-zinc-900 dark:text-white">{item.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-2 leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

            </div>
          </section>

          {/* Transformation Wall */}
          <section id="transformations" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-100/50 dark:bg-zinc-950/40 relative overflow-hidden transition-colors duration-300">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.06] dark:opacity-[0.09] mix-blend-luminosity grayscale bg-cover bg-center" style={{ backgroundImage: `url('/images/vascular_gym_muscles.png')` }} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
              
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">COMMUNITY STRENGTH</span>
                <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
                  TRANSFORMATION WALL
                </h2>
                <p className="text-zinc-650 dark:text-zinc-400 text-sm">
                  Drag the center line on our slider to visualize the fitness results achieved by our members.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {transformations.map((trans) => (
                  <div key={trans.id} className="space-y-4">
                    <BeforeAfterSlider 
                      beforeImage={trans.before_image} 
                      afterImage={trans.after_image}
                      beforeLabel="Start Form"
                      afterLabel={trans.weight_lost || 'Transformed'}
                    />
                    <div className="p-4 bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-900 rounded-xl space-y-2 shadow-md">
                      <h4 className="font-display font-black text-lg italic text-zinc-900 dark:text-white uppercase">{trans.member_name}</h4>
                      <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">{trans.story}</p>
                      <div className="flex gap-4 text-[10px] font-mono text-yellow-500 dark:text-yellow-400 uppercase tracking-wider font-extrabold">
                        {trans.weight_lost && <span>💥 {trans.weight_lost}</span>}
                        {trans.muscle_gained && <span>💪 {trans.muscle_gained}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* C. Trusted by Our Members (Google Reviews test) */}
          <section className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
                <div>
                  <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">SOCIAL PROOF</span>
                  <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white mt-1">
                    TRUSTED BY OUR MEMBERS
                  </h2>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm mt-2">
                    Honest feedback from local Habsiguda gym members. (Connected to Maps API)
                  </p>
                </div>

                {/* Rating badge */}
                <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-lg">
                  <div className="text-3xl font-black italic font-display text-yellow-500 dark:text-yellow-400">4.9</div>
                  <div className="text-xs">
                    <div className="flex text-yellow-500 dark:text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className="fill-yellow-500 dark:fill-yellow-400" />
                      ))}
                    </div>
                    <div className="text-zinc-500 font-mono text-[9px] uppercase tracking-wider font-bold mt-1">
                      342 Reviews on Google
                    </div>
                  </div>
                </div>
              </div>

              {/* Review cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {googleReviews.map((rev, idx) => (
                  <div key={idx} className="p-6 bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-xl relative flex flex-col justify-between space-y-4 shadow-md">
                    <div className="space-y-3">
                      <div className="flex text-yellow-500 dark:text-yellow-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} className="fill-yellow-500 dark:fill-yellow-400" />
                        ))}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 text-xs leading-relaxed">"{rev.text}"</p>
                    </div>
                    
                    <div className="flex items-center gap-3 pt-3 border-t border-zinc-150 dark:border-zinc-900/50">
                      <div className="h-8 w-8 rounded-full bg-yellow-400 text-black font-extrabold text-xs flex items-center justify-center">
                        {rev.avatar}
                      </div>
                      <div>
                        <strong className="text-zinc-900 dark:text-white text-xs block">{rev.name}</strong>
                        <span className="text-zinc-500 text-[10px] font-mono">{rev.relativeTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </section>

          {/* Membership Plans */}
          <section id="plans" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">AFFORDABLE RATES</span>
                <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
                  MEMBERSHIP PLANS
                </h2>
                <p className="text-zinc-650 dark:text-zinc-400 text-sm">
                  Select your tier and unlock premium access. Hover over cards to load weights.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {plans.map((plan) => {
                  const isHovered = hoveredPlanId === plan.id;
                  return (
                    <motion.div
                      key={plan.id}
                      onMouseEnter={() => setHoveredPlanId(plan.id)}
                      onMouseLeave={() => setHoveredPlanId(null)}
                      whileHover={{ scale: 1.02 }}
                      className={`relative rounded-xl p-8 border flex flex-col justify-between shadow-lg ${
                        plan.popular_badge 
                          ? 'border-yellow-400 bg-white dark:bg-zinc-900/50 shadow-[0_0_30px_rgba(250,204,21,0.05)]' 
                          : 'border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/20'
                      }`}
                    >
                      {plan.popular_badge && (
                        <span className="absolute top-0 right-8 -translate-y-1/2 rounded bg-yellow-400 text-black px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest">
                          MOST POPULAR
                        </span>
                      )}

                      <div className="space-y-4">
                        <h3 className="font-display text-xl font-black italic uppercase text-zinc-900 dark:text-white">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-4xl font-black italic text-yellow-500 dark:text-yellow-400">₹{plan.price}</span>
                          <span className="text-zinc-500 text-xs">/ {plan.duration}</span>
                        </div>
                        
                        <hr className="border-zinc-150 dark:border-zinc-900" />
                        
                        <ul className="space-y-3 pt-2">
                          {plan.benefits.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500 dark:bg-yellow-400 mt-1.5 flex-shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-8 space-y-4">
                        <div className="h-12 flex items-center justify-center">
                          {isHovered ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }} 
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex items-center gap-1 text-yellow-500 dark:text-yellow-400 font-mono text-[9px] uppercase tracking-wider"
                            >
                              <Dumbbell className="animate-bounce" size={14} />
                              BARBELL LOADING...
                            </motion.div>
                          ) : (
                            <div className="h-[1px] w-12 bg-zinc-200 dark:bg-zinc-900" />
                          )}
                        </div>

                        <button
                          onClick={() => openBooking(`Plan: ${plan.name}`)}
                          className={`w-full text-center rounded-lg py-3 text-xs font-black italic uppercase tracking-widest transition-all cursor-pointer ${
                            plan.popular_badge 
                              ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-md' 
                              : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-250 dark:border-zinc-800'
                          }`}
                        >
                          SELECT PLAN
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </div>

            </div>
          </section>

          {/* D. Event Board Section (Challenges & Zumba events) */}
          {events.length > 0 && (
            <section className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                  <span className="text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">GYM EVENTS</span>
                  <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white">
                    UPCOMING EVENTS & CHALLENGES
                  </h2>
                  <p className="text-zinc-650 dark:text-zinc-400 text-sm">
                    Register and test your conditioning inside our active regional events.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {events.map((ev) => (
                    <div key={ev.id} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-yellow-400/30 dark:hover:border-yellow-400/30 transition-all shadow-md">
                      {ev.image_url && (
                        <div className="aspect-video w-full overflow-hidden relative border-b border-zinc-150 dark:border-zinc-900">
                          <img src={ev.image_url} alt={ev.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <span className="absolute top-4 left-4 bg-yellow-400 text-black font-mono text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded">
                            {ev.tag}
                          </span>
                        </div>
                      )}
                      
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-yellow-500 dark:text-yellow-400">
                          <Calendar size={14} />
                          <span>{ev.date}</span>
                        </div>
                        <h3 className="font-display font-black text-xl italic text-zinc-900 dark:text-white uppercase">{ev.name}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs leading-relaxed">{ev.description}</p>
                      </div>

                      <div className="p-6 pt-0">
                        <button
                          onClick={() => openBooking(`Event registration: ${ev.name}`)}
                          className="w-full text-center rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold py-2.5 text-xs hover:border-yellow-400 dark:hover:border-yellow-400 hover:text-zinc-950 dark:hover:text-white transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Register for event
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </section>
          )}

          {/* Scroll-Triggered Premium Statistics */}
          <section className="py-20 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 relative transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCounter value="1200" label="Active Members" suffix="+" />
                <StatCounter value="3500" label="Weight Lost" suffix=" kg+" />
                <StatCounter value="25" label="Aerofit Stations" />
                <StatCounter value="5000" label="Zumba Sweats" suffix="+" />
                <StatCounter value="10" label="Years of Experience" suffix="+" />
              </div>
            </div>
          </section>

          {/* E. Career Hiring portal ("Join Our Team") */}
          <section className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-100/30 dark:bg-zinc-950/20 relative overflow-hidden transition-colors duration-300">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] mix-blend-luminosity grayscale bg-cover bg-center" style={{ backgroundImage: `url('/images/vascular_gym_muscles.png')` }} />
            
            <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 relative z-10">
              
              <div className="text-center space-y-2">
                <span className="text-yellow-500 dark:text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">WE ARE HIRING</span>
                <h2 className="font-display text-2xl md:text-4xl font-black italic uppercase text-zinc-900 dark:text-white">
                  JOIN THE RAN TEAM
                </h2>
                <p className="text-zinc-650 dark:text-zinc-400 text-xs max-w-lg mx-auto">
                  Are you a certified trainer or a professional receptionist? Apply below to build your career with Habsiguda's premium performance zone.
                </p>
              </div>

              {/* Hiring Form */}
              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 md:p-8 shadow-xl">
                {!careerSuccess ? (
                  <form onSubmit={handleCareerSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">Full Name</label>
                        <input
                          type="text"
                          required
                          value={careerForm.name}
                          onChange={(e) => setCareerForm({ ...careerForm, name: e.target.value })}
                          className="w-full rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-400 text-zinc-900 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={careerForm.phone}
                          onChange={(e) => setCareerForm({ ...careerForm, phone: e.target.value })}
                          className="w-full rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-400 text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">Role Applied For</label>
                        <select
                          value={careerForm.role}
                          onChange={(e) => setCareerForm({ ...careerForm, role: e.target.value })}
                          className="w-full rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-400 text-zinc-900 dark:text-white"
                        >
                          <option value="Trainer" className="text-black">Trainer / Fitness Coach</option>
                          <option value="Receptionist" className="text-black">Receptionist / Front Desk</option>
                          <option value="Sales Executive" className="text-black">Sales Executive</option>
                          <option value="Other" className="text-black">Other Role</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 dark:text-zinc-400 font-mono">Experience & Details</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 3 yrs at Gold's, CPR certified"
                          value={careerForm.experience}
                          onChange={(e) => setCareerForm({ ...careerForm, experience: e.target.value })}
                          className="w-full rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 text-xs focus:outline-none focus:border-yellow-400 text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={careerSubmitting}
                      className="w-full text-center rounded-lg bg-yellow-400 text-black py-3 text-xs font-black italic uppercase hover:bg-yellow-300 transition-colors font-mono tracking-widest cursor-pointer"
                    >
                      {careerSubmitting ? 'Submitting resume application...' : 'SUBMIT HIRING APPLICATION'}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-6 space-y-3">
                    <div className="bg-green-500 rounded-full p-3 text-black">
                      <Smile size={24} />
                    </div>
                    <h4 className="font-display font-black italic uppercase text-lg text-green-600 dark:text-green-500">APPLICATION SUBMITTED!</h4>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs max-w-sm leading-relaxed">
                      Thank you for applying. We have saved your candidate details and sent them to our trainers. We will get back to you soon.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </section>

          {/* Call To Action Ending */}
          <section className="relative py-28 overflow-hidden bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 transition-colors duration-300">
            <div className="absolute inset-0 energy-glow pointer-events-none opacity-20 dark:opacity-100" />
            <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6">
              
              <h2 className="font-display text-4xl md:text-7xl font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
                YOUR TRANSFORMATION <br />
                <span className="text-yellow-500 dark:text-yellow-400">STARTS TODAY</span>
              </h2>
              
              <p className="max-w-xl mx-auto text-zinc-650 dark:text-zinc-400 text-xs md:text-sm font-medium">
                No more excuses. Lock hands with Vikram Ran and the RAN Fitness coaching crew. We will send details straight to Telegram for quick trainer follow-up.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => openBooking('CTA Trial')}
                  className="w-full sm:w-auto rounded-full bg-yellow-400 text-black px-8 py-4 text-xs font-black italic uppercase hover:bg-yellow-300 transition-all animate-heartpulse cursor-pointer shadow-md"
                >
                  CLAIM FREE TRIAL SPOT
                </button>
                <button
                  onClick={() => handleNavClick('contact')}
                  className="w-full sm:w-auto rounded-full border border-zinc-300 dark:border-zinc-850 hover:border-yellow-400 px-8 py-4 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  TALK TO TRAINER
                </button>
              </div>

            </div>
          </section>

          {/* Maps & Contact Section */}
          <section id="contact" className="py-24 border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                
                <div className="space-y-8">
                  <div>
                    <span className="text-yellow-500 dark:text-yellow-400 font-mono text-xs uppercase tracking-widest font-bold">LOCATION & CONTACT</span>
                    <h2 className="font-display text-3xl md:text-5xl font-black italic uppercase text-zinc-900 dark:text-white mt-1">
                      RAN FITNESS HABSIGUDA
                    </h2>
                    <p className="text-zinc-650 dark:text-zinc-400 text-sm mt-3">
                      Drop by the facility. Feel free to call us or send an inquiry form which directly alerts our trainer staff.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs">
                      <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-yellow-500 dark:text-yellow-400">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <strong className="text-zinc-400 dark:text-zinc-500 block uppercase text-[9px] font-mono font-bold">Location Address:</strong>
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{settings.contact_address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-yellow-500 dark:text-yellow-400 animate-pulse">
                        <Phone size={18} />
                      </div>
                      <div>
                        <strong className="text-zinc-400 dark:text-zinc-500 block uppercase text-[9px] font-mono font-bold">Call/WhatsApp:</strong>
                        <a href="tel:9666345644" className="text-zinc-700 dark:text-zinc-300 hover:text-yellow-500 dark:hover:text-yellow-400 font-bold">{settings.contact_phone}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-yellow-500 dark:text-yellow-400">
                        <Mail size={18} />
                      </div>
                      <div>
                        <strong className="text-zinc-400 dark:text-zinc-500 block uppercase text-[9px] font-mono font-bold">Email Support:</strong>
                        <a href={`mailto:${settings.contact_email}`} className="text-zinc-700 dark:text-zinc-300 hover:text-yellow-500 dark:hover:text-yellow-400">{settings.contact_email}</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-yellow-500 dark:text-yellow-400">
                        <Clock size={18} />
                      </div>
                      <div>
                        <strong className="text-zinc-400 dark:text-zinc-500 block uppercase text-[9px] font-mono font-bold">Business Hours:</strong>
                        <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{settings.business_hours}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-900 aspect-video shadow-2xl relative">
                  <iframe
                    src={settings.google_maps_link}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    title="RAN Fitness Google Maps location"
                    className="dark:filter dark:invert dark:opacity-85"
                  />
                </div>

              </div>

            </div>
          </section>

          {/* F. Hidden SEO Landing Blocks (Keyword-rich text sections for local searches) */}
          <section className="bg-zinc-100 dark:bg-zinc-950 py-8 px-4 text-zinc-400 dark:text-zinc-800 select-none border-t border-zinc-200 dark:border-zinc-950">
            <div className="max-w-7xl mx-auto text-[10px] font-mono text-zinc-600 dark:text-zinc-900 leading-normal text-justify">
              <h5 className="font-bold uppercase mb-1">Local Business Schema Directory:</h5>
              <p>
                Looking for the best gym in Habsiguda or a top-tier fitness center near Street 8 Hyderabad? RAN Fitness offers premium personal training, high-intensity CrossFit workouts, and lively Zumba classes near you. Equipped exclusively with professional Aerofit commercial strength, cardio, and functional training stations. Get fit under Vikram Ran and certified coaches. Access fat loss, muscle gain programs, and custom nutritional consultations. Serving Habsiguda, Nacharam, Tarnaka, and Ramanthapur fitness communities.
              </p>
            </div>
          </section>

          {/* Premium Apple-style Footer */}
          <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900 py-16 text-xs text-zinc-500 font-sans relative overflow-hidden transition-colors duration-300">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04] dark:opacity-[0.06] mix-blend-luminosity grayscale bg-cover bg-center" style={{ backgroundImage: `url('/images/vascular_gym_muscles.png')` }} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                
                <div className="col-span-2 space-y-4">
                  <Logo size={40} variant="full" />
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed max-w-sm">
                    RAN Fitness is Street 8 Habsiguda's premier hybrid conditioning, zumba, and heavy bodybuilding studio. Fully equipped with commercial Aerofit workstations.
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-700 text-[10px]">
                    © {new Date().getFullYear()} RAN Fitness. All Rights Reserved.
                  </p>
                </div>

                <div className="space-y-3">
                  <strong className="text-zinc-800 dark:text-zinc-300 font-mono uppercase tracking-widest text-[9px] block">SITE SECTIONS</strong>
                  <ul className="space-y-2">
                    {['Home', 'About', 'Equipment', 'Trainers', 'Plans', 'Transformations'].map((i) => (
                      <li key={i}>
                        <button onClick={() => handleNavClick(i.toLowerCase())} className="hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors cursor-pointer text-zinc-500 dark:text-zinc-400 text-[11px]">
                          {i}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <strong className="text-zinc-800 dark:text-zinc-300 font-mono uppercase tracking-widest text-[9px] block">PROGRAMS</strong>
                  <ul className="space-y-2 font-mono text-[10px]">
                    <li><span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase">🏋️ Strength Training</span></li>
                    <li><span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase">🤸 CrossFit Hybrid</span></li>
                    <li><span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase">💃 Zumba Sessions</span></li>
                    <li><span className="text-zinc-500 dark:text-zinc-400 font-semibold uppercase">🎯 Transformation Goal</span></li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <strong className="text-zinc-800 dark:text-zinc-300 font-mono uppercase tracking-widest text-[9px] block">RESOURCES</strong>
                    <div>
                      <a href="tel:9666345644" className="text-zinc-500 dark:text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold block text-[11px]">Direct Call</a>
                      <a href="https://wa.me/919666345644" className="text-zinc-500 dark:text-zinc-400 hover:text-yellow-500 dark:hover:text-yellow-400 font-semibold block mt-1 text-[11px]">WhatsApp Chat</a>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setAdminOpen(true)}
                      className="inline-flex items-center gap-1.5 text-zinc-800 hover:text-yellow-400 transition-colors border border-zinc-900 rounded p-1.5 hover:border-yellow-400/20"
                      aria-label="Admin control lock"
                    >
                      <Lock size={12} />
                      <span className="text-[9px] font-mono">CMS PANEL</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </footer>

          {/* G. Mobile-Only Emergency Fixed call button (☎ Call Now) */}
          <div className="sm:hidden fixed bottom-6 left-6 z-[1000]">
            <motion.a
              href="tel:9666345644"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-14 px-5 items-center justify-center gap-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-black italic uppercase tracking-wider text-xs shadow-2xl"
            >
              <Phone size={16} className="fill-current" />
              ☎ CALL NOW
            </motion.a>
          </div>

          {/* Smart Floating Action Bar */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/85 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-900 rounded-full py-2.5 px-6 flex items-center gap-6 shadow-2xl transition-colors duration-300">
            <a
              href="https://instagram.com/ranfitness_habsiguda"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-yellow-400 transition-colors"
              aria-label="Instagram profile"
            >
              <Instagram size={18} />
            </a>
            <a
              href="https://wa.me/919666345644?text=Hi%20RAN%20Fitness%2C%20I%20would%20like%20to%20inquire%20about%20your%20membership%20plans."
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-yellow-400 transition-colors"
              aria-label="WhatsApp chat"
            >
              <svg className="w-[18px] h-[18px] fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.458L0 24zm6.135-4.702c1.642.975 3.255 1.488 4.771 1.491 5.485.001 9.946-4.437 9.949-9.886.002-2.643-1.021-5.128-2.883-6.991C16.146 1.95 13.682.923 11.08.923c-5.487 0-9.95 4.438-9.953 9.887-.001 2.012.518 3.985 1.502 5.688L1.6 22.28l6.092-1.597z" />
              </svg>
            </a>
            <a
              href="tel:9666345644"
              className="text-zinc-400 hover:text-yellow-400 transition-colors"
              aria-label="Phone call"
            >
              <Phone size={18} />
            </a>
            <div className="h-4 w-[1px] bg-zinc-800" />
            <button
              onClick={() => openBooking('Floating Action Bar')}
              className="rounded-full bg-yellow-400 text-black px-4 py-1.5 text-[10px] font-black italic uppercase tracking-wider hover:bg-yellow-300 transition-colors"
            >
              BOOK TRIAL
            </button>
          </div>

          {/* Coach Chat Bot Interface */}
          <CoachChat onOpenBooking={openBooking} />

          {/* Modals bindings */}
          <BookingModal 
            isOpen={bookingOpen} 
            onClose={() => setBookingOpen(false)} 
            initialGoal={bookingGoal}
            source={bookingGoal ? `Interactive Choice: ${bookingGoal}` : 'Main Booking Form'}
          />
          
          <AdminModal 
            isOpen={adminOpen} 
            onClose={() => setAdminOpen(false)} 
          />

          <MemberLoginModal
            isOpen={memberLoginOpen}
            onClose={() => setMemberLoginOpen(false)}
          />

          {/* Trainer Profile details Modal */}
          <AnimatePresence>
            {selectedTrainer && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedTrainer(null)}
                  className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                />
                
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 text-zinc-900 dark:text-white shadow-2xl overflow-hidden transition-colors duration-300"
                >
                  <button
                    onClick={() => setSelectedTrainer(null)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-white"
                  >
                    <X size={20} />
                  </button>

                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <img
                      src={selectedTrainer.image_url}
                      alt={selectedTrainer.name}
                      className="w-full sm:w-1/3 aspect-[3/4] object-cover rounded-xl border border-zinc-200 dark:border-zinc-900"
                    />
                    <div className="flex-1 space-y-4">
                      <div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          <span className="rounded bg-yellow-400/10 border border-yellow-400/20 text-yellow-500 dark:text-yellow-400 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest">
                            {selectedTrainer.experience} Experience
                          </span>
                          {selectedTrainer.badges && selectedTrainer.badges.map((badge, bIdx) => (
                            <span 
                              key={bIdx}
                              className="rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                        <h3 className="font-display text-2xl font-black italic uppercase text-zinc-900 dark:text-white mt-1">
                          {selectedTrainer.name}
                        </h3>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs">{selectedTrainer.designation}</p>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-yellow-500 dark:text-yellow-400 text-[10px] uppercase tracking-wider font-mono">Specialization:</strong>
                        <p className="text-zinc-600 dark:text-zinc-300 text-xs">{selectedTrainer.specialization}</p>
                      </div>

                      <p className="text-zinc-500 text-xs italic font-serif border-l border-zinc-200 dark:border-zinc-800 pl-3">
                        "{selectedTrainer.quote}"
                      </p>

                      <div className="flex gap-2">
                        <a
                          href={selectedTrainer.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3.5 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-yellow-400/25 transition-all"
                        >
                          <Instagram size={12} />
                          Instagram
                        </a>
                        <button
                          onClick={() => {
                            setSelectedTrainer(null);
                            openBooking(`Trainer request: ${selectedTrainer.name}`);
                          }}
                          className="rounded-lg bg-yellow-400 text-black px-4 py-2 text-xs font-black italic uppercase hover:bg-yellow-300 transition-all"
                        >
                          BOOK ASSESSMENT
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// EQUIPMENT CARD HELPER COMPONENT (Framer Motion tilt effect wrapper)
// ---------------------------------------------------------------------------
const EquipmentCard: React.FC<{ eq: Equipment }> = ({ eq }) => {
  const [hovered, setHovered] = useState(false);

  const getIconName = (name: string): string => {
    const n = name.toLowerCase();
    if (n.includes('dumbbell')) return 'dumbbell';
    if (n.includes('barbell')) return 'barbell';
    if (n.includes('plate')) return 'weightplate';
    if (n.includes('smith')) return 'smithmachine';
    if (n.includes('bench')) return 'benchpress';
    if (n.includes('cable') || n.includes('crossover')) return 'cablecrossover';
    if (n.includes('treadmill')) return 'treadmill';
    if (n.includes('cross trainer') || n.includes('elliptical')) return 'crosstrainer';
    if (n.includes('bike') || n.includes('cycle')) return 'exercisebike';
    if (n.includes('stair') || n.includes('climber')) return 'stairclimber';
    if (n.includes('rope')) return 'battleropes';
    if (n.includes('kettlebell')) return 'kettlebell';
    if (n.includes('squat') || n.includes('rack')) return 'squatrack';
    if (n.includes('leg press')) return 'legpress';
    if (n.includes('lat pulldown') || n.includes('low row')) return 'latpulldown';
    if (n.includes('slam ball')) return 'slamball';
    if (n.includes('plyo') || n.includes('box')) return 'plyobox';
    if (n.includes('band')) return 'resistancebands';
    return 'generic';
  };

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900/10 p-6 flex flex-col justify-between hover:border-yellow-400/30 dark:hover:border-yellow-400/30 hover:shadow-[0_0_30px_rgba(250,204,21,0.2)] transition-all duration-300 group shadow-lg min-h-[340px]"
    >
      {/* Premium glass reflection overlay */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

      <div className="space-y-4">
        <div className="h-28 flex items-center justify-center p-2 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900/50 group-hover:border-yellow-400/10 transition-colors relative overflow-hidden">
          <motion.div
            animate={hovered ? { y: [0, -4, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 flex items-center justify-center"
          >
            <EquipmentSvg name={getIconName(eq.name)} className="w-full h-full text-zinc-400 dark:text-zinc-600 group-hover:text-yellow-400 transition-colors" isHovered={hovered} />
          </motion.div>
        </div>

        <div>
          <span className="text-[9px] text-yellow-500 dark:text-yellow-400 font-mono uppercase tracking-widest font-extrabold">
            {eq.category} • {eq.brand}
          </span>
          <h3 className="font-display text-base font-bold italic text-zinc-900 dark:text-white uppercase mt-1 group-hover:text-yellow-400 transition-colors">
            {eq.name}
          </h3>
          <p className="text-zinc-600 dark:text-zinc-500 text-xs mt-2 leading-relaxed line-clamp-2">
            {eq.description}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-150 dark:border-zinc-900/50 flex justify-between items-center text-[10px] font-mono">
        <span className="text-zinc-500 dark:text-zinc-600 uppercase font-semibold">Specs:</span>
        <span className="text-zinc-700 dark:text-zinc-400 truncate max-w-[70%]" title={eq.spec_details}>
          {eq.spec_details}
        </span>
      </div>
    </motion.div>
  );
};
