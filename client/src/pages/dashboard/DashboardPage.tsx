import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useOrg } from '../../contexts/OrgContext';
import { Users, Building2, ShieldCheck, Zap, ArrowUpRight, Activity, ArrowRight, LayoutGrid, ListTodo, BarChart3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

/**
 * DashboardPage Component
 * 
 * High-visibility, symmetrical Bento Grid layout.
 * Focuses on vivid colors and clear typography.
 */
const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { currentOrg } = useOrg();

  const stats = [
    { label: 'Usuários Ativos', value: '1,284', icon: <Users size={20} />, color: 'text-secondary', variant: 'secondary' as const, trend: '+12.5%', detail: 'SYNC_OK' },
    { label: 'Unidades', value: '12', icon: <Building2 size={20} />, color: 'text-primary', variant: 'primary' as const, trend: '+2', detail: 'ACTIVE' },
    { label: 'Performance', value: '99.9%', icon: <Zap size={20} />, color: 'text-accent', variant: 'accent' as const, trend: 'OPTIMIZED', detail: '12ms' },
    { label: 'Integridade', value: '100%', icon: <ShieldCheck size={20} />, color: 'text-emerald-400', variant: 'default' as const, trend: 'SECURE', detail: 'E2E' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-strong pb-6">
        <div className="space-y-1">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex items-center gap-2 text-[9px] font-black tracking-[0.3em] text-primary uppercase"
          >
            WORKSPACE_PREMIUM_ACTIVE
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold tracking-tighter text-foreground uppercase"
          >
            HELLO, <span className="text-primary">{user?.name?.split(' ')[0]}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-black text-foreground uppercase tracking-tight"
          >
             SYSTEM_NOTIFICATIONS: <span className="text-primary font-black underline decoration-primary/30 underline-offset-4">04_PENDING</span>
          </motion.p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ListTodo size={14} />
            REPORTS
          </Button>
          <Button variant="primary" size="sm">
            <LayoutGrid size={14} />
            NEW_PROJECT
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div key={i} variants={item}>
            <Card variant={stat.variant} className="group relative">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 bg-background ${stat.color} flex items-center justify-center border border-border-strong/50`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black tracking-widest uppercase ${stat.color} border border-current/30 px-2 py-0.5`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-foreground uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</p>
                  <ArrowUpRight size={16} className={`${stat.color} opacity-50 group-hover:opacity-100 transition-all`} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border-strong/30 flex items-center justify-between">
                <span className="text-[8px] font-black text-foreground uppercase tracking-widest">{stat.detail}</span>
                <div className={`h-2 w-2 ${stat.color.replace('text-', 'bg-')} border border-black/20`} />
              </div>
            </Card>
          </motion.div>
        ))}

        {/* Activity Log */}
        <motion.div 
          variants={item}
          className="md:col-span-2 lg:col-span-3"
        >
          <Card className="h-full">
            <div className="flex items-center justify-between mb-8 border-b border-border-strong/30 pb-4">
              <div className="flex items-center gap-3">
                <Activity size={18} className="text-secondary" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">OPERATIONAL_DATA_FLOW</h3>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                FILTER_LOGS
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-background border border-border-strong/50 hover:border-primary transition-all group cursor-pointer">
                  <div className={`w-2 h-2 ${i === 0 ? 'bg-secondary animate-pulse' : 'bg-foreground/20'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-black text-foreground tracking-tight uppercase truncate">SYNC_ID_{1024 + i}</p>
                      <span className="text-[8px] font-black px-1.5 py-0.5 bg-primary text-black uppercase tracking-tighter shrink-0">ACTIVE</span>
                    </div>
                    <p className="text-[9px] font-black text-foreground uppercase tracking-widest">CORE_MODULE &middot; {i * 12}M_AGO</p>
                  </div>
                  <ArrowRight size={14} className="text-foreground/40 group-hover:text-secondary transition-all" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* System Health */}
        <motion.div variants={item}>
          <Card variant="primary" className="flex flex-col items-center justify-between text-center gap-6 h-full">
            <div className="w-full flex justify-end">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-background border-2 border-emerald-500/30">
                <div className="w-2 h-2 bg-emerald-500" />
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">ONLINE</span>
              </div>
            </div>

            <div className="w-16 h-16 bg-background flex items-center justify-center text-primary border-4 border-primary">
              <BarChart3 size={32} strokeWidth={3} />
            </div>
            
            <div className="space-y-2">
              <h4 className="text-lg font-black text-foreground uppercase tracking-tight">SYSTEM_HEALTH</h4>
              <p className="text-[10px] font-black text-foreground leading-relaxed uppercase">
                ALL_SUBSYSTEMS_STABLE <br/> LATENCY: <span className="text-primary font-black">12MS</span>
              </p>
            </div>

            <div className="w-full grid grid-cols-1 gap-2">
              <Button variant="primary" size="sm" className="w-full">
                TERMINAL
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                SUPPORT
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
