import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from '../../../auth/service/auth.service';
import { UserEntity } from '../../../user/model/user.entity';
import { UserI } from '../../../user/model/user.interface';
import { Like, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private authService: AuthService,
  ) {}

  //remove this, if 42 login works
  async login(user: UserI): Promise<string> {
    let foundUser: UserI = await this.findByUsername(user.username);
    if (!foundUser) {
      foundUser = await this.create(user);
    }
    return this.authService.generateJwt(foundUser);
  }

  async create(newUser: UserI): Promise<UserI> {
    try {
      const user = await this.userRepository.save(
        this.userRepository.create(newUser),
      );
      return this.findById(user.id);
    } catch {
      throw new HttpException(
        'Username is already in use',
        HttpStatus.CONFLICT,
      );
    }
  }

  async findById(id: number): Promise<UserI> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findByUsername(username: string): Promise<UserI> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async findAll(): Promise<UserI[]> {
    return this.userRepository.find();
  }

  async findAllByUsername(username: string): Promise<UserI[]> {
    return this.userRepository.find({
      where: {
        username: Like(`%${username}%`),
      },
    });
  }
}
