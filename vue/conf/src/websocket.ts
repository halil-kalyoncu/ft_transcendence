import { io, Socket } from 'socket.io-client'

let chatSocket: Socket | null = null
let gameSocket: Socket | null = null

export function connectChatSocket(accessToken: string): Socket {
  if (!chatSocket) {
    chatSocket = io("http://localhost:3000", {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      },
      path: '/chat'
    })
  }
  return chatSocket
}

export function disconnectChatSocket(): void {
  if (chatSocket) {
    chatSocket.disconnect()
    chatSocket = null
  }
}

//lazy data parameter!
export function connectGameSocket(data: any): Socket {
  if (!gameSocket) {
    const queryData = {
      userId: data.userId.toString(),
      matchId: data.matchId.toString()
    }
    console.log(queryData);
    gameSocket = io("http://localhost:3000", {
      query: queryData,
      path: '/game'
    })
  }
  return gameSocket
}

export function disconnectGameSocket(): void {
  if (gameSocket) {
    gameSocket.disconnect()
    gameSocket = null
  }
}
