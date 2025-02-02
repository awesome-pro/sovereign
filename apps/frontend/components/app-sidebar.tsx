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
  Search
} from "lucide-react"
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
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link";

// Define menu items with their required permissions
const menuGroups = [
  {
    title: "Dashboard",
    items: [
      {
        title: "Overview",
        icon: Home,
        url: "/dashboard",
        permissions: ["property.001"] // Basic view permission
      },
      {
        title: "Notifications",
        icon: Bell,
        url: "/dashboard/notifications",
        permissions: ["message.001"]
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
        permissions: ["property.001"]
      },
      {
        title: "Add Property",
        icon: UserPlus,
        url: "/dashboard/properties/add",
        permissions: ["property.002"]
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
        permissions: ["lead.001", "lead.002"]
      },
      {
        title: "Client Database",
        icon: UserPlus,
        url: "/dashboard/clients",
        permissions: ["lead.001"]
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
        permissions: ["deal.001"]
      },
      {
        title: "Transactions",
        icon: DollarSign,
        url: "/dashboard/transactions",
        permissions: ["transaction.001"]
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
        permissions: ["message.001"]
      },
      {
        title: "Calendar",
        icon: Calendar,
        url: "/dashboard/calendar",
        permissions: ["message.001"]
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
        permissions: ["report.001"]
      },
      {
        title: "Documents",
        icon: FileText,
        url: "/dashboard/documents",
        permissions: ["report.001"]
      }
    ]
  },
  {
    title: "Settings",
    items: [
      {
        title: "System Settings",
        icon: Settings,
        url: "/settings",
        permissions: ["user.007"] // Admin only
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
  permissions: string[]
}

const MenuItem = ({ item }: { item: MenuItemProps }) => {
  const Icon = item.icon

  return (
    <SecureComponent
      component={() => (
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={item.url}>
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
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
            <Building2 className="h-6 w-6" />
            <h1 className="text-xl font-bold">Estate CRM</h1>
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
        <div className="flex items-center space-x-2 px-4 py-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Estate CRM</h1>
        </div>
        <div className="px-4 py-2">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 opacity-50" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full bg-transparent outline-none"
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
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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