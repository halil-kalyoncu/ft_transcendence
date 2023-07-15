import { UserI } from '../../../user/model/user.interface';

export interface FriendshipEntryI {
  id: number;
  friend: UserI;
  isOnline?: boolean;
}
