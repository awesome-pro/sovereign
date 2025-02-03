// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with roles, permissions, and a super admin user...");

    // OPTIONAL: Uncomment to clear existing data (use with caution)
    // await prisma.userRole.deleteMany();
    // await prisma.role.deleteMany();
    // await prisma.permission.deleteMany();
    // await prisma.user.deleteMany();

    // Define permissions for various resource types (property, lead, user)
    const permissionsData = [
      // --- Property Permissions (resourceCode: "0p") ---
      { name: "Property View", description: "View properties", resourceCode: "0p", slug: "0p.0x0001", bit: 0x0001 },
      { name: "Property Create", description: "Create properties", resourceCode: "0p", slug: "0p.0x0002", bit: 0x0002 },
      { name: "Property Edit", description: "Edit properties", resourceCode: "0p", slug: "0p.0x0004", bit: 0x0004 },
      { name: "Property Delete", description: "Delete properties", resourceCode: "0p", slug: "0p.0x0008", bit: 0x0008 },
      { name: "Property Manage", description: "Manage properties", resourceCode: "0p", slug: "0p.0x0010", bit: 0x0010 },
      { name: "Property Approve", description: "Approve property listings", resourceCode: "0p", slug: "0p.0x0020", bit: 0x0020 },
      { name: "Property Execute", description: "Execute property transactions", resourceCode: "0p", slug: "0p.0x0040", bit: 0x0040 },

      // --- Lead Permissions (resourceCode: "0l") ---
      { name: "Lead View", description: "View leads", resourceCode: "0l", slug: "0l.0x0001", bit: 0x0001 },
      { name: "Lead Create", description: "Create leads", resourceCode: "0l", slug: "0l.0x0002", bit: 0x0002 },
      { name: "Lead Edit", description: "Edit leads", resourceCode: "0l", slug: "0l.0x0004", bit: 0x0004 },
      { name: "Lead Delete", description: "Delete leads", resourceCode: "0l", slug: "0l.0x0008", bit: 0x0008 },
      { name: "Lead Manage", description: "Manage leads", resourceCode: "0l", slug: "0l.0x0010", bit: 0x0010 },
      { name: "Lead Approve", description: "Approve leads", resourceCode: "0l", slug: "0l.0x0020", bit: 0x0020 },
      { name: "Lead Execute", description: "Execute lead actions", resourceCode: "0l", slug: "0l.0x0040", bit: 0x0040 },

      // --- User Permissions (resourceCode: "0u") ---
      { name: "User View", description: "View users", resourceCode: "0u", slug: "0u.0x0001", bit: 0x0001 },
      { name: "User Create", description: "Create users", resourceCode: "0u", slug: "0u.0x0002", bit: 0x0002 },
      { name: "User Edit", description: "Edit users", resourceCode: "0u", slug: "0u.0x0004", bit: 0x0004 },
      { name: "User Delete", description: "Delete users", resourceCode: "0u", slug: "0u.0x0008", bit: 0x0008 },
      { name: "User Manage", description: "Manage users", resourceCode: "0u", slug: "0u.0x0010", bit: 0x0010 },
      { name: "User Approve", description: "Approve users", resourceCode: "0u", slug: "0u.0x0020", bit: 0x0020 },
      { name: "User Execute", description: "Execute user actions", resourceCode: "0u", slug: "0u.0x0040", bit: 0x0040 },
    ];

    // Create or update permissions
    for (const perm of permissionsData) {
      await prisma.permission.upsert({
        where: { slug: perm.slug },
        update: {},
        create: {
          name: perm.name,
          description: perm.description,
          resourceCode: perm.resourceCode,
          slug: perm.slug,
          bit: perm.bit,
        },
      });
    }
    console.log("✅ Permissions seeded.");

    // Fetch all permissions for later assignment
    const allPermissions = await prisma.permission.findMany();

    // Define roles with a clear hierarchy and specific permissions
    const rolesData = [
      {
        name: "Super Admin",
        roleHash: "s001",
        description: "Full access to all resources.",
        hierarchy: 0,
        permissions: allPermissions.map(p => ({ id: p.id })), // All permissions
      },
      {
        name: "Admin",
        roleHash: "admin",
        description: "Broad administrative permissions.",
        hierarchy: 1,
        permissions: allPermissions, // Could restrict specific bits if needed
      },
      {
        name: "Agent",
        roleHash: "agent",
        description: "Real estate agent with property and lead handling permissions.",
        hierarchy: 2,
        // Example: allow view, create, and edit on properties and leads
        permissions: allPermissions.filter(p =>
          (p.resourceCode === "0p" && [ "0p.0x0001", "0p.0x0002", "0p.0x0004" ].includes(p.slug)) ||
          (p.resourceCode === "0l" && [ "0l.0x0001", "0l.0x0002", "0l.0x0004" ].includes(p.slug))
        ),
      },
      {
        name: "Investor",
        roleHash: "investor",
        description: "Investor with view-only access for properties and leads.",
        hierarchy: 3,
        permissions: allPermissions.filter(p =>
          (p.resourceCode === "0p" && p.slug === "0p.0x0001") ||
          (p.resourceCode === "0l" && p.slug === "0l.0x0001")
        ),
      },
      {
        name: "Broker",
        roleHash: "broker",
        description: "Broker with selective permissions for facilitating deals.",
        hierarchy: 4,
        // Example: allow view plus additional actions on properties as needed
        permissions: allPermissions.filter(p =>
          (p.resourceCode === "0p" && p.slug === "0p.0x0001")
        ),
      },
    ];

    // Create or update roles
    for (const role of rolesData) {
      await prisma.role.upsert({
        where: { roleHash: role.roleHash },
        update: {},
        create: {
          name: role.name,
          roleHash: role.roleHash,
          description: role.description,
          hierarchy: role.hierarchy,
          permissions: {
            connect: role.permissions,
          },
        },
      });
    }
    console.log("✅ Roles seeded.");

    // Fetch the Super Admin role to assign it to our sample user
    const superAdminRole = await prisma.role.findUnique({
      where: { roleHash: "superadmin" },
    });

    // Create a sample Super Admin user
    // Adjust the user fields as per your actual User model
    const superAdminUser = await prisma.user.upsert({
      where: { email: "founder@estatecrm.com" },
      update: {},
      create: {
        email: "founder@estatecrm.com",
        name: "Estate CRM Founder",
        //avatar: "https://example.com/superadmin-avatar.png",
        password: "$2a$12$ZEo1wghHC06wg7Ay4Z9/lezXpITbLaIJpLFxnvbLXWqh8SiCRvbRG",
        status: "ACTIVE",  // Adjust based on your enum values
        twoFactorEnabled: true,
        // Connect the Super Admin role using the UserRole join table
        roles: {
          create: {
            roleId: superAdminRole!.id,
            assignedBy: "system",
          },
        },
      },
    });

    console.log("✅ Super Admin user seeded.");

    console.log("🌱 Database seeding completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
