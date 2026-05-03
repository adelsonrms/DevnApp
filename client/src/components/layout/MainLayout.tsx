import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './parts/Sidebar';
import Navbar from './parts/Navbar';
import Footer from './parts/Footer';
import TechFrame from '../ui/TechFrame';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div id="main-layout" className="flex flex-col h-screen bg-background overflow-hidden font-sans transition-colors">
      {/* 1. Header (Navbar) */}
      <header id="main-header" className="flex-none z-50 border-b border-border-strong">
        <Navbar />
      </header>

      <div id="main-window" className="flex flex-1 overflow-hidden">
        {/* 2. Aside (Sidebar) */}
        <aside id="main-sidebar" className="flex-none z-40 w-64">
          <TechFrame 
            id="main-sidebar-tech-frame"
            parent="main-sidebar"
            className="h-full w-full" 
            hideBorders={['right']} 
            contentClassName="scrollbar-hide"
          >
            <Sidebar />
          </TechFrame>
        </aside>

        {/* 3. Main Content */}
        <main id="main-content" className="flex-1 overflow-hidden relative">
          <TechFrame 
            id="main-content-tech-frame"
            parent="main-content"
            className="h-full w-full"
            contentClassName="custom-scrollbar"
          >
            <div className="p-6 h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </TechFrame>
        </main>
      </div>

      {/* 4. Footer */}
      <footer id="main-footer" className="flex-none z-50 border-t border-border-strong">
        <Footer />
      </footer>
    </div>
  );
};

export default MainLayout;
