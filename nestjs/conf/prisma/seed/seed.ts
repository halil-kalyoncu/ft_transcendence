import { Powerup, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createPowerup(powerupName: string) {
  const powerup: Powerup = await prisma.powerup.findUnique({
    where: {
      name: powerupName,
    },
  });

  if (!powerup) {
    await prisma.powerup.create({
      data: {
        name: powerupName,
      },
    });
  }
}

async function main() {
  createPowerup('slowBall');
  createPowerup('fastBall');
  createPowerup('decreasePaddleHeight');
  createPowerup('increasePaddleHeight');
  createPowerup('magnet');

  await prisma.$disconnect();
}

main().catch((e) => {
  throw e;
});
