import { PrismaClient, PermissionCategory } from '@sovereign/database';

const prisma = new PrismaClient();

interface RoleDefinition {
  name: string;
  description: string;
  permissions: {
    name: string;
    slug: string;
    category: PermissionCategory;
    description: string;
  }[];
}

const roleDefinitions: RoleDefinition[] = [
  {
    name: 'SUPER_ADMIN',
    description: 'Super administrator with full system access',
    permissions: [
      {
        name: 'Manage Roles',
        slug: 'MANAGE_ROLES',
        category: PermissionCategory.MANAGE,
        description: 'Create, update, and delete roles',
      },
      {
        name: 'Manage Permissions',
        slug: 'MANAGE_PERMISSIONS',
        category: PermissionCategory.MANAGE,
        description: 'Manage system permissions',
      },
      {
        name: 'Manage Users',
        slug: 'MANAGE_USERS',
        category: PermissionCategory.MANAGE,
        description: 'Create, update, and delete users',
      },
      // Add more super admin permissions
    ],
  },
  {
    name: 'COMPANY_ADMIN',
    description: 'Company administrator with company-wide access',
    permissions: [
      {
        name: 'Manage Company Users',
        slug: 'MANAGE_COMPANY_USERS',
        category: PermissionCategory.MANAGE,
        description: 'Manage users within the company',
      },
      {
        name: 'View Company Reports',
        slug: 'VIEW_COMPANY_REPORTS',
        category: PermissionCategory.VIEW,
        description: 'View company-wide reports',
      },
      // Add more company admin permissions
    ],
  },
  {
    name: 'AGENT',
    description: 'Real estate agent',
    permissions: [
      {
        name: 'Manage Properties',
        slug: 'MANAGE_PROPERTIES',
        category: PermissionCategory.MANAGE,
        description: 'Create and manage property listings',
      },
      {
        name: 'Manage Leads',
        slug: 'MANAGE_LEADS',
        category: PermissionCategory.MANAGE,
        description: 'Create and manage leads',
      },
      {
        name: 'View Properties',
        slug: 'VIEW_PROPERTIES',
        category: PermissionCategory.VIEW,
        description: 'View property listings',
      },
      // Add more agent permissions
    ],
  },
  {
    name: 'VIEWER',
    description: 'Basic user with view-only access',
    permissions: [
      {
        name: 'View Properties',
        slug: 'VIEW_PROPERTIES',
        category: PermissionCategory.VIEW,
        description: 'View property listings',
      },
      {
        name: 'View Public Content',
        slug: 'VIEW_PUBLIC_CONTENT',
        category: PermissionCategory.VIEW,
        description: 'View public content',
      },
      // Add more viewer permissions
    ],
  },
];

async function seedRBAC() {
  try {
    console.log('Starting RBAC seed...');

    for (const roleDef of roleDefinitions) {
      // Create or update role
      const role = await prisma.role.upsert({
        where: { name: roleDef.name },
        update: {
          description: roleDef.description,
        },
        create: {
          name: roleDef.name,
          description: roleDef.description,
        },
      });

      // Create or update permissions
      for (const permDef of roleDef.permissions) {
        const permission = await prisma.permission.upsert({
          where: { slug: permDef.slug },
          update: {
            name: permDef.name,
            description: permDef.description,
            category: permDef.category,
          },
          create: {
            name: permDef.name,
            slug: permDef.slug,
            description: permDef.description,
            category: permDef.category,
          },
        });

        // Connect permission to role
        await prisma.role.update({
          where: { id: role.id },
          data: {
            permissions: {
              connect: { id: permission.id },
            },
          },
        });
      }
    }

    console.log('RBAC seed completed successfully');
  } catch (error) {
    console.error('Error seeding RBAC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed if this file is executed directly
if (require.main === module) {
  seedRBAC()
    .then(() => console.log('Seed completed'))
    .catch((error) => {
      console.error('Seed failed:', error);
      process.exit(1);
    });
}

export { seedRBAC };
