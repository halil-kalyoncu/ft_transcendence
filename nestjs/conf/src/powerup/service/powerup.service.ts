import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Powerup } from '@prisma/client';

@Injectable()
export class PowerupService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number): Promise<Powerup> {
    return await this.prisma.powerup.findUnique({
      where: {
        id,
      },
    });
  }

  async findByNames(powerupNames: string[]): Promise<Powerup[]> {
    return await this.prisma.powerup.findMany({
      where: {
        name: { in: powerupNames },
      },
    });
  }
}
