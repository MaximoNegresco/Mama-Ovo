import React from 'react';
import { Link, useLocation } from 'wouter';

interface NavItem {
  path: string;
  name: string;
  icon: string;
}

interface SidebarNavigationProps {
  onItemClick?: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ onItemClick }) => {
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { path: '/', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/vendas', name: 'Vendas', icon: 'fas fa-shopping-cart' },
    { path: '/produtos', name: 'Produtos', icon: 'fas fa-gift' },
    { path: '/comandos', name: 'Comandos', icon: 'fas fa-cog' },
    { path: '/assinaturas', name: 'Assinaturas', icon: 'fas fa-user-tag' },
    { path: '/clientes', name: 'Clientes', icon: 'fas fa-users' },
    { path: '/estatisticas', name: 'Estatísticas', icon: 'fas fa-chart-line' },
    { path: '/notificacoes', name: 'Notificações', icon: 'fas fa-bell' },
    { path: '/configuracoes', name: 'Configurações', icon: 'fas fa-cogs' }
  ];

  const handleClick = () => {
    if (onItemClick) {
      onItemClick();
    }
  };

  return (
    <div className="space-y-1">
      {navItems.map((item) => (
        <Link key={item.path} href={item.path}>
          <a
            className={`sidebar-item px-2 py-3 flex items-center text-discord-light rounded hover:bg-discord-hover ${
              location === item.path ? 'active border-l-4 border-discord-primary bg-discord-hover' : ''
            }`}
            onClick={handleClick}
          >
            <i className={`${item.icon} w-6`}></i>
            <span className="ml-2">{item.name}</span>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default SidebarNavigation;
