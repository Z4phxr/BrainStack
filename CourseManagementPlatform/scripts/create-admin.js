const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// SECURITY: Never hardcode credentials.
// Set SEED_ADMIN_PASSWORD and optionally SEED_ADMIN_EMAIL in your environment.
(async () => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error(
      '[ERROR] SEED_ADMIN_PASSWORD environment variable is required.\n' +
      '        Generate one with: openssl rand -base64 24\n' +
      '        Then set it in your .env file or environment.'
    );
    process.exitCode = 1;
    return;
  }

  const prisma = new PrismaClient();
  const passwordHash = bcrypt.hashSync(adminPassword, 12);

  try {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      console.log('User already exists:', existing.id);
      return;
    }

    const user = await prisma.user.create({
      data: {
        id: 'seed-admin-1',
        email: adminEmail,
        name: 'Admin',
        passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('Created user:', user.id);
  } catch (err) {
    console.error('Create error:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
