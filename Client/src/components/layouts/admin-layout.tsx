import React, { useState } from 'react';
import SidebarNavigation from '../sidebar-navigation';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-discord-bg">
      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={toggleSidebar}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-discord-sidebar">
          <div className="flex items-center h-16 px-4 bg-discord-dark">
            <h1 className="text-xl font-bold text-white font-heading">
              <i className="fas fa-robot mr-2"></i>
              VendaBot <span className="text-discord-primary text-sm">PRO</span>
            </h1>
          </div>
          
          <div className="flex flex-col flex-grow px-2 py-4 overflow-y-auto">
            <SidebarNavigation onItemClick={toggleSidebar} />
            
            <div className="mt-auto">
              <div className="px-2 pt-4 pb-2">
                <div className="border-t border-discord-dark pt-4">
                  <div className="flex items-center px-2 py-2 bg-discord-dark rounded">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-discord-primary flex items-center justify-center">
                        <span className="text-white font-medium text-sm">A</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-discord-light">AdminUser</p>
                      <p className="text-xs text-discord-muted">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-discord-sidebar">
          <div className="flex items-center h-16 px-4 bg-discord-dark">
            <h1 className="text-xl font-bold text-white font-heading">
              <i className="fas fa-robot mr-2"></i>
              VendaBot <span className="text-discord-primary text-sm">PRO</span>
            </h1>
          </div>
          
          <div className="flex flex-col flex-grow px-2 py-4 overflow-y-auto">
            <SidebarNavigation />
            
            <div className="mt-auto">
              <div className="px-2 pt-4 pb-2">
                <div className="border-t border-discord-dark pt-4">
                  <div className="flex items-center px-2 py-2 bg-discord-dark rounded">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-discord-primary flex items-center justify-center">
                        <span className="text-white font-medium text-sm">A</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-discord-light">AdminUser</p>
                      <p className="text-xs text-discord-muted">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <div className="flex items-center justify-between h-16 px-4 bg-discord-dark border-b border-discord-sidebar">
          <button className="md:hidden text-discord-light" onClick={toggleSidebar}>
            <i className="fas fa-bars text-xl"></i>
          </button>
          
          <div className="flex md:hidden items-center">
            <h1 className="text-xl font-bold text-white font-heading">
              VendaBot <span className="text-discord-primary text-sm">PRO</span>
            </h1>
          </div>
          
          <div className="flex items-center">
            <button 
              className="p-2 text-discord-light rounded-full hover:bg-discord-sidebar"
              onClick={() => toast({
                title: "Ajuda",
                description: "A área de ajuda ainda está em desenvolvimento.",
              })}
            >
              <i className="fas fa-question-circle"></i>
            </button>
            <button 
              className="p-2 ml-2 text-discord-light rounded-full hover:bg-discord-sidebar"
              onClick={() => toast({
                title: "Notificações",
                description: "Você não tem novas notificações.",
              })}
            >
              <i className="fas fa-bell"></i>
            </button>
            <div className="relative ml-2">
              <button className="flex text-sm rounded-full focus:outline-none">
                <div className="h-8 w-8 rounded-full bg-discord-primary flex items-center justify-center">
                  <span className="text-white font-medium text-sm">A</span>
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main content container */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-discord-bg">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
