import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Database, ClipboardCheck, Users } from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { setOpenMobile } = useSidebar();

  const allLinks = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      roles: ['Admin', 'Assessor', 'Auditee'],
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      name: 'Master Data',
      path: '/dashboard/master',
      roles: ['Admin'],
      icon: <Database className="w-4 h-4" />
    },
    {
      name: 'Assessments',
      path: '/dashboard/assessments',
      roles: ['Admin', 'Assessor', 'Auditee'],
      icon: <ClipboardCheck className="w-4 h-4" />
    },
    {
      name: 'Users',
      path: '/dashboard/users',
      roles: ['Admin'],
      icon: <Users className="w-4 h-4" />
    },
  ];

  const userRole = user?.role?.name;
  const visibleLinks = allLinks.filter(link => !userRole || link.roles.includes(userRole));

  return (
    <ShadcnSidebar>
      <SidebarHeader className="h-16 border-b flex flex-col justify-center px-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-lg tracking-wide leading-tight truncate">COBIT Tool</span>
            <span className="text-xs text-muted-foreground truncate">Assessment Platform</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleLinks.map((link) => {
                const isActive = location.pathname.startsWith(link.path) && (link.path !== '/dashboard' || location.pathname === '/dashboard');
                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={link.name}>
                      <Link 
                        to={link.path} 
                        onClick={() => setOpenMobile(false)}
                        data-active={isActive}
                        className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-md transition-colors ${
                          isActive 
                            ? 'bg-zinc-200/60 font-semibold text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-50' 
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 dark:hover:text-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        {link.icon}
                        <span>{link.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </ShadcnSidebar>
  );
}
