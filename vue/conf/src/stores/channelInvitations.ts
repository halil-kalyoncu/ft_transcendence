import type { ChannelInvitationI } from '../model/channels/channelInvitation.interface'
import { defineStore } from 'pinia'

type ChannelInvitationsState = {
	  channelInvitations: ChannelInvitationI[]
}

export const useChannelInvitationsStore = defineStore('channelInvitations', {
	state: (): ChannelInvitationsState => ({
		channelInvitations: [],
	}),

	actions: {
		addChannelInvitation(channelInvitations: ChannelInvitationI[]) {
			this.channelInvitations.push(...channelInvitations)
		},

		removeChannelInvitationById(channelInvitationId: number) {
		 const index = this.channelInvitations.findIndex((channelInvitation) => channelInvitation.invitationId === channelInvitationId)
		 if(index !== -1) {
			 this.channelInvitations.splice(index, 1)
			 console.log('ChannelInvitation with id ' + channelInvitationId + ' removed')
		 }
		 else {
			 console.log('ChannelInvitation with id ' + channelInvitationId + ' not found')
		 }
		}
	}
})


