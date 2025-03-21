import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SalesFilter, EnhancedSale } from '@/types';
import { DEFAULT_PAGINATION_LIMIT, SALE_STATUS, SALE_STATUS_NAMES, SALE_STATUS_COLORS } from '@/lib/constants';
import { useWebSocket } from '@/lib/ws-client';
import { useToast } from '@/hooks/use-toast';

const Sales: React.FC = () => {
  const { toast } = useToast();
  const { connected } = useWebSocket();
  
  const [filter, setFilter] = useState<SalesFilter>({
    page: 1,
    limit: DEFAULT_PAGINATION_LIMIT
  });
  
  // Fetch sales
  const { data: sales, isLoading } = useQuery({
    queryKey: ['/api/sales', filter],
    staleTime: 30000, // 30 seconds
  });
  
  // Fetch servers for filter dropdown
  const { data: servers } = useQuery({
    queryKey: ['/api/servers'],
    staleTime: 300000, // 5 minutes
  });
  
  // Format price to BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };
  
  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Vendas</h1>
          <p className="text-discord-muted mt-1">
            Acompanhe e gerencie todas as suas vendas
            {connected && <span className="ml-2 text-discord-success text-xs">● Atualizações em tempo real ativas</span>}
          </p>
        </div>
        
        <Button 
          className="bg-discord-primary hover:bg-opacity-80"
          onClick={() => {
            toast({
              title: "Nova venda",
              description: "Esta funcionalidade está disponível através dos comandos slash do Discord. Use /vender no seu servidor.",
            });
          }}
        >
          <i className="fas fa-plus mr-2"></i> Nova Venda
        </Button>
      </header>
      
      {/* Filters */}
      <div className="bg-discord-card rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/4">
            <Label htmlFor="filter-server" className="text-discord-light text-sm mb-1 block">Servidor</Label>
            <select
              id="filter-server"
              className="w-full px-3 py-2 bg-discord-dark border border-discord-sidebar rounded-md text-discord-light"
              onChange={(e) => setFilter({...filter, serverId: e.target.value ? parseInt(e.target.value) : undefined})}
            >
              <option value="">Todos os servidores</option>
              {servers?.map((server: any) => (
                <option key={server.id} value={server.id}>{server.name}</option>
              ))}
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="filter-status" className="text-discord-light text-sm mb-1 block">Status</Label>
            <select
              id="filter-status"
              className="w-full px-3 py-2 bg-discord-dark border border-discord-sidebar rounded-md text-discord-light"
              onChange={(e) => setFilter({...filter, status: e.target.value || undefined})}
            >
              <option value="">Todos</option>
              <option value={SALE_STATUS.PENDING}>{SALE_STATUS_NAMES[SALE_STATUS.PENDING]}</option>
              <option value={SALE_STATUS.PAID}>{SALE_STATUS_NAMES[SALE_STATUS.PAID]}</option>
              <option value={SALE_STATUS.CANCELLED}>{SALE_STATUS_NAMES[SALE_STATUS.CANCELLED]}</option>
            </select>
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="filter-date-from" className="text-discord-light text-sm mb-1 block">Data Inicial</Label>
            <Input 
              id="filter-date-from"
              type="date"
              className="bg-discord-dark border-discord-sidebar text-discord-light"
              onChange={(e) => setFilter({...filter, dateFrom: e.target.value || undefined})}
            />
          </div>
          
          <div className="w-full md:w-1/4">
            <Label htmlFor="filter-date-to" className="text-discord-light text-sm mb-1 block">Data Final</Label>
            <Input 
              id="filter-date-to"
              type="date"
              className="bg-discord-dark border-discord-sidebar text-discord-light"
              onChange={(e) => setFilter({...filter, dateTo: e.target.value || undefined})}
            />
          </div>
        </div>
      </div>
      
      {/* Sales Table */}
      <div className="bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Lista de Vendas</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-discord-dark">
            <thead className="bg-discord-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Produto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-discord-card divide-y divide-discord-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-discord-muted">
                    Carregando vendas...
                  </td>
                </tr>
              ) : sales?.length > 0 ? (
                sales.map((sale: EnhancedSale) => (
                  <tr key={sale.id} className="hover:bg-discord-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">#{sale.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {sale.clientAvatar ? (
                            <img className="h-8 w-8 rounded-full" src={sale.clientAvatar} alt="" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-discord-primary flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {sale.clientName?.charAt(0).toUpperCase() || 'C'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-discord-light">{sale.clientName || 'Cliente Desconhecido'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      {sale.productName || 'Produto Desconhecido'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      {formatPrice(sale.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        SALE_STATUS_COLORS[sale.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {SALE_STATUS_NAMES[sale.status] || sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-muted">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-discord-primary hover:bg-discord-dark mr-2"
                        onClick={() => {
                          // View sale details
                          toast({
                            title: "Ver detalhes",
                            description: `Detalhes da venda #${sale.id}`,
                          });
                        }}
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      {sale.status === SALE_STATUS.PENDING && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-discord-success hover:bg-discord-dark mr-2"
                            onClick={() => {
                              // Confirm sale
                              toast({
                                title: "Confirmar venda",
                                description: "Funcionalidade em implementação",
                              });
                            }}
                          >
                            <i className="fas fa-check"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-discord-error hover:bg-discord-dark"
                            onClick={() => {
                              // Cancel sale
                              toast({
                                title: "Cancelar venda",
                                description: "Funcionalidade em implementação",
                              });
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-discord-muted">
                    <i className="fas fa-shopping-cart text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-white mb-2">Nenhuma venda encontrada</h3>
                    <p>As vendas realizadas aparecerão aqui.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-discord-dark">
          <div className="text-sm text-discord-muted">
            Mostrando <span className="font-medium text-discord-light">{sales?.length || 0}</span> vendas
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={filter.page === 1}
              className="bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-sidebar"
              onClick={() => setFilter({...filter, page: Math.max(1, (filter.page || 1) - 1)})}
            >
              Anterior
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-sidebar"
              onClick={() => setFilter({...filter, page: (filter.page || 1) + 1})}
              disabled={sales?.length < (filter.limit || DEFAULT_PAGINATION_LIMIT)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sales;
