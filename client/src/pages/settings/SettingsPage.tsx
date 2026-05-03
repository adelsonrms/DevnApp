import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { THEME_PRESETS } from '../../config/themes';
import { Palette, Settings2, RotateCcw, Check } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const SettingsPage: React.FC = () => {
  const { config, setThemeById, updateCustomColors } = useTheme();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-strong pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase">SYSTEM_<span className="text-primary">SETTINGS</span></h2>
          <p className="text-[10px] font-black tracking-widest uppercase text-foreground/40">
            UI_CUSTOMIZATION &middot; THEME_ORCHESTRATOR
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Theme Presets */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette size={18} className="text-secondary" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">THEME_PRESETS</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setThemeById(preset.id)}
                className={`p-4 border transition-all text-left group relative ${
                  config.id === preset.id 
                    ? 'border-primary bg-primary/5 shadow-[2px_2px_0_0_rgba(var(--primary),0.2)]' 
                    : 'border-border-strong hover:border-foreground/30 bg-panel-bg'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest">{preset.name}</span>
                  {config.id === preset.id && <Check size={14} className="text-primary" />}
                </div>
                
                <div className="flex gap-1">
                  <div className="w-4 h-4" style={{ backgroundColor: preset.colors.primary }} />
                  <div className="w-4 h-4" style={{ backgroundColor: preset.colors.secondary }} />
                  <div className="w-4 h-4" style={{ backgroundColor: preset.colors.accent }} />
                  <div className="w-4 h-4 border border-white/10" style={{ backgroundColor: preset.colors.background }} />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Custom Color Overrides */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings2 size={18} className="text-primary" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">MANUAL_OVERRIDE</h3>
          </div>

          <Card className="border border-border-strong bg-panel-bg/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { label: 'PRIMARY_CORE', key: 'primary' },
                { label: 'SECONDARY_ACTION', key: 'secondary' },
                { label: 'ACCENT_HIGHLIGHT', key: 'accent' },
                { label: 'BACKGROUND_ROOT', key: 'background' },
                { label: 'PANEL_SURFACE', key: 'panelBg' },
                { label: 'BORDER_STRUCT', key: 'borderStrong' },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <label className="text-[9px] font-black text-foreground/40 uppercase tracking-widest block">
                    {item.label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={(config.colors as any)[item.key]}
                      onChange={(e) => updateCustomColors({ [item.key]: e.target.value })}
                      className="w-10 h-10 bg-transparent border border-border-strong cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={(config.colors as any)[item.key]}
                      onChange={(e) => updateCustomColors({ [item.key]: e.target.value })}
                      className="flex-1 bg-background border border-border-strong px-3 text-[10px] font-bold text-foreground uppercase tracking-widest focus:border-primary outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-border-strong/30">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setThemeById(config.id)}
              >
                <RotateCcw size={14} />
                RESET_TO_PRESET_DEFAULTS
              </Button>
            </div>
          </Card>
        </section>
      </div>

      {/* Preview Section */}
      <section className="space-y-4">
         <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-widest">LIVE_PREVIEW_SAMPLES</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card variant="default">
              <h4 className="text-xs font-black uppercase mb-2">Standard_Card</h4>
              <p className="text-[10px] text-foreground/50 uppercase leading-relaxed">
                Este é um exemplo de como o texto e o fundo interagem com o seu novo tema.
              </p>
            </Card>
            <Card variant="primary">
              <h4 className="text-xs font-black uppercase mb-2">Primary_Card</h4>
              <Button size="sm" className="w-full">ACTION_BTN</Button>
            </Card>
            <Card variant="secondary">
              <h4 className="text-xs font-black uppercase mb-2">Secondary_Card</h4>
              <div className="h-2 bg-secondary/20 border border-secondary/40 w-full" />
            </Card>
          </div>
      </section>
    </div>
  );
};

export default SettingsPage;
