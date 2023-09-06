import { io } from 'socket.io-client';

async function createSocket(username: string) {
  const response = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error('Failed to login');
  }

  const { access_token } = await response.json();
  const socket = io('http://localhost:3000', {
    transportOptions: {
      polling: {
        extraHeaders: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    },
  });

  socket.on('connect', () => {
    console.log('Connected to socket.io server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket.io server');
  });

  socket.on('friends', () => {});
  return socket;
}

async function startSocketConnection() {
  try {
    const socket_hkalyonc = createSocket('hkalyonc');
    const socket_mschlenz = createSocket('mschlenz');
  } catch (error) {
    console.error('Error: ', error.message);
  }
}

startSocketConnection();
