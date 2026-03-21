import { Link, useLocation } from 'react-router-dom';
import { Home, GitCompare, HelpCircle, Menu, X } from 'lucide-react';
import { ProjetoCompleto } from '@/lib/types';
import { useState } from 'react';

interface NavbarProps {
  resultado: ProjetoCompleto;
}

const navItems = [
  { to: '/', label: 'Projetos', icon: Home },
  { to: '/comparativo', label: 'Comparativo', icon: GitCompare },
  { to: '/ajuda', label: 'Ajuda', icon: HelpCircle },
];

export default function Navbar({ resultado }: NavbarProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { parecer, inputs } = resultado;

  const scoreColor = parecer.score >= 75 ? 'text-success'
    : parecer.score >= 55 ? 'text-warning'
    : parecer.score >= 35 ? 'text-warning'
    : 'text-destructive';

  const statusLabel = parecer.score >= 75 ? 'Excelente'
    : parecer.score >= 55 ? 'Viável'
    : parecer.score >= 35 ? 'Risco Elevado'
    : 'Inviável';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-border/40">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" 
               style={{ background: 'var(--gradient-gold)' }}>
            <span className="text-background font-display">V</span>
          </div>
          <span className="font-display text-lg gradient-text font-bold tracking-tight hidden sm:block">
            ViabilidadeApp
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 rounded-xl p-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-primary/15 text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                }`}
              >
                <item.icon size={15} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Status Badge */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40">
            <span className="text-xs text-foreground/80 font-medium">{inputs.nome}</span>
            <div className="w-px h-3 bg-border/60" />
            <span className={`text-xs font-semibold ${scoreColor}`}>{statusLabel}</span>
            <span className={`text-[10px] font-mono ${scoreColor}`}>{parecer.score}</span>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden glass-nav border-t border-border/40 animate-fade">
          <div className="px-4 py-3 space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
              <span className="text-xs text-foreground/80">{inputs.nome}</span>
              <span className={`text-xs font-semibold ${scoreColor}`}>{statusLabel} · {parecer.score}</span>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
