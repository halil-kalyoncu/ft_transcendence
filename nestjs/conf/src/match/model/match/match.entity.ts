import { UserEntity } from '../../../user/model/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum MatchState {
  Queue = 'queue',
  Invited = 'invited',
  Accepted = 'accepted',
  OnGoing = 'onGoing',
  Finished = 'finished',
}

export enum MatchType {
  Ranked = 'ranked',
  Custom = 'custom',
}

export enum MatchWinner {
  LeftPlayer = 'leftPlayer',
  RightPlayer = 'rightPlayer',
}

@Entity()
export class MatchEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity)
  leftPlayer: UserEntity;

  @ManyToOne(() => UserEntity)
  rightPlayer: UserEntity;

  @Column({ type: 'enum', enum: MatchState, default: MatchState.Invited })
  state: MatchState;

  @Column({ type: 'enum', enum: MatchType, default: MatchType.Custom })
  type: MatchType;

  @Column({ type: 'enum', enum: MatchWinner, default: MatchWinner.LeftPlayer })
  winner: MatchWinner;
}
