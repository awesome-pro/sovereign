// prisma/seed.ts

import { PrismaClient, PermissionCategory, UserStatus } from '@prisma/client';
const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with roles and permissions for UHNW Real Estate...");

    // ------------------------------------------
    // 1. Seed Permissions
    // ------------------------------------------
    // Define permission data for multiple entities.
    const permissionsData = [
      // --- Property Permissions ---
      {
        name: "View Properties",
        slug: "property.001",
        description: "Can view property listings",
        category: PermissionCategory.VIEW,
        actionLevel: 1,
      },
      {
        name: "Create Property",
        slug: "property.002",
        description: "Can create new property listings",
        category: PermissionCategory.CREATE,
        actionLevel: 2,
      },
      {
        name: "Edit Property",
        slug: "property.003",
        description: "Can edit property details",
        category: PermissionCategory.EDIT,
        actionLevel: 2,
      },
      {
        name: "Delete Property",
        slug: "property.004",
        description: "Can delete or archive property listings",
        category: PermissionCategory.DELETE,
        actionLevel: 2,
      },
      {
        name: "Manage Properties",
        slug: "property.007",
        description: "Full control over property listings",
        category: PermissionCategory.MANAGE,
        actionLevel: 3,
      },
      // --- Lead Permissions ---
      {
        name: "View Leads",
        slug: "lead.001",
        description: "Can view lead information",
        category: PermissionCategory.VIEW,
        actionLevel: 1,
      },
      {
        name: "Create Lead",
        slug: "lead.002",
        description: "Can create new leads",
        category: PermissionCategory.CREATE,
        actionLevel: 2,
      },
      {
        name: "Edit Lead",
        slug: "lead.003",
        description: "Can update lead details",
        category: PermissionCategory.EDIT,
        actionLevel: 2,
      },
      {
        name: "Delete Lead",
        slug: "lead.004",
        description: "Can delete or archive leads",
        category: PermissionCategory.DELETE,
        actionLevel: 2,
      },
      {
        name: "Manage Leads",
        slug: "lead.007",
        description: "Full control over leads",
        category: PermissionCategory.MANAGE,
        actionLevel: 3,
      },
      // --- Deal Permissions ---
      {
        name: "View Deals",
        slug: "deal.001",
        description: "Can view deal details",
        category: PermissionCategory.VIEW,
        actionLevel: 1,
      },
      {
        name: "Create Deal",
        slug: "deal.002",
        description: "Can create new deals",
        category: PermissionCategory.CREATE,
        actionLevel: 2,
      },
      {
        name: "Edit Deal",
        slug: "deal.003",
        description: "Can update deal information",
        category: PermissionCategory.EDIT,
        actionLevel: 2,
      },
      {
        name: "Delete Deal",
        slug: "deal.004",
        description: "Can delete or archive deals",
        category: PermissionCategory.DELETE,
        actionLevel: 2,
      },
      {
        name: "Manage Deals",
        slug: "deal.007",
        description: "Full control over deals",
        category: PermissionCategory.MANAGE,
        actionLevel: 3,
      },
      // --- Transaction Permissions ---
      {
        name: "View Transactions",
        slug: "transaction.001",
        description: "Can view transaction details",
        category: PermissionCategory.VIEW,
        actionLevel: 1,
      },
      {
        name: "Create Transaction",
        slug: "transaction.002",
        description: "Can create new transactions",
        category: PermissionCategory.CREATE,
        actionLevel: 2,
      },
      {
        name: "Edit Transaction",
        slug: "transaction.003",
        description: "Can modify transactions",
        category: PermissionCategory.EDIT,
        actionLevel: 2,
      },
      {
        name: "Delete Transaction",
        slug: "transaction.004",
        description: "Can delete transactions",
        category: PermissionCategory.DELETE,
        actionLevel: 2,
      },
      {
        name: "Manage Transactions",
        slug: "transaction.007",
        description: "Full control over transactions",
        category: PermissionCategory.MANAGE,
        actionLevel: 3,
      },
      // --- Message Permissions ---
      {
        name: "View Messages",
        slug: "message.001",
        description: "Can view messages",
        category: PermissionCategory.VIEW,
        actionLevel: 1,
      },
      {
        name: "Create Message",
        slug: "message.002",
        description: "Can send messages",
        category: PermissionCategory.CREATE,
        actionLevel: 2,
      },
      {
        name: "Edit Message",
        slug: "message.003",
        description: "Can edit messages",
        category: PermissionCategory.EDIT,
        actionLevel: 2,
      },
      {
        name: "Delete Message",
        slug: "message.004",
        description: "Can delete messages",
        category: PermissionCategory.DELETE,
        actionLevel: 2,
      },
      {
        name: "Manage Messages",
        slug: "message.007",
        description: "Full control over messaging",
        category: PermissionCategory.MANAGE,
        actionLevel: 3,
      },
      // --- Report Permissions ---
      {
        name: "View Reports",
        slug: "report.001",
        description: "Can view reports and analytics",
        category: PermissionCategory.VIEW,
        actionLevel: 1,
      },
      {
        name: "Manage Reports",
        slug: "report.007",
        description: "Full control over reports",
        category: PermissionCategory.MANAGE,
        actionLevel: 3,
      },
      // --- User Management Permissions ---
      {
        name: "View Users",
        slug: "user.001",
        description: "Can view user information",
        category: PermissionCategory.VIEW,
        actionLevel: 1,
      },
      {
        name: "Create User",
        slug: "user.002",
        description: "Can create new users",
        category: PermissionCategory.CREATE,
        actionLevel: 2,
      },
      {
        name: "Edit User",
        slug: "user.003",
        description: "Can modify user details",
        category: PermissionCategory.EDIT,
        actionLevel: 2,
      },
      {
        name: "Delete User",
        slug: "user.004",
        description: "Can delete or deactivate users",
        category: PermissionCategory.DELETE,
        actionLevel: 2,
      },
      {
        name: "Manage Users",
        slug: "user.007",
        description: "Full control over user management",
        category: PermissionCategory.MANAGE,
        actionLevel: 3,
      },
    ];

    // Create or update permissions (skip duplicates)
    await prisma.permission.createMany({
      data: permissionsData,
      skipDuplicates: true,
    });

    // Fetch all permissions from the database for later use.
    const allPermissions = await prisma.permission.findMany();

    // ------------------------------------------
    // 2. Seed Roles
    // ------------------------------------------
    // Define roles along with the subset of permissions (by slug) they should have.
    // For simplicity, we assume the following:
    // - Super Admin: All permissions.
    // - Admin: All except some super-privileged ones (if needed).
    // - Agent: Focused on property and lead actions.
    // - Investor: Mostly view and limited creation/editing of deals.
    // - Broker: Limited view/edit of deals and transactions.
    // - Customer: Only view permissions.
    interface RoleSeedData {
      name: string;
      roleHash: string;
      description: string;
      hierarchy: number;
      permissionSlugs: string[]; // List of permission slugs to assign
    }

    const rolesData: RoleSeedData[] = [
      {
        name: "Super Admin",
        roleHash: "s001",
        description: "Full system access. All permissions granted.",
        hierarchy: 0,
        permissionSlugs: allPermissions.map((p) => p.slug),
      },
      {
        name: "Admin",
        roleHash: "admin",
        description: "Administrative access to manage users, properties, and transactions.",
        hierarchy: 1,
        permissionSlugs: allPermissions
          .filter((p) => p.slug !== "report.007") // Example: exclude some super privileged ones if desired
          .map((p) => p.slug),
      },
      {
        name: "Real Estate Agent",
        roleHash: "agent",
        description: "Manages property listings and leads.",
        hierarchy: 2,
        permissionSlugs: [
          "property.001", // View Propertie
          "property.023", // Edit Property
          "lead.001",     // View Leads
          "lead.002",     // Create Lead
          "lead.003",     // Edit Lead
          "message.001",  // View Messages
          "message.002",  // Create Message
        ],
      },
      {
        name: "Investor",
        roleHash: "investor",
        description: "Views property and deal information, with limited deal actions.",
        hierarchy: 3,
        permissionSlugs: [
          "property.001", // View Properties
          "deal.002",     // Create Deal
          "deal.003",     // Edit Deal
          "transaction.001", // View Transactions
          "report.001",   // View Reports
        ],
      },
      {
        name: "Broker",
        roleHash: "broker",
        description: "Facilitates deals with limited control over transactions.",
        hierarchy: 4,
        permissionSlugs: [
          "property.001", // View Properties
          "deal.003",     // Edit Deal
          "transaction.003", // Edit Transaction
          "message.002",  // Create Message
        ],
      },
      {
        name: "Customer",
        roleHash: "customer",
        description: "Limited access; can only view properties and leads.",
        hierarchy: 5,
        permissionSlugs: [
          "property.001",   // View Properties
          "lead.001",       // View Leads
          "deal.001",       // View Deals
          "transaction.001", // View Transactions
          "message.001",    // View Messages
          "report.001",     // View Reports
        ],
      },
    ];

    // Upsert roles with their permissions
    for (const role of rolesData) {
      // Get permission IDs for the given permission slugs
      const permissionConnect = allPermissions
        .filter((perm) => role.permissionSlugs.includes(perm.slug))
        .map((perm) => ({ id: perm.id }));

      await prisma.role.upsert({
        where: { roleHash: role.roleHash },
        update: {
          // Update allowed permissions if needed.
          permissions: {
            set: permissionConnect,
          },
        },
        create: {
          name: role.name,
          roleHash: role.roleHash,
          description: role.description,
          hierarchy: role.hierarchy,
          permissions: {
            connect: permissionConnect,
          },
        },
      });
    }

    // ------------------------------------------
    // 3. Seed a Super Admin User
    // ------------------------------------------
    // Create or update a sample super admin user.
    // Adjust email, name, avatar, etc. as needed.
    const superAdminUser = await prisma.user.upsert({
      where: { email: "superadmin@estatecrm.com" },
      update: {},
      create: {
        email: "superadmin@estatecrm.com",
        name: "Super Admin",
        status: UserStatus.ACTIVE,
        twoFactorEnabled: true,
        password: "$2a$12$gRJEVatS42BQ0IftHx9skuX3RcJa.IccyZ7ZEGwMbViY3uBkKzZSW"
      },
    });

    // ------------------------------------------
    // 4. Assign the Super Admin Role to the Super Admin User
    // ------------------------------------------
    // Assuming a UserRole join table exists to link users to roles.
    // Use upsert to avoid duplicates.
    const superAdminRole = await prisma.role.findUnique({
      where: { roleHash: "s001" },
    });
    if (superAdminRole) {
      await prisma.userRole.upsert({
        where: {
          // Composite unique key: userId and roleId
          userId_roleId: { userId: superAdminUser.id, roleId: superAdminRole.id },
        },
        update: {},
        create: {
          userId: superAdminUser.id,
          roleId: superAdminRole.id,
          assignedBy: "system",
          // validFrom defaults to now
        },
      });
    }

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
