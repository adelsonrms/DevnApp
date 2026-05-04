import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Github, LayoutGrid, Building2 } from 'lucide-react';
import TechFrame from '../components/ui/TechFrame';
import NavbarBrand from '../components/layout/parts/NavbarBrand';
import Footer from '../components/layout/parts/Footer';
import { cn } from '../lib/utils';

/**
 * Landing Page Component
 * 
 * High-impact, vivid entry point.
 * Now standardized with MainLayout's tech-industrial aesthetic.
 */
const LandingPage: React.FC = () => {
  return (
    <div id="landing-layout" className="flex flex-col h-screen bg-background overflow-hidden font-sans transition-colors">
      {/* Standardized Header */}
      <header id="landing-header" className="flex-none z-50 border-b border-border-strong bg-panel-bg h-14 flex items-center justify-between">
        <NavbarBrand />
        <div className="flex items-center gap-6 px-6">
          <Link to="/login" className="text-[10px] font-black text-foreground/100 hover:text-primary uppercase tracking-[0.2em] transition-colors">
            AUTHENTICATE_SESSION
          </Link>
          <Link to="/dashboard" className="px-4 py-1.5 bg-primary text-black text-[10px] font-black uppercase tracking-widest border border-black hover:brightness-110 transition-all">
            ACCESS_CONSOLE
          </Link>
        </div>
      </header>

      {/* Main Content Area with TechFrame */}
      <div id="landing-window" className="flex flex-1 overflow-hidden">
        <main id="landing-content" className="flex-1 overflow-hidden relative">
          <TechFrame 
            id="landing-content-tech-frame"
            parent="landing-content"
            className="h-full w-full"
            contentClassName="custom-scrollbar"
          >
            <div className="relative min-h-full flex flex-col items-center justify-center p-6 md:p-24 overflow-hidden">
              {/* Immersive Background Effects */}
              <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-primary/10 blur-[150px] -z-10 rounded-full animate-pulse" />
              <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-secondary/10 blur-[150px] -z-10 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 mb-20 text-center"
              >
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black tracking-[0.3em] text-primary uppercase backdrop-blur-md">
                  <Sparkles size={14} className="animate-pulse" />
                  DEVNFW_ECOSYSTEM &middot; 2026_EDITION
                </div>
                
                <h1 className="text-7xl md:text-9xl font-black tracking-tighter leading-none uppercase">
                  <span className="text-white">Devn</span>
                  <span className="text-secondary drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">App</span>
                </h1>
                
                <p className="text-lg md:text-2xl text-foreground/50 max-w-3xl mx-auto font-bold uppercase tracking-tight leading-tight">
                  A fundação <span className="text-white">definitiva</span> para aplicações modernas. 
                  Arquitetura atômica com o DNA <span className="text-secondary">Devonno</span>.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl"
              >
                {[
                  { 
                    title: "FULL_STACK", 
                    desc: "VITE_6, REACT_18 & TAILWIND_4. PERFORMANCE_EXTREMA POR PADRÃO.",
                    icon: <LayoutGrid className="text-primary" size={24} />,
                    color: "border-primary/30"
                  },
                  { 
                    title: "AGNÓSTICO", 
                    desc: "TROQUE SEU BANCO DE DADOS VIA ENV SEM ALTERAR O CÓDIGO FONTE.",
                    icon: <Building2 className="text-secondary" size={24} />,
                    color: "border-secondary/30",
                    featured: true
                  },
                  { 
                    title: "MONOREPO", 
                    desc: "SHARED_TYPES E UTILITIES NATIVOS COM NPM_WORKSPACES.",
                    icon: <Github className="text-accent" size={24} />,
                    color: "border-accent/30"
                  }
                ].map((feature, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "p-8 bg-background border-2 border-border-strong text-left transition-all duration-300 group relative overflow-hidden",
                      feature.featured && "bg-white/[0.02] border-secondary/50 scale-105 z-10",
                      !feature.featured && "hover:border-foreground/30"
                    )}
                  >
                    <div className="w-12 h-12 bg-background border-2 border-border-strong flex items-center justify-center mb-6 group-hover:border-foreground transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-black mb-4 text-white uppercase tracking-tighter">{feature.title}</h3>
                    <p className="text-[10px] font-bold text-foreground/100 leading-relaxed uppercase tracking-widest">
                      {feature.desc}
                    </p>
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500" />
                  </div>
                ))}
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-20 flex flex-wrap justify-center gap-6"
              >
                 <Link to="/dashboard" className="group px-10 py-5 bg-secondary text-black font-black uppercase tracking-widest text-xs border-2 border-black hover:brightness-110 active:scale-95 transition-all flex items-center gap-3">
                   ACESSAR_CONSOLE
                   <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <button className="px-10 py-5 bg-background border-2 border-border-strong text-white font-black uppercase tracking-widest text-xs hover:bg-white/5 transition-all">
                   REPOSITÓRIO_GIT
                 </button>
              </motion.div>
            </div>
          </TechFrame>
        </main>
      </div>

      {/* Standardized Footer */}
      <footer id="landing-footer" className="flex-none z-50 border-t border-border-strong">
        <Footer />
      </footer>
    </div>
  );
};

export default LandingPage;
