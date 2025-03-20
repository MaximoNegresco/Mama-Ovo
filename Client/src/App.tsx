import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Subscriptions from "@/pages/subscriptions";
import Sales from "@/pages/sales";
import Commands from "@/pages/commands";
import Clients from "@/pages/clients";
import Statistics from "@/pages/statistics";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";
import AdminLayout from "@/components/layouts/admin-layout";
import { WebSocketProvider } from "@/lib/ws-client";

function Router() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/produtos" component={Products} />
        <Route path="/assinaturas" component={Subscriptions} />
        <Route path="/vendas" component={Sales} />
        <Route path="/comandos" component={Commands} />
        <Route path="/clientes" component={Clients} />
        <Route path="/estatisticas" component={Statistics} />
        <Route path="/notificacoes" component={Notifications} />
        <Route path="/configuracoes" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <Router />
        <Toaster />
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
