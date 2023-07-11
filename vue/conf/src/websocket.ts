import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

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
