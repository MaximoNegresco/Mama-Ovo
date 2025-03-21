import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DEFAULT_PAGINATION_LIMIT } from '@/lib/constants';
import { ClientsFilter } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

const Clients: React.FC = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<ClientsFilter>({
    page: 1,
    limit: DEFAULT_PAGINATION_LIMIT
  });
  
  // Fetch clients (users)
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/users', filter],
    staleTime: 60000, // 1 minute
  });
  
  // Function to handle client search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // This would actually update the filter and trigger a new query
    toast({
      title: "Busca de clientes",
      description: "Busca realizada com sucesso",
    });
  };
  
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading">Clientes</h1>
        <p className="text-discord-muted mt-1">Gerenciamento de clientes e informações de compra</p>
      </header>
      
      {/* Search Bar */}
      <div className="bg-discord-card rounded-lg shadow-md p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search-client" className="text-discord-light text-sm mb-1 block">Buscar cliente</Label>
            <Input 
              id="search-client"
              placeholder="Nome, ID do Discord ou email"
              className="bg-discord-dark border-discord-sidebar text-discord-light"
              onChange={(e) => setFilter({...filter, search: e.target.value || undefined})}
            />
          </div>
          
          <div className="self-end">
            <Button 
              type="submit" 
              className="w-full bg-discord-primary hover:bg-opacity-80"
            >
              <i className="fas fa-search mr-2"></i> Buscar
            </Button>
          </div>
        </form>
      </div>
      
      {/* Clients List */}
      <div className="bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Lista de Clientes</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-discord-dark">
            <thead className="bg-discord-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Discord ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Compras</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Última Compra</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-discord-card divide-y divide-discord-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-discord-muted">
                    Carregando clientes...
                  </td>
                </tr>
              ) : clients?.length > 0 ? (
                clients.map((client: any) => (
                  <tr key={client.id} className="hover:bg-discord-hover">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          {client.avatarUrl ? (
                            <img className="h-8 w-8 rounded-full" src={client.avatarUrl} alt="" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-discord-primary flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {client.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-discord-light">{client.username}</div>
                          <div className="text-xs text-discord-muted">ID: #{client.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      {client.discordUserId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      {client.salesCount || 0} compras
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-muted">
                      {client.lastPurchaseDate ? new Date(client.lastPurchaseDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-discord-primary hover:bg-discord-dark mr-2"
                        onClick={() => {
                          // View client details
                          toast({
                            title: "Ver cliente",
                            description: `Detalhes do cliente: ${client.username}`,
                          });
                        }}
                      >
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-discord-light hover:bg-discord-dark"
                        onClick={() => {
                          // Show purchase history
                          toast({
                            title: "Histórico de compras",
                            description: `Histórico do cliente: ${client.username}`,
                          });
                        }}
                      >
                        <i className="fas fa-history"></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-discord-muted">
                    <i className="fas fa-users text-4xl mb-4"></i>
                    <h3 className="text-lg font-medium text-white mb-2">Nenhum cliente encontrado</h3>
                    <p>Os clientes registrados aparecerão aqui.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-discord-dark">
          <div className="text-sm text-discord-muted">
            Mostrando <span className="font-medium text-discord-light">{clients?.length || 0}</span> clientes
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
              disabled={clients?.length < (filter.limit || DEFAULT_PAGINATION_LIMIT)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
      
      {/* Client Management Guide */}
      <div className="mt-8 bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Gerenciamento de Clientes</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-discord-dark rounded-md p-4">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <i className="fas fa-user-plus text-discord-primary mr-2"></i>
                Adicionar Clientes
              </h3>
              <p className="text-discord-light text-sm">
                Use o comando <code className="bg-discord-bg px-1 rounded font-mono">/cliente adicionar</code> no Discord para adicionar novos clientes automaticamente durante uma interação.
              </p>
            </div>
            
            <div className="bg-discord-dark rounded-md p-4">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <i className="fas fa-search text-discord-primary mr-2"></i>
                Buscar Clientes
              </h3>
              <p className="text-discord-light text-sm">
                Use o comando <code className="bg-discord-bg px-1 rounded font-mono">/cliente buscar</code> para encontrar rapidamente informações sobre um cliente específico no Discord.
              </p>
            </div>
            
            <div className="bg-discord-dark rounded-md p-4">
              <h3 className="text-white font-medium mb-3 flex items-center">
                <i className="fas fa-chart-line text-discord-primary mr-2"></i>
                Histórico de Compras
              </h3>
              <p className="text-discord-light text-sm">
                Use o comando <code className="bg-discord-bg px-1 rounded font-mono">/cliente historico</code> para ver todas as transações de um cliente específico diretamente no Discord.
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-discord-dark rounded-md">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-discord-primary bg-opacity-20 rounded-full flex items-center justify-center">
                <i className="fas fa-lightbulb text-discord-primary"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-white font-medium">Dica para engajamento</h3>
                <p className="text-sm text-discord-muted mt-1">
                  Configure notificações automáticas para clientes recorrentes utilizando o módulo de notificações. 
                  Isso pode aumentar a fidelização e recomprar em até 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Clients;
