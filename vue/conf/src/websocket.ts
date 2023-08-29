import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let gameSocket: Socket | null = null

export function connectWebSocket(url: string, accessToken: string): Socket {
  if (!socket) {
    socket = io(`${url}`, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      }
    })
  }
  return socket
}

export function disconnectWebSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

//lazy data parameter!
export function connectGameSocket(url: string, data: any): Socket {
  console.log('inside function')
  console.log(data);
  if (!gameSocket) {
    console.log('making connection');
    gameSocket = io(`${url}`, {
      query: {
        userId: data.userId.toString(),
        matchId: data.matchId.toString()
      }
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
