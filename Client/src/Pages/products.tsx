import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { ProductsFilter, EnhancedProduct } from '@/types';
import { DEFAULT_PAGINATION_LIMIT } from '@/lib/constants';

const Products: React.FC = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState<ProductsFilter>({
    page: 1,
    limit: DEFAULT_PAGINATION_LIMIT
  });
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    serverId: '',
    stock: ''
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/products', filter],
    staleTime: 60000, // 1 minute
  });

  // Fetch servers for dropdown
  const { data: servers } = useQuery({
    queryKey: ['/api/servers'],
    staleTime: 300000, // 5 minutes
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/products', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDialogOpen(false);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        serverId: '',
        stock: ''
      });
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar produto",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle product active status
  const toggleProductStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      return apiRequest('PATCH', `/api/products/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      toast({
        title: "Status atualizado",
        description: "O status do produto foi atualizado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert price from BRL format to cents
    const priceValue = parseFloat(newProduct.price.replace(/[^\d,]/g, '').replace(',', '.'));
    const priceInCents = Math.round(priceValue * 100);
    
    createProductMutation.mutate({
      name: newProduct.name,
      description: newProduct.description,
      price: priceInCents,
      serverId: parseInt(newProduct.serverId),
      stock: newProduct.stock ? parseInt(newProduct.stock) : null,
      isActive: true
    });
  };

  // Format price to BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Produtos</h1>
          <p className="text-discord-muted mt-1">Gerencie os produtos disponíveis para venda</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-discord-primary hover:bg-opacity-80">
              <i className="fas fa-plus mr-2"></i> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-discord-card border-discord-dark text-discord-light">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Novo Produto</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-discord-light">Nome</Label>
                <Input 
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="bg-discord-dark border-discord-sidebar text-discord-light"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-discord-light">Descrição</Label>
                <Textarea 
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  className="bg-discord-dark border-discord-sidebar text-discord-light min-h-[100px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price" className="text-discord-light">Preço (R$)</Label>
                <Input 
                  id="price"
                  type="text"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="bg-discord-dark border-discord-sidebar text-discord-light"
                  placeholder="0,00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="server" className="text-discord-light">Servidor</Label>
                <select
                  id="server"
                  value={newProduct.serverId}
                  onChange={(e) => setNewProduct({...newProduct, serverId: e.target.value})}
                  className="w-full px-3 py-2 bg-discord-dark border border-discord-sidebar rounded-md text-discord-light"
                  required
                >
                  <option value="">Selecione um servidor</option>
                  {servers?.map((server: any) => (
                    <option key={server.id} value={server.id}>{server.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-discord-light">Estoque (opcional)</Label>
                <Input 
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                  className="bg-discord-dark border-discord-sidebar text-discord-light"
                  placeholder="Deixe em branco para ilimitado"
                />
              </div>
              
              <div className="flex justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="mr-2 bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-sidebar"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-discord-primary hover:bg-opacity-80"
                  disabled={createProductMutation.isPending}
                >
                  {createProductMutation.isPending ? 'Salvando...' : 'Salvar Produto'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>
      
      {/* Filters */}
      <div className="bg-discord-card rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search-product" className="text-discord-light text-sm mb-1 block">Buscar produto</Label>
            <Input 
              id="search-product"
              placeholder="Nome do produto"
              className="bg-discord-dark border-discord-sidebar text-discord-light"
            />
          </div>
          
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
              onChange={(e) => setFilter({...filter, isActive: e.target.value === '' ? undefined : e.target.value === 'true'})}
            >
              <option value="">Todos</option>
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Products List */}
      <div className="bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Lista de Produtos</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-discord-dark">
            <thead className="bg-discord-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Preço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Servidor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-discord-card divide-y divide-discord-dark">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-discord-muted">
                    Carregando produtos...
                  </td>
                </tr>
              ) : products?.length > 0 ? (
                products.map((product: EnhancedProduct) => (
                  <tr key={product.id} className="hover:bg-discord-hover">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">#{product.id}</td>
                    <td className="px-6 py-4 text-sm text-discord-light">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-discord-muted text-xs mt-1 truncate max-w-xs">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      {product.serverName || (servers?.find(s => s.id === product.serverId)?.name) || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      {product.stock !== null ? product.stock : 'Ilimitado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-discord-primary hover:bg-discord-dark mr-2"
                        onClick={() => {
                          // Edit product - would be implemented in a complete version
                          toast({
                            title: "Editar produto",
                            description: "Funcionalidade em implementação",
                          });
                        }}
                      >
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={product.isActive ? "text-discord-error hover:bg-discord-dark" : "text-discord-success hover:bg-discord-dark"}
                        onClick={() => toggleProductStatus.mutate({ id: product.id, isActive: !product.isActive })}
                        disabled={toggleProductStatus.isPending}
                      >
                        <i className={`fas ${product.isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-discord-muted">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination - in a complete implementation, this would be connected to the API */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-discord-dark">
          <div className="text-sm text-discord-muted">
            Mostrando <span className="font-medium text-discord-light">{products?.length || 0}</span> produtos
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
              disabled={products?.length < (filter.limit || DEFAULT_PAGINATION_LIMIT)}
            >
              Próximo
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Products;
