import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Statistics: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  
  // Mock data for charts when API isn't implemented yet
  const salesData = [
    { name: 'Jan', vendas: 65, valor: 9800 },
    { name: 'Fev', vendas: 59, valor: 8700 },
    { name: 'Mar', vendas: 80, valor: 12000 },
    { name: 'Abr', vendas: 81, valor: 13500 },
    { name: 'Mai', vendas: 56, valor: 7800 },
    { name: 'Jun', vendas: 55, valor: 7200 },
    { name: 'Jul', vendas: 72, valor: 10500 },
    { name: 'Ago', vendas: 90, valor: 14200 },
    { name: 'Set', vendas: 95, valor: 15000 },
    { name: 'Out', vendas: 102, valor: 16500 },
    { name: 'Nov', vendas: 120, valor: 19800 },
    { name: 'Dez', vendas: 150, valor: 24500 },
  ];
  
  const productDistribution = [
    { name: 'Plano Básico', value: 35 },
    { name: 'Plano Pro', value: 45 },
    { name: 'Plano Premium', value: 15 },
    { name: 'Curso Discord', value: 5 },
  ];
  
  const COLORS = ['#3498db', '#7289DA', '#9b59b6', '#2ecc71'];
  
  // Format price to BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-discord-dark p-3 border border-discord-sidebar rounded-md shadow-md">
          <p className="text-discord-light font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name === 'valor' 
                ? `Valor: ${formatPrice(entry.value)}` 
                : `${entry.name.charAt(0).toUpperCase() + entry.name.slice(1)}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Get period data based on selection
  const getPeriodData = () => {
    if (period === 'week') {
      return [
        { name: 'Seg', vendas: 12, valor: 1800 },
        { name: 'Ter', vendas: 15, valor: 2200 },
        { name: 'Qua', vendas: 10, valor: 1500 },
        { name: 'Qui', vendas: 18, valor: 2700 },
        { name: 'Sex', vendas: 25, valor: 3800 },
        { name: 'Sáb', vendas: 20, valor: 3000 },
        { name: 'Dom', vendas: 8, valor: 1200 },
      ];
    } else if (period === 'month') {
      return [
        { name: '1', vendas: 3, valor: 450 },
        { name: '5', vendas: 5, valor: 750 },
        { name: '10', vendas: 8, valor: 1200 },
        { name: '15', vendas: 12, valor: 1800 },
        { name: '20', vendas: 7, valor: 1050 },
        { name: '25', vendas: 10, valor: 1500 },
        { name: '30', vendas: 6, valor: 900 },
      ];
    }
    return salesData;
  };
  
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white font-heading">Estatísticas</h1>
        <p className="text-discord-muted mt-1">Análise detalhada de vendas e desempenho do bot</p>
      </header>
      
      {/* Period Selector */}
      <div className="bg-discord-card rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-discord-light font-medium">Selecione o período:</div>
          <div className="flex space-x-2 mt-2 md:mt-0">
            <Button 
              onClick={() => setPeriod('week')} 
              variant={period === 'week' ? 'default' : 'outline'}
              className={period === 'week' 
                ? 'bg-discord-primary hover:bg-opacity-80' 
                : 'bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-hover'
              }
            >
              Semana
            </Button>
            <Button 
              onClick={() => setPeriod('month')} 
              variant={period === 'month' ? 'default' : 'outline'}
              className={period === 'month' 
                ? 'bg-discord-primary hover:bg-opacity-80' 
                : 'bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-hover'
              }
            >
              Mês
            </Button>
            <Button 
              onClick={() => setPeriod('year')} 
              variant={period === 'year' ? 'default' : 'outline'}
              className={period === 'year' 
                ? 'bg-discord-primary hover:bg-opacity-80' 
                : 'bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-hover'
              }
            >
              Ano
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Button className="bg-discord-dark border-discord-sidebar text-discord-light hover:bg-discord-hover border">
              <i className="fas fa-download mr-2"></i> Exportar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-discord-card border-discord-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-discord-light text-lg">Total de Vendas</CardTitle>
            <CardDescription className="text-discord-muted">No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {period === 'week' ? '108' : period === 'month' ? '51' : '1025'}
            </div>
            <div className="text-xs text-discord-success mt-1">
              <i className="fas fa-arrow-up mr-1"></i> 
              {period === 'week' ? '12%' : period === 'month' ? '8%' : '15%'} em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-card border-discord-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-discord-light text-lg">Valor Total</CardTitle>
            <CardDescription className="text-discord-muted">No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {period === 'week' 
                ? formatPrice(16200) 
                : period === 'month' 
                ? formatPrice(7650) 
                : formatPrice(159500)}
            </div>
            <div className="text-xs text-discord-success mt-1">
              <i className="fas fa-arrow-up mr-1"></i> 
              {period === 'week' ? '15%' : period === 'month' ? '5%' : '22%'} em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-card border-discord-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-discord-light text-lg">Ticket Médio</CardTitle>
            <CardDescription className="text-discord-muted">Valor médio por venda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {formatPrice(150)}
            </div>
            <div className="text-xs text-discord-success mt-1">
              <i className="fas fa-arrow-up mr-1"></i> 
              3% em relação ao período anterior
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-card border-discord-dark">
          <CardHeader className="pb-2">
            <CardTitle className="text-discord-light text-lg">Novos Clientes</CardTitle>
            <CardDescription className="text-discord-muted">No período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              {period === 'week' ? '25' : period === 'month' ? '12' : '215'}
            </div>
            <div className="text-xs text-discord-error mt-1">
              <i className="fas fa-arrow-down mr-1"></i> 
              {period === 'week' ? '5%' : period === 'month' ? '2%' : '3%'} em relação ao período anterior
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="bg-discord-card border-discord-dark lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-discord-light">Vendas no Período</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getPeriodData()} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#40444B" />
                <XAxis dataKey="name" stroke="#72767D" />
                <YAxis stroke="#72767D" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="vendas" name="Vendas" fill="#7289DA" />
                <Bar dataKey="valor" name="valor" fill="#43B581" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="bg-discord-card border-discord-dark">
          <CardHeader>
            <CardTitle className="text-discord-light">Distribuição de Produtos</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Server Performance */}
      <div className="bg-discord-card rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-discord-dark">
          <h2 className="text-white font-bold font-heading">Desempenho por Servidor</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-discord-dark">
            <thead className="bg-discord-dark">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Servidor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Plano</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Vendas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Comandos Usados</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-discord-muted uppercase tracking-wider">Conversão</th>
              </tr>
            </thead>
            <tbody className="bg-discord-card divide-y divide-discord-dark">
              <tr className="hover:bg-discord-hover">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-discord-primary flex items-center justify-center">
                        <span className="text-white font-medium text-sm">S</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-discord-light">Servidor Premium</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                    Premium
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">124</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">{formatPrice(18600)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">568</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-success">21.8%</td>
              </tr>
              <tr className="hover:bg-discord-hover">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">C</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-discord-light">Comunidade Pro</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Pro
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">87</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">{formatPrice(12500)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">312</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-success">27.9%</td>
              </tr>
              <tr className="hover:bg-discord-hover">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">V</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-discord-light">Vendas Online</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Pro
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">65</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">{formatPrice(9800)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-light">245</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-discord-success">26.5%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Statistics;
