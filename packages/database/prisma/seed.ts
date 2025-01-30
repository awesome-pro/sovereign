import { PermissionCategory, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create Roles
  const superAdmin = await prisma.role.create({
    data: { name: "Super Admin", description: "Full system access" },
  });

  const ceo = await prisma.role.create({
    data: { name: "CEO / Owner", description: "Business owner", parentRoleId: superAdmin.id },
  });

  const seniorBroker = await prisma.role.create({
    data: { name: "Senior Broker", description: "High-value deal closer", parentRoleId: ceo.id },
  });

  const broker = await prisma.role.create({
    data: { name: "Broker", description: "Regular property broker", parentRoleId: seniorBroker.id },
  });

  const agent = await prisma.role.create({
    data: { name: "Agent", description: "Property listing & client handling", parentRoleId: broker.id },
  });

  const complianceOfficer = await prisma.role.create({
    data: { name: "Compliance Officer", description: "Legal & risk management", parentRoleId: ceo.id },
  });

  const investor = await prisma.role.create({
    data: { name: "Investor", description: "High-net-worth investor" },
  });

  const client = await prisma.role.create({
    data: { name: "Client (Buyer / Seller)", description: "Regular user" },
  });

  console.log("✅ Roles seeded!");

  // Create Permissions
  const permissions = [
    { name: "View All Properties", slug: "property.view.all", category: PermissionCategory.VIEW },
    { name: "View Own Properties", slug: "property.view.own", category: PermissionCategory.VIEW },
    { name: "Edit Property", slug: "property.edit", category: PermissionCategory.EDIT },
    { name: "Delete Property", slug: "property.delete", category: PermissionCategory.DELETE },
    { name: "Manage Transactions", slug: "transaction.manage", category: PermissionCategory.MANAGE },
    { name: "Approve High-Value Deals", slug: "deal.approve.vip", category: PermissionCategory.MANAGE },
    { name: "View Compliance Reports", slug: "compliance.view", category: PermissionCategory.VIEW },
    { name: "Manage Users", slug: "user.manage", category: PermissionCategory.MANAGE },
  ];  

  for (const perm of permissions) {
    await prisma.permission.create({ data: perm });
  }

  console.log("✅ Permissions seeded!");

  // Assign Permissions to Roles
  await prisma.role.update({
    where: { id: superAdmin.id },
    data: { permissions: { connect: permissions.map((p) => ({ slug: p.slug })) } },
  });

  await prisma.role.update({
    where: { id: ceo.id },
    data: { permissions: { connect: permissions.filter((p) => p.slug.includes("manage")).map((p) => ({ slug: p.slug })) } },
  });

  await prisma.role.update({
    where: { id: seniorBroker.id },
    data: { permissions: { connect: [{ slug: "deal.approve.vip" }] } },
  });

  await prisma.role.update({
    where: { id: broker.id },
    data: { permissions: { connect: [{ slug: "property.view.all" }, { slug: "property.edit" }] } },
  });

  await prisma.role.update({
    where: { id: agent.id },
    data: { permissions: { connect: [{ slug: "property.view.own" }] } },
  });

  await prisma.role.update({
    where: { id: complianceOfficer.id },
    data: { permissions: { connect: [{ slug: "compliance.view" }] } },
  });

  console.log("✅ Role-Permission Mapping Done!");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("Error while seeding:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
