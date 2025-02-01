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
        url: "/notifications",
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
        url: "/properties",
        permissions: ["property.001"]
      },
      {
        title: "Add Property",
        icon: UserPlus,
        url: "/properties/add",
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
        url: "/leads",
        permissions: ["lead.001", "lead.002"]
      },
      {
        title: "Client Database",
        icon: UserPlus,
        url: "/clients",
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
        url: "/deals",
        permissions: ["deal.001"]
      },
      {
        title: "Transactions",
        icon: DollarSign,
        url: "/transactions",
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
        url: "/messages",
        permissions: ["message.001"]
      },
      {
        title: "Calendar",
        icon: Calendar,
        url: "/calendar",
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
        url: "/reports/performance",
        permissions: ["report.001"]
      },
      {
        title: "Documents",
        icon: FileText,
        url: "/documents",
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
            <a href={item.url}>
              <Icon className="h-4 w-4" />
              <span>{item.title}</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      permissions={item.permissions}
      fallback={null}
    />
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext()

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
  )
}
