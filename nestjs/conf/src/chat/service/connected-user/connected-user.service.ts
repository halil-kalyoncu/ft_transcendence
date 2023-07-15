import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectedUserEntity } from '../../../chat/model/connected-user/connected-user.entity';
import { ConnectedUserI } from '../../../chat/model/connected-user/connected-user.interface';
import { UserI } from '../../../user/model/user.interface';
import { Repository } from 'typeorm';

@Injectable()
export class ConnectedUserService {
  constructor(
    @InjectRepository(ConnectedUserEntity)
    private readonly connectedUserRepository: Repository<ConnectedUserEntity>,
  ) {}

  async create(connectedUser: ConnectedUserI): Promise<ConnectedUserI> {
    return this.connectedUserRepository.save(
      this.connectedUserRepository.create(connectedUser),
    );
  }

  async findByUser(user: UserI): Promise<ConnectedUserI> {
    const connectedUser = await this.connectedUserRepository
      .createQueryBuilder('connectedUser')
      .leftJoinAndSelect('connectedUser.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .getOne();

    return connectedUser;
  }

  async deleteBySocketId(socketId: string) {
    return this.connectedUserRepository.delete({ socketId });
  }

  async deleteAll() {
    await this.connectedUserRepository.createQueryBuilder().delete().execute();
  }
}
