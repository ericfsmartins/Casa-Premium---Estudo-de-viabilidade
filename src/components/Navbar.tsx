import { Link, useLocation } from 'react-router-dom';
import { Home, GitCompare, HelpCircle } from 'lucide-react';
import { ProjetoCompleto } from '@/lib/types';

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
  const { parecer, inputs } = resultado;
  const badgeColor = parecer.score >= 75 ? 'bg-success/20 text-success'
    : parecer.score >= 55 ? 'bg-warning/20 text-warning'
    : parecer.score >= 35 ? 'bg-warning/20 text-warning'
    : 'bg-destructive/20 text-destructive';

  const statusLabel = parecer.score >= 75 ? 'Excelente'
    : parecer.score >= 55 ? 'Viável'
    : parecer.score >= 35 ? 'Risco Elevado'
    : 'Inviável';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between h-14 px-4">
        <Link to="/" className="font-display text-xl text-primary font-bold tracking-tight">
          ViabilidadeApp
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium ${badgeColor}`}>
          <span className="font-body">{inputs.nome}</span>
          <span>—</span>
          <span>{statusLabel}</span>
        </div>
      </div>
      {/* Mobile nav */}
      <div className="md:hidden flex border-t border-border">
        {navItems.map(item => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
