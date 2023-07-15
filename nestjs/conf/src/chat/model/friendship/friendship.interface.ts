import { UserI } from '../../../user/model/user.interface';
import { FriendshipStatus } from './friendship.entity';

export interface FriendshipI {
  id?: number;
  sender?: UserI;
  receiver?: UserI;
  status?: FriendshipStatus;
}
