import { io } from 'socket.io-client'
import type { FriendshipEntryI } from './model/friendship/friendshipEntry.interface'
import type { directMessageI } from './model/message/directMessage.interface'
import type { UserI } from './model/user.interface'
import { describe, test } from 'vitest'

describe('MyComponent.vue', () => {
  test.skip('Is actual work being done in test file?', () => {})
})

async function getUserIds() {
  let userId_hkalyonc = -1
  let userId_mschlenz = -1
  let userId_elenz = -1

  const response = await fetch('http://localhost:3000/api/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to login')
  }
  const users = await response.json()

  for (const user of users) {
    if (user.username === 'hkalyonc') {
      userId_hkalyonc = user.id
    } else if (user.username === 'mschlenz') {
      userId_mschlenz = user.id
    } else if (user.username === 'elenz') {
      userId_elenz = user.id
    }
  }
  if (userId_hkalyonc === -1 || userId_mschlenz === -1 || userId_elenz === -1) {
    throw new Error('Failed to find users')
  }
  return { userId_hkalyonc, userId_mschlenz, userId_elenz }
}

async function createSocket(username: string) {
  const response = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username })
  })

  if (!response.ok) {
    throw new Error('Failed to login')
  }

  const { access_token } = await response.json()
  const socket = io('http://localhost:3000', {
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${access_token}`
        }
      }
    }
  })

  //listening on standard events
  socket.on('connect', () => {
    console.log(username + ': Connected to socket.io server\n')
  })

  socket.on('disconnect', () => {
    console.log(username + ': Disconnected from socket.io server\n')
  })

  socket.on('Error', (responseData: string) => {
    console.log(username + ': incoming event friends')
    console.log(responseData)
    console.log('\n')
  })

  return socket
}

async function getUnreadMessages(userId: number) {
  const response = await fetch(
    `http://localhost:3000/api/directMessages/allUnreadByUserId?userId=${userId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to get unread messages')
  }

  return await response.json()
}

async function startSocketConnection() {
  try {
    //client hkalyonc
    const socket_hkalyonc = await createSocket('hkalyonc')
    let friendlist_hkalyonc: FriendshipEntryI[] = []
    let friendRequests_hkalyonc: FriendshipEntryI[] = []
    let unreadDirectMessages_halyonc: directMessageI[] = []

    socket_hkalyonc.on('friends', (responseData: FriendshipEntryI[]) => {
      console.log('hkalyonc: incoming event friends')
      console.log(responseData)
      console.log('\n')
      friendlist_hkalyonc = responseData
    })

    socket_hkalyonc.on('friendRequests', (responseData: FriendshipEntryI[]) => {
      console.log('hkalyonc: incoming event friendRequests')
      console.log(responseData)
      console.log('\n')
      friendRequests_hkalyonc = responseData
    })

    socket_hkalyonc.on('newDirectMessage', (responseData: directMessageI) => {
      console.log('hkalyonc: incoming event newDirectMessage')
      console.log(responseData)
      getUnreadMessages(userId_hkalyonc).then((unreadMessages) => {
        console.log('hkalyonc: unread Messages')
        console.log(unreadMessages)
      })
      console.log('\n')
    })

    //client mschlenz
    const socket_mschlenz = await createSocket('mschlenz')
    let friendlist_mschlenz: FriendshipEntryI[] = []
    let friendRequests_mschlenz: FriendshipEntryI[] = []
    let unreadDirectMessages_mschlenz: directMessageI[] = []

    socket_mschlenz.on('friends', (responseData: FriendshipEntryI[]) => {
      console.log('mschlenz: incoming event friends')
      console.log(responseData)
      console.log('\n')
      friendlist_mschlenz = responseData
    })

    socket_mschlenz.on('friendRequests', (responseData: FriendshipEntryI[]) => {
      console.log('mschlenz: incoming event friendRequests')
      console.log(responseData)
      console.log('\n')
      friendRequests_mschlenz = responseData
      for (const entry of responseData) {
        socket_mschlenz.emit('acceptFriendRequest', entry.id)
      }
    })

    socket_mschlenz.on('newDirectMessage', (responseData: directMessageI) => {
      console.log('mschlenz: incoming event newDirectMessage')
      console.log(responseData)
      getUnreadMessages(userId_mschlenz).then((unreadMessages) => {
        console.log('mschlenz: unread Messages')
        console.log(unreadMessages)
      })
      console.log('\n')
    })

    //client elenz
    const socket_elenz = await createSocket('elenz')
    let friendlist_elenz: FriendshipEntryI[] = []
    let friendRequests_elenz: FriendshipEntryI[] = []
    let unreadDirectMessages_elenz: directMessageI[] = []

    socket_elenz.on('friends', (responseData: FriendshipEntryI[]) => {
      console.log('elenz: incoming event friends')
      console.log(responseData)
      console.log('\n')
      friendlist_elenz = responseData
    })

    socket_elenz.on('friendRequests', (responseData: FriendshipEntryI[]) => {
      console.log('elenz: incoming event friendRequests')
      console.log(responseData)
      console.log('\n')
      friendRequests_elenz = responseData
    })

    socket_mschlenz.on('newDirectMessage', (responseData: directMessageI) => {
      console.log('mschlenz: incoming event newDirectMessage')
      console.log(responseData)
      getUnreadMessages(userId_mschlenz).then((unreadMessages) => {
        console.log('mschlenz: unread Messages')
        console.log(unreadMessages)
      })
      console.log('\n')
    })

    const { userId_hkalyonc, userId_mschlenz, userId_elenz } = await getUserIds()

    //testing friendlist
    socket_hkalyonc.emit(
      'sendFriendRequest',
      'mschlenz',
      (response: FriendshipEntryI | { error: string }) => {
        if ('error' in response) {
          console.log('hkalyonc: Error sendFriendshipRequest: ' + response.error)
        } else {
          console.log('hkalyonc: Friend Request was sent to ' + response.friend.username)
        }
        console.log('\n')
      }
    )

    socket_elenz.emit(
      'sendFriendRequest',
      'mschlenz',
      (response: FriendshipEntryI | { error: string }) => {
        if ('error' in response) {
          console.log('elenz: Error sendFriendshipRequest: ' + response.error)
        } else {
          console.log('elenz: Friend Request was sent to ' + response.friend.username)
        }
        console.log('\n')
      }
    )

    //testing direct messages
    socket_hkalyonc.emit('sendDirectMessage', {
      senderId: userId_hkalyonc,
      receiverId: userId_mschlenz,
      message: '1'
    })
    socket_elenz.emit('sendDirectMessage', {
      senderId: userId_elenz,
      receiverId: userId_mschlenz,
      message: '2'
    })

    // Disconnect sockets after a short delay
    setTimeout(() => {
      socket_hkalyonc.disconnect()
      socket_mschlenz.disconnect()
      socket_elenz.disconnect()
    }, 6000)
  } catch (error) {
    console.error('Error: ', error)
    process.exit(0)
  }
}

startSocketConnection()
