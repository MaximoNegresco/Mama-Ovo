import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import StatCard from '@/components/ui/stat-card';
import SubscriptionTier from '@/components/ui/subscription-tier';
import CommandCard from '@/components/ui/command-card';

interface DashboardStats {
  sales: {
    total: number;
    amount: number;
    weeklyGrowth: number;
  };
  clients: {
    total: number;
    newToday: number;
  };
  products: {
    total: number;
    active: number;
  };
  servers: {
    total: number;
    limit: number;
  };
}

interface RecentSale {
  id: number;
  productName: string;
  clientName: string;
  clientAvatar: string | null;
  price: number;
  status: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    staleTime: 60000, // 1 minute
  });

  // Fetch subscription tiers
  const { data: tiers, isLoading: tiersLoading } = useQuery({
    queryKey: ['/api/subscription-tiers'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch popular commands
  const { data: commands, isLoading: commandsLoading } = useQuery({
    queryKey: ['/api/commands/popular'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch recent sales
  const { data: recentSales, isLoading: salesLoading } = useQuery({
    queryKey: ['/api/sales/recent'],
    staleTime: 60000, // 1 minute
  });

  // Format currency value
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100); // Convert cents to reais
  };

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    if (diffHrs < 24 && date.getDate() === now.getDate()) {
      return `Hoje, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } else if (diffHrs < 48) {
      return `Ontem, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
    
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading">Dashboard</h1>
        <p className="text-discord-muted mt-1">Bem-vindo ao seu painel de administração de vendas no Discord</p>
      </header>
      
      {/* Bot Status Card */}
      <div className="bg-discord-card rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-white font-bold text-lg font-heading flex items-center">
              <i className="fas fa-robot mr-2 text-discord-primary"></i>
              Status do Bot
            </h2>
            <div className="flex items-center mt-2">
              <div className="w-3 h-3 bg-discord-success rounded-full"></div>
              <span className="ml-2 text-discord-light">Online - Funcionando normalmente</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 space-x-2">
            <button className="bg-discord-primary text-white px-4 py-2 rounded hover:bg-opacity-80">
              <i className="fas fa-sync-alt mr-1"></i> Reiniciar
            </button>
            <button className="bg-discord-dark text-discord-light px-4 py-2 rounded hover:bg-opacity-80">
              <i className="fas fa-cog mr-1"></i> Configuração
            </button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statsLoading ? (
          // Skeleton loading for stats
          Array(4).fill(null).map((_, i) => (
            <div key={i} className="bg-discord-card rounded-lg shadow-md p-4 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-discord-dark"></div>
                <div className="ml-4 w-full">
                  <div className="h-4 bg-discord-dark rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-discord-dark rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-discord-dark rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              icon="fas fa-shopping-cart"
              title="Vendas Total"
              value={formatCurrency(stats.sales.amount)}
              subtext={`▲ ${stats.sales.weeklyGrowth}% esta semana`}
              color="blue"
            />
            <StatCard
              icon="fas fa-users"
              title="Clientes"
              value={stats.clients.total.toString()}
              subtext={`▲ ${stats.clients.newToday} novos hoje`}
              color="green"
            />
            <StatCard
              icon="fas fa-tag"
              title="Produtos"
              value={stats.products.total.toString()}
              subtext={`Ativos: ${stats.products.active}`}
              color="purple"
            />
            <StatCard
              icon="fas fa-server"
              title="Servidores"
              value={stats.servers.total.toString()}
              subtext={stats.servers.total >= stats.servers.limit * 0.8 
                ? `⚠️ Próximo do limite (${stats.servers.limit})`
                : `Limite: ${stats.servers.limit}`}
              color="red"
            />
          </>
        ) : (
          <div className="col-span-4 text-center text-discord-muted">
            Erro ao carregar estatísticas
          </div>
        )}
      </div>
      
      {/* Main Content Panels */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Sales Panel */}
        <div className="bg-discord-card rounded-lg shadow-md xl:col-span-2">
          <div className="px-6 py-4 border-b border-discord-dark flex justify-between items-center">
            <h2 className="text-white font-bold font-heading">Vendas Recentes</h2>
            <Link href="/vendas">
              <a className="text-discord-primary text-sm hover:underline">Ver todas</a>
            </Link>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-discord-dark">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Produto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-discord-dark">
                  {salesLoading ? (
                    // Skeleton loading for sales table
                    Array(4).fill(null).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-discord-dark animate-pulse"></div>
                            <div className="ml-3">
                              <div className="h-4 bg-discord-dark rounded w-24 animate-pulse"></div>
                              <div className="h-3 bg-discord-dark rounded w-16 mt-1 animate-pulse"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-4 bg-discord-dark rounded w-32 animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-4 bg-discord-dark rounded w-20 animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-5 bg-discord-dark rounded w-16 animate-pulse"></div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="h-4 bg-discord-dark rounded w-24 animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : recentSales && recentSales.length > 0 ? (
                    recentSales.map((sale: RecentSale) => (
                      <tr key={sale.id} className="hover:bg-discord-hover">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              {sale.clientAvatar ? (
                                <img className="h-8 w-8 rounded-full" src={sale.clientAvatar} alt="" />
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-discord-primary flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {sale.clientName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-discord-light">{sale.clientName}</div>
                              <div className="text-xs text-discord-muted">@{sale.clientName.toLowerCase()}#{Math.floor(1000 + Math.random() * 9000)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-discord-light">
                          {sale.productName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-discord-light">
                          {formatCurrency(sale.price)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sale.status === 'paid' ? 'bg-green-100 text-green-800' :
                            sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {sale.status === 'paid' ? 'Pago' :
                             sale.status === 'pending' ? 'Pendente' :
                             'Cancelado'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-discord-muted">
                          {formatDate(sale.createdAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-discord-muted">
                        Nenhuma venda recente encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Subscription Tiers Panel */}
        <div className="bg-discord-card rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-discord-dark">
            <h2 className="text-white font-bold font-heading">Planos de Assinatura</h2>
          </div>
          <div className="p-4 space-y-4">
            {tiersLoading ? (
              // Skeleton loading for subscription tiers
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="bg-discord-dark rounded-md p-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="w-1/2">
                      <div className="h-5 bg-discord-bg rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-discord-bg rounded w-1/2"></div>
                    </div>
                    <div className="h-5 bg-discord-bg rounded w-1/4"></div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="h-3 bg-discord-bg rounded"></div>
                    <div className="h-3 bg-discord-bg rounded"></div>
                    <div className="h-3 bg-discord-bg rounded"></div>
                  </div>
                </div>
              ))
            ) : tiers ? (
              tiers.map((tier: any, index: number) => (
                <SubscriptionTier
                  key={tier.id}
                  name={tier.name}
                  price={formatCurrency(tier.price)}
                  features={tier.features || []}
                  isPopular={tier.level === 2}
                  color={tier.color}
                  subscribers={index === 0 ? 21 : index === 1 ? 35 : 14}
                  hasBorder={tier.level === 2}
                />
              ))
            ) : (
              <div className="text-center text-discord-muted py-4">
                Erro ao carregar planos de assinatura
              </div>
            )}
            
            <Link href="/assinaturas">
              <a className="block text-center text-discord-primary text-sm mt-4 hover:underline">
                Gerenciar planos de assinatura
              </a>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Command List Preview */}
      <div className="mt-8 bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark flex justify-between items-center">
          <h2 className="text-white font-bold font-heading">Comandos Slash Populares</h2>
          <Link href="/comandos">
            <a className="text-discord-primary text-sm hover:underline">Ver todos</a>
          </Link>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {commandsLoading ? (
              // Skeleton loading for commands
              Array(3).fill(null).map((_, i) => (
                <div key={i} className="bg-discord-dark rounded-md p-4 animate-pulse">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-discord-bg"></div>
                    <div className="ml-3 w-full">
                      <div className="h-5 bg-discord-bg rounded w-1/3 mb-1"></div>
                      <div className="h-3 bg-discord-bg rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-6 bg-discord-bg rounded"></div>
                  </div>
                  <div className="mt-3 flex justify-between">
                    <div className="h-3 bg-discord-bg rounded w-1/4"></div>
                    <div className="h-3 bg-discord-bg rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : commands ? (
              commands.slice(0, 3).map((command: any) => (
                <CommandCard
                  key={command.id}
                  name={command.name}
                  description={command.description}
                  usage={command.usage || `/#{command.name}`}
                  icon={command.icon || "fas fa-cog"}
                  minPlan={command.minSubscriptionLevel === 1 ? "Básico+" : 
                           command.minSubscriptionLevel === 2 ? "Pro+" : 
                           "Premium"}
                  usageCount={command.usageCount}
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-discord-muted py-4">
                Erro ao carregar comandos
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-discord-dark rounded-md">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-discord-primary bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-lightbulb text-discord-primary"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-white font-medium">Dica para vendas automáticas</h3>
                <p className="text-sm text-discord-muted mt-1">Configure os webhooks de pagamento com <code className="bg-discord-bg px-1 rounded font-mono">/webhook config</code> para automatizar todo o processo de vendas sem intervenção manual.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
