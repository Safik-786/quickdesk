import { Outlet, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider, SidebarContext } from '../../../context/SidebarContext';

function DashboardLayoutContent() {
  const { isCollapsed } = useContext(SidebarContext);
  
  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans">
      <Sidebar />
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header />
        <main className="flex-1  overflow-x-hidden border border-slate-300 rounded-tl-2xl overflow-y-auto bg-blue-50 p-3 sm:p-4">
          <div className="max-w-7xl mx-auto h-full w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardLayoutContent />
    </SidebarProvider>
  );
}
