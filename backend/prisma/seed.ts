import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sugoi.com' },
    update: {},
    create: { name: 'Admin Sugoi', email: 'admin@sugoi.com', passwordHash, role: 'ADMIN' }
  });

  const sarah = await prisma.user.upsert({
    where: { email: 'sarah.dev@example.com' },
    update: {},
    create: { name: 'Sarah Dev', email: 'sarah.dev@example.com', passwordHash, role: 'USER' }
  });

  const events = [
    { title: 'Global DevOps Workshop', date: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000), totalCapacity: 240, availableCapacity: 240, adminId: admin.id },
    { title: 'System Design Masterclass', date: new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000), totalCapacity: 50, availableCapacity: 50, adminId: admin.id },
    { title: 'Advanced Prisma Scaling', date: new Date(new Date().getTime() + 45 * 24 * 60 * 60 * 1000), totalCapacity: 100, availableCapacity: 100, adminId: admin.id },
    { title: 'Kubernetes Deep Dive', date: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000), totalCapacity: 300, availableCapacity: 300, adminId: admin.id },
  ];

  for (const ev of events) {
    const existing = await prisma.event.findFirst({ where: { title: ev.title } });
    if (!existing) await prisma.event.create({ data: ev });
  }

  console.log('Database seeded successfully. Admin and mock events created.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
