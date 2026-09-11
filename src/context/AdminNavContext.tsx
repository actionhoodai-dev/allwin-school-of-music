'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminNavContextType {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
}

const AdminNavContext = createContext<AdminNavContextType | undefined>(undefined);

export function AdminNavProvider({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminNavContext.Provider
      value={{
        mobileSidebarOpen,
        setMobileSidebarOpen,
        openMobileSidebar: () => setMobileSidebarOpen(true),
        closeMobileSidebar: () => setMobileSidebarOpen(false),
      }}
    >
      {children}
    </AdminNavContext.Provider>
  );
}

export function useAdminNav() {
  return useContext(AdminNavContext);
}
