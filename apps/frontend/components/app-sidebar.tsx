"use client";

import * as React from "react"
import {
  Building2,
  Users,
  MessageSquare,
  FileText,
  BarChart3,
  Settings,
  Briefcase,
  DollarSign,
  Home,
  UserPlus,
  Bell,
  Calendar,
  ChevronRight,
  Search,
  PersonStanding
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/providers/auth-provider"
import { SecureComponent } from "@/components/secure/SecureComponent"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link";
import { RequiredPermission } from "@/utils/permissions";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Define menu items with their required permissions
const menuGroups: { title: string; items: MenuItemProps[] }[] = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        icon: Home,
        url: "/dashboard",
        permissions: [] // Basic view permission
      },
      {
        title: "Notifications",
        icon: Bell,
        url: "/dashboard/notifications",
        permissions: []
      }
    ]
  },
  {
    title: "Properties",
    items: [
      {
        title: "All Properties",
        icon: Building2,
        url: "/dashboard/properties",
        permissions: []
      },
      {
        title: "Add Property",
        icon: UserPlus,
        url: "/dashboard/properties/add",
        permissions: []
      }
    ]
  },
  {
    title: "Leads & Clients",
    items: [
      {
        title: "Lead Management",
        icon: Users,
        url:  "/dashboard/leads",
        permissions: []
      },
      {
        title: "Client Database",
        icon: UserPlus,
        url: "/dashboard/clients",
        permissions: []
      }
    ]
  },
  {
    title: "Deals",
    items: [
      {
        title: "Active Deals",
        icon: Briefcase,
        url: "/dashboard/deals",
        permissions: []
      },
      {
        title: "Transactions",
        icon: DollarSign,
        url: "/dashboard/transactions",
        permissions: []
      }
    ]
  },
  {
    title: "Communication",
    items: [
      {
        title: "Messages",
        icon: MessageSquare,
        url: "/dashboard/messages",
        permissions: []
      },
      {
        title: "Calendar",
        icon: Calendar,
        url: "/dashboard/calendar",
        permissions: []
      }
    ]
  },
  {
    title: "Reports & Analytics",
    items: [
      {
        title: "Performance",
        icon: BarChart3,
        url: "/dashboard/reports/performance",
        permissions: []
      },
      {
        title: "Documents",
        icon: FileText,
        url: "/dashboard/documents",
        permissions: []
      }
    ]
  },
  {
    title: "Company",
    items: [
      {
        title: "Management",
        icon: Settings,
        url: "/dashboard/company",
        permissions: [] // Admin only
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        title: "Profile",
        icon: PersonStanding,
        url: "/dashboard/profile",
        permissions: [] // Admin only
      },
      {
        title: "Tasks",
        icon: Users,
        url: "/dashboard/tasks",
        permissions: [] // Admin only
      }
    ]
  }
]

interface MenuItemProps {
  title: string
  icon: any
  url: string
  permissions: RequiredPermission[]
}

const MenuItem = ({ item }: { item: MenuItemProps }) => {
  const Icon = item.icon
  const { state } = useSidebar()
  const pathname = usePathname()

  // Check if the current pathname matches the item's URL or is a subpath
  const isActive = pathname === item.url || 
    (item.url !== '/dashboard' && pathname.startsWith(item.url))

  return (
    <SecureComponent
      component={() => (
        <SidebarMenuItem>
          <SidebarMenuButton 
            asChild 
            tooltip={{
              children: item.title,
              side: 'right',
              hidden: state !== 'collapsed'
            }}
            className={cn(
              'group/menu-item',
              isActive 
                ? 'bg-primary/10 text-primary font-semibold' 
                : 'hover:bg-secondary/50',
              'transition-all duration-300 ease-in-out',
              'relative overflow-hidden',
              'before:absolute before:inset-0 before:origin-left before:scale-x-0',
              isActive 
                ? 'before:bg-primary/10 before:scale-x-100' 
                : 'before:group-hover/menu-item:scale-x-100 before:bg-secondary/20',
              'before:transition-transform before:duration-300 before:ease-out',
              'focus:outline-none focus:ring-2 focus:ring-primary/30'
            )}
          >
            <Link 
              href={item.url} 
              className="w-full flex items-center relative z-10 py-2 px-3"
            >
              <Icon 
                className={cn(
                  'h-4 w-4 mr-2',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground group-hover/menu-item:text-foreground'
                )} 
              />
              <span 
                className={cn(
                  'flex-1 truncate',
                  isActive ? 'text-primary' : 'group-hover/menu-item:text-foreground'
                )}
              >
                {item.title}
              </span>
              {isActive && (
                <div 
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-2/3 w-1 bg-primary rounded-l-full 
                  transition-all duration-300 ease-out"
                />
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      permissions={item.permissions}
      fallback={null}
    />
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoading, isInitialized } = useAuthContext();
  const [mounted, setMounted] = React.useState(false);

  // Handle client-side mounting
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return null;
  }

  // Show loading state
  if (isLoading || !isInitialized) {
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-4 py-2">
            <Building2 className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary-foreground">Estate CRM</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {menuGroups.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuSkeleton key={item.title} showIcon />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    );
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-4 py-2 group">
          <Building2 className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
          <h1 className="text-xl font-bold text-primary-foreground opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-300">
            Estate CRM
          </h1>
        </div>
        <div className="px-4 py-2">
          <div className="relative flex items-center space-x-2 group">
            <Search className="h-4 w-4 text-muted-foreground absolute left-3 transition-colors group-focus-within:text-primary" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-secondary/20 rounded-md outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {menuGroups.map((group) => (
          <Collapsible
            key={group.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
              >
                <CollapsibleTrigger>
                  {group.title}
                  <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <MenuItem key={item.title} item={item} />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center space-x-2 group">
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="opacity-0 group-data-[state=expanded]:opacity-100 transition-opacity duration-300">
            <p className="font-semibold text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}

export function SidebarMenuSkeleton({ showIcon }: { showIcon: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild>
        <a href="#">
          {showIcon && <Search className="h-4 w-4" />}
          <span className="sr-only">Loading...</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}