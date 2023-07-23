export const ChannelVisibility = {
  PUBLIC: 'PUBLIC' as const,
  PROTECTED: 'PROTECTED' as const,
  PRIVATE: 'PRIVATE' as const
}

export type ChannelVisibilityType = (typeof ChannelVisibility)[keyof typeof ChannelVisibility]

export interface CreateChannelDto {
  userId: number
  name: string
  password?: string
  channelVisibility: ChannelVisibilityType
}
