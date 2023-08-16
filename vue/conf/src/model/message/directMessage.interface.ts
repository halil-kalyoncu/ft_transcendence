import type { MessageI } from './message.interface'
import type { UserI } from '../user.interface'

export interface directMessageI {
  id?: number
  message: MessageI
  sender: UserI
  receiver: UserI
}
