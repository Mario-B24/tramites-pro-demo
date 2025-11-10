import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  FileText, 
  FileCheck, 
  CreditCard, 
  Settings,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from 'next-themes';
import { useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useUserRole } from '@/hooks/useUserRole';

const allMenuItems = [
  { title: 'Pantalla Principal', url: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'operador'] },
  { title: 'Clientes', url: '/clientes', icon: Users, roles: ['admin', 'operador'] },
  { title: 'Expedientes', url: '/expedientes', icon: FolderOpen, roles: ['admin', 'operador'] },
  { title: 'Tipos de Trámite', url: '/tipos-tramite', icon: FileText, roles: ['admin', 'operador'] },
  { title: 'Pagos', url: '/pagos', icon: CreditCard, roles: ['admin'] },
  { title: 'Configuración', url: '/configuracion', icon: Settings, roles: ['admin'] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const isCollapsed = state === 'collapsed';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const { data: role } = useUserRole(user?.id);

  const menuItems = useMemo(() => {
    if (!role) return [];
    return allMenuItems.filter(item => item.roles.includes(role));
  }, [role]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada');
      navigate('/auth');
    }
  };

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 border-b border-border">
        <SidebarTrigger className="ml-auto" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClass}>
                      <item.icon className={isCollapsed ? '' : 'mr-2 h-4 w-4'} />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t border-border space-y-2">
          {!isCollapsed && user && (
            <div className="text-sm mb-2">
              <p className="font-medium truncate">{user.email}</p>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!isCollapsed && <span className="ml-2">{theme === 'dark' ? 'Claro' : 'Oscuro'}</span>}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            className="w-full"
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Salir</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
