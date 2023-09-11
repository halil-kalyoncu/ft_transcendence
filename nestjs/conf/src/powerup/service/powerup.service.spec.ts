import { Test, TestingModule } from '@nestjs/testing';
import { PowerupService } from './powerup.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Powerup } from '@prisma/client';

describe('PowerupService', () => {
  let service: PowerupService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PowerupService,
        {
          provide: PrismaService,
          useValue: PrismaService.getInstance(),
        },
      ],
    }).compile();

    service = module.get<PowerupService>(PowerupService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByNames', () => {
    it('should return powerup array that have matching names', async () => {
      const powerupNames: string[] = [
        'big',
        'small',
        'fast',
        'slow'
      ];
      const powerups: Powerup[] = [
        {
          id: 1,
          name: 'slow'
        },
        {
          id: 2,
          name: 'fast'
        },
        {
          id: 3,
          name: 'small'
        },
        {
          id: 4,
          name: 'big'
        }
      ];

      const findManySpy = jest
        .spyOn(prismaService.powerup, 'findMany')
        .mockResolvedValue(powerups);

      const result = await service.findByNames(powerupNames);

      expect(result).toBe(powerups);
      expect(findManySpy).toBeCalledWith({
        where: {
          name: { in: powerupNames },
        },   
      })

      findManySpy.mockRestore();
    });

    it("should return empty array when names don't match", async () => {
      const powerupNames: string[] = [
        'non',
        'nonexisting',
      ];
      const powerups: Powerup[] = [];

      const findManySpy = jest
        .spyOn(prismaService.powerup, 'findMany')
        .mockResolvedValue(powerups);

      const result = await service.findByNames(powerupNames);

      expect(result).toBe(powerups);
      expect(findManySpy).toBeCalledWith({
        where: {
          name: { in: powerupNames },
        },   
      })

      findManySpy.mockRestore();
    });

    it("should return powerup array that have matching names, ignore names that don't match", async () => {
      const powerupNames: string[] = [
        'non',
        'slow',
        'nonexisting',
        'small'
      ];
      const powerups: Powerup[] = [
        {
          id: 1,
          name: 'slow'
        },
        {
          id: 3,
          name: 'small'
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.powerup, 'findMany')
        .mockResolvedValue(powerups);

      const result = await service.findByNames(powerupNames);

      expect(result).toBe(powerups);
      expect(findManySpy).toBeCalledWith({
        where: {
          name: { in: powerupNames },
        },   
      })

      findManySpy.mockRestore();
    });
  });
});
