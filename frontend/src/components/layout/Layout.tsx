import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Layout() {
  const token = localStorage.getItem('token');
  
  // Basic protection: if no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50 dark:bg-zinc-950 min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
    </TooltipProvider>
  );
}
