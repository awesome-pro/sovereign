import { PERMISSIONS } from './auth.config';

export const navigationConfig = {
  adminNav: [
    {
      title: 'Dashboard',
      href: '/admin/dashboard',
      icon: 'dashboard',
      permission: PERMISSIONS.VIEW_ANALYTICS,
    },
    {
      title: 'Properties',
      href: '/admin/properties',
      icon: 'building',
      permission: PERMISSIONS.VIEW_PROPERTIES,
      children: [
        {
          title: 'All Properties',
          href: '/admin/properties',
          permission: PERMISSIONS.VIEW_PROPERTIES,
        },
        {
          title: 'Add Property',
          href: '/admin/properties/new',
          permission: PERMISSIONS.CREATE_PROPERTY,
        },
        {
          title: 'Approvals',
          href: '/admin/properties/approvals',
          permission: PERMISSIONS.APPROVE_PROPERTY,
        },
      ],
    },
    {
      title: 'Leads',
      href: '/admin/leads',
      icon: 'users',
      permission: PERMISSIONS.VIEW_LEADS,
      children: [
        {
          title: 'All Leads',
          href: '/admin/leads',
          permission: PERMISSIONS.VIEW_LEADS,
        },
        {
          title: 'Add Lead',
          href: '/admin/leads/new',
          permission: PERMISSIONS.CREATE_LEAD,
        },
        {
          title: 'Assignments',
          href: '/admin/leads/assignments',
          permission: PERMISSIONS.ASSIGN_LEAD,
        },
      ],
    },
    {
      title: 'Documents',
      href: '/admin/documents',
      icon: 'file',
      permission: PERMISSIONS.VIEW_DOCUMENTS,
      children: [
        {
          title: 'All Documents',
          href: '/admin/documents',
          permission: PERMISSIONS.VIEW_DOCUMENTS,
        },
        {
          title: 'Upload',
          href: '/admin/documents/upload',
          permission: PERMISSIONS.CREATE_DOCUMENT,
        },
        {
          title: 'Approvals',
          href: '/admin/documents/approvals',
          permission: PERMISSIONS.APPROVE_DOCUMENT,
        },
      ],
    },
    {
      title: 'Team',
      href: '/admin/team',
      icon: 'users',
      permission: PERMISSIONS.VIEW_TEAM,
      children: [
        {
          title: 'Members',
          href: '/admin/team/members',
          permission: PERMISSIONS.VIEW_TEAM,
        },
        {
          title: 'Roles',
          href: '/admin/team/roles',
          permission: PERMISSIONS.ASSIGN_ROLES,
        },
      ],
    },
    {
      title: 'Reports',
      href: '/admin/reports',
      icon: 'chart',
      permission: PERMISSIONS.GENERATE_REPORTS,
    },
    {
      title: 'Settings',
      href: '/admin/settings',
      icon: 'settings',
      permission: PERMISSIONS.MANAGE_SETTINGS,
    },
  ],

  agentNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
      permission: PERMISSIONS.VIEW_ANALYTICS,
    },
    {
      title: 'Properties',
      href: '/properties',
      icon: 'building',
      permission: PERMISSIONS.VIEW_PROPERTIES,
      children: [
        {
          title: 'My Properties',
          href: '/properties',
          permission: PERMISSIONS.VIEW_PROPERTIES,
        },
        {
          title: 'Add Property',
          href: '/properties/new',
          permission: PERMISSIONS.CREATE_PROPERTY,
        },
      ],
    },
    {
      title: 'Leads',
      href: '/leads',
      icon: 'users',
      permission: PERMISSIONS.VIEW_LEADS,
      children: [
        {
          title: 'My Leads',
          href: '/leads',
          permission: PERMISSIONS.VIEW_LEADS,
        },
        {
          title: 'Add Lead',
          href: '/leads/new',
          permission: PERMISSIONS.CREATE_LEAD,
        },
      ],
    },
    {
      title: 'Documents',
      href: '/documents',
      icon: 'file',
      permission: PERMISSIONS.VIEW_DOCUMENTS,
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: 'chart',
      permission: PERMISSIONS.VIEW_ANALYTICS,
    },
  ],
};
