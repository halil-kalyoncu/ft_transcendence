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
  createPowerup('slowBall');
  createPowerup('fastBall');
  createPowerup('decreasePaddleHeight');
  createPowerup('increasePaddleHeight');
  createPowerup('magnet');

  createAchievement('totalGoals', 10, 20, 30);
  createAchievement('flawlessVictories', 2, 4, 6);
  createAchievement('totalWins', 10, 20, 30);

  await prisma.$disconnect();
}

main().catch((e) => {
  throw e;
});
