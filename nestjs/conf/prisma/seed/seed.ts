import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {

  await prisma.powerup.create({
    data: {
      name: 'slow',
    },
  });

  await prisma.powerup.create({
    data: {
      name: 'fast',
    },
  });

  await prisma.powerup.create({
    data: {
      name: 'small',
    },
  });

  await prisma.powerup.create({
    data: {
      name: 'big',
    },
  });

  await prisma.$disconnect();
}

main().catch((e) => {
  throw e;
});