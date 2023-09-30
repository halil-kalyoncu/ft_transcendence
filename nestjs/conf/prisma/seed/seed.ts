import { Achievement, Powerup, PrismaClient } from '@prisma/client';

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

async function createAchievement(achievementName: string, scoreBronze: number, scoreSilver: number, scoreGold: number) {
	const achievement: Achievement = await prisma.achievement.findUnique({
		where: {
		  name: achievementName,
		},
	  });
	
	  if (!achievement) {
		await prisma.achievement.create({
		  data: {
			name: achievementName,
			scoreBronze,
			scoreSilver,
			scoreGold,
		  },
		});
	  }	
}
async function main() {
  await createPowerup('slowBall');
  await createPowerup('fastBall');
  await createPowerup('decreasePaddleHeight');
  await createPowerup('increasePaddleHeight');
  await createPowerup('magnet');

  await createAchievement('total Goals', 10, 20, 30);
  await createAchievement('flawless Victories', 2, 4, 6);
  await createAchievement('total Wins', 10, 20, 30);
  await createAchievement('Comebacks', 10, 20, 30);
  await createAchievement('first Goal', 1, 2, 3);

  await prisma.$disconnect();
}

main().catch((e) => {
  throw e;
});
