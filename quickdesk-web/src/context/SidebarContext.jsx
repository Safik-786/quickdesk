import { createContext, useState } from 'react';

export const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(prev => !prev);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, isDrawerOpen, toggleDrawer, closeDrawer }}>
      {children}
    </SidebarContext.Provider>
  );
}
