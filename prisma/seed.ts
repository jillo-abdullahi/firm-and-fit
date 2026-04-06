import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.create({
    data: {
      firebaseUid: 'seed_admin_123',
      name: 'Admin User',
      email: 'admin@firmandfit.com',
      role: 'ADMIN'
    }
  });

  const player = await prisma.user.create({
    data: {
      firebaseUid: 'seed_player_456',
      name: 'John Player',
      email: 'john@firmandfit.com',
      role: 'PLAYER'
    }
  });

  const comp = await prisma.competition.create({
    data: {
      name: 'Sunday League',
      type: 'LEAGUE',
      season: '2024-2025'
    }
  });
  
  const opp = await prisma.opponent.create({
    data: {
      name: 'Rival FC',
    }
  });

  const fixture = await prisma.fixture.create({
    data: {
      opponentId: opp.id,
      competitionId: comp.id,
      isHome: true,
      location: 'Home Stadium',
      date: new Date(),
      type: 'LEAGUE'
    }
  });

  await prisma.attendance.create({
    data: {
      userId: player.id,
      fixtureId: fixture.id,
      status: 'GOING'
    }
  });

  console.log('Seed completed.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
