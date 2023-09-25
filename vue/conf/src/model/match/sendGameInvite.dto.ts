export interface SendGameInviteDto {
  matchId: number
  invitedUsername: string
  goalsToWin: number
  powerupNames: string[]
}
