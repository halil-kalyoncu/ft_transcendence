import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  await prisma.powerup.create({
    data: {
      name: 'slowBall',
    },
  });

  await prisma.powerup.create({
    data: {
      name: 'fastBall',
    },
  });

  await prisma.powerup.create({
    data: {
      name: 'decreasePaddleHeight',
    },
  });

  await prisma.powerup.create({
    data: {
      name: 'increasePaddleHeight'
    }
  });

  await prisma.powerup.create({
    data: {
      name: 'magnet'
    }
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  throw e;
});