import React from 'react';
import { useOrg } from '../../contexts/OrgContext';
import { Building2, Plus, ArrowRight, Settings2, Globe, Users, ExternalLink } from 'lucide-react';
import { Organization } from '@devnfw/shared';
import OrgFormModal from '../../components/organization/OrgFormModal';
import OrgMembersModal from '../../components/organization/OrgMembersModal';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

/**
 * OrgListPage Component
 * 
 * Manages the multi-tenancy organizations associated with the current user.
 */
const OrgListPage: React.FC = () => {
  const { 
    organizations, 
    currentOrg, 
    setOrganization, 
    loadOrganizations,
    loading, 
    error 
  } = useOrg();
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = React.useState(false);
  const [selectedOrg, setSelectedOrg] = React.useState<Organization | null>(null);

  const handleCreate = () => {
    setSelectedOrg(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setIsFormModalOpen(true);
  };

  const handleManageMembers = (org: Organization) => {
    setSelectedOrg(org);
    setIsMembersModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-strong pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">ORGS_<span className="text-primary">MANAGEMENT</span></h2>
          <p className="text-[10px] font-bold tracking-widest uppercase text-foreground/40">
             BUSINESS_UNITS &middot; CENTRAL_HUB
          </p>
        </div>

        <Button onClick={handleCreate} size="sm">
          <Plus size={14} />
          NEW_UNIT
        </Button>
      </header>

      {/* Orgs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {organizations.map((org) => {
          const isActive = currentOrg?.id === org.id;
          return (
            <motion.div key={org.id}>
              <Card 
                variant={isActive ? 'primary' : 'default'}
                className="group relative"
              >
                {/* Active Badge */}
                {isActive && (
                  <div className="absolute top-4 right-4 px-2 py-0.5 bg-primary text-black text-[8px] font-black tracking-widest uppercase border border-black/20">
                    ACTIVE
                  </div>
                )}

                <div className="w-12 h-12 bg-background border-2 border-border-strong flex items-center justify-center text-primary mb-6 group-hover:border-primary transition-colors">
                  <Building2 size={24} />
                </div>

                <div>
                  <h3 className="text-lg font-black text-foreground mb-1 tracking-tight uppercase truncate">{org.name}</h3>
                  <div className="flex items-center gap-2 mb-6 opacity-40">
                    <Globe size={10} className="text-secondary" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">{org.slug}.devnfw.io</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="bg-background border-2 border-border-strong p-3">
                      <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mb-1">STATUS</p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-emerald-500" />
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">OK</p>
                      </div>
                    </div>
                    <div className="bg-background border-2 border-border-strong p-3">
                      <p className="text-[8px] font-black text-foreground/30 uppercase tracking-widest mb-1">ROLE</p>
                      <p className="text-[9px] font-black text-foreground uppercase tracking-widest">ADMIN</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => setOrganization(org.id)}
                      variant={isActive ? 'primary' : 'outline'}
                      size="sm"
                      disabled={isActive}
                      className="flex-1"
                    >
                      {isActive ? 'SELECTED' : 'SWITCH'}
                      {!isActive && <ArrowRight size={12} />}
                    </Button>
                    <button 
                      onClick={() => handleManageMembers(org)}
                      title="MEMBERS"
                      className="p-3 bg-background border-2 border-border-strong text-foreground/40 hover:text-secondary hover:border-secondary transition-all active:translate-y-0.5">
                      <Users size={14} />
                    </button>
                    <button 
                      onClick={() => handleEdit(org)}
                      title="SETTINGS"
                      className="p-3 bg-background border-2 border-border-strong text-foreground/40 hover:text-foreground hover:border-foreground transition-all active:translate-y-0.5">
                      <Settings2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="flex flex-col md:flex-row items-center justify-between gap-6 border border-border-strong bg-white/5">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 border-2 border-primary flex items-center justify-center text-primary">
               <Building2 size={20} />
            </div>
            <div>
               <h4 className="text-sm font-black text-foreground uppercase tracking-widest">WORKSPACE_ORGANIZATIONS</h4>
               <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tight">
                  Viewing business units linked to your DEVNAPP license.
               </p>
            </div>
         </div>
         <Button variant="outline" size="sm">
            MANAGE_SUBSCRIPTIONS
         </Button>
      </Card>

      {isFormModalOpen && (
        <OrgFormModal 
          isOpen={isFormModalOpen} 
          onClose={() => setIsFormModalOpen(false)} 
          org={selectedOrg}
          onSuccess={loadOrganizations}
        />
      )}

      {isMembersModalOpen && selectedOrg && (
        <OrgMembersModal 
          isOpen={isMembersModalOpen} 
          onClose={() => setIsMembersModalOpen(false)} 
          org={selectedOrg}
        />
      )}
    </div>
  );
};

export default OrgListPage;
