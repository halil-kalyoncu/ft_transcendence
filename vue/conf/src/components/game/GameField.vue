<template>
  <div class="field" ref="gameField">
    <div class="left-border"></div>
    <div class="right-border"></div>
    <GameBall ref="ball" />
    <GamePaddle ref="paddleA" />
    <GamePaddle ref="paddleB" />
    <div v-if="countdown === -1" class="waiting"><p>Waiting for opponent...</p></div>
    <div v-else-if="countdown > 0" class="countdown">
      <p>{{ countdown }}</p>
    </div>
    <PowerUp
      v-for="powerup in PowerUps"
      :id="powerup.id"
      :x="powerup.x"
      :y="powerup.y"
      :type="powerup.type"
      :color="powerup.color"
      :index="powerup.index"
    />
  </div>
  <!-- <div class="ball-coordinates" v-if="ballCoordinates">
			Ball Position: x = {{ ballCoordinates.x }}, y = {{ ballCoordinates.y }}
		</div> -->
  <!-- <form @submit.prevent="connectToWS">
			<input type="text" v-model="serverIp" placeholder="Enter Server IP"/>
			<button type="submit">Connect</button>
		</form> -->
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import type { GamePaddleSetup } from './GamePaddle.vue'
import GamePaddle from './GamePaddle.vue'
import GameBall from './GameBall.vue'
import PowerUp from './PowerUp.vue'
import { Socket } from 'socket.io-client'
import jwtDecode from 'jwt-decode'
import type { UserI } from '../../model/user.interface'
import { connectChatSocket, connectGameSocket, disconnectGameSocket } from '../../websocket'
import { useRoute, useRouter } from 'vue-router'
import { useNotificationStore } from '../../stores/notification'
import type { MatchI } from '../../model/match/match.interface'

const accessToken = localStorage.getItem('ponggame') ?? ''
const notificationStore = useNotificationStore()
const route = useRoute()
const matchId = route.params.matchId as string
const router = useRouter()

const gameField = ref<HTMLElement | null>(null)
const hitCount = ref<number>(0)
let isMovingUp = ref<boolean>(false)
let isMovingDown = ref<boolean>(false)
const isPaused = ref<boolean>(false)
// let mouseX = ref<number | null>(null);
// let mouseY = ref<number | null>(null);
const fieldWidth = ref<number | null>(null)
const fieldHeight = ref<number | null>(null)
const socket = ref<Socket | null>(null)
const serverIp = ref<string | null>(null)
const side = ref<string | null>(null)
const ballCoordinates = ref<{ x: number; y: number } | null>(null)
const PowerUps = ref<any[]>([])
const paddleA = ref<GamePaddleSetup | null>(null)
const paddleB = ref<GamePaddleSetup | null>(null)
const ball = ref<typeof GameBall | null>(null)

let keyState: { [key: string]: boolean } = { ArrowUp: false, ArrowDown: false }

const chatSocket = ref<Socket | null>(null)

const countdown = ref<number>(-1)

const getUserFromAccessToken = () => {
  const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
  return decodedToken.user as UserI
}

const keyHookDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'p':
      isPaused.value = !isPaused.value
      break
    case 'ArrowUp':
      isMovingUp.value = true
      break
    case 'ArrowDown':
      isMovingDown.value = true
      break
  }
}

const keyHookUp = (e: KeyboardEvent) => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, true)
    return
  }

  switch (e.code) {
    case 'ArrowUp':
      isMovingUp.value = false
      break
    case 'ArrowDown':
      isMovingDown.value = false
      break
    case 'KeyN':
      // spawnPowerUp();
      socket.value.emit('activatePowerUp', { type: 'magnet', player: 'left' })
      // socket.value.emit('activatePowerUp', { type: "increasePaddleHeight", player: "right" })
      break
    case 'Space':
      socket.value.emit('fire')
      break
  }
}

window.addEventListener('keydown', keyHookDown)
window.addEventListener('keyup', keyHookUp)

const initGameSocket = () => {
  const user: UserI = getUserFromAccessToken()
  socket.value = connectGameSocket({
    userId: user.id,
    matchId: matchId
  })
}

const initChatSocket = () => {
  chatSocket.value = connectChatSocket(accessToken)
}

const initGameField = () => {
  if (!gameField.value) {
    //error handling
    console.log('gameField value is not set')
    return
  }

  fieldWidth.value = gameField.value?.clientWidth || 0
  fieldHeight.value = gameField.value?.clientHeight || 0
  // console.log(fieldWidth.value);
  setTimeout(() => {
    update()
  }, 200)

  paddleA.value?.setX(1)
  if (fieldWidth.value && paddleB.value) {
    console.log('setting paddle B')
    paddleB.value.setX(fieldWidth.value - paddleB.value.getPaddleWidth() - 1)
  }

  // console.log("paddleA X: " + paddleA.value?.getPaddleX());
  // console.log("paddleB X: " + paddleA.value?.getPaddleX());
}

onMounted(() => {
  initGameSocket()
  initChatSocket()
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.on('direction', (data: any) => {
    side.value = data
    // console.log("side: ", data);
  })

  socket.value.on('paddleMove', ({ playerId, newPos }: { playerId: string; newPos: number }) => {
    if (playerId === 'left') {
      paddleA.value?.setY(newPos)
      // console.log(playerId, ": ", newPos);
    } else {
      paddleB.value?.setY(newPos)
      // console.log(playerId, ": ", newPos);
    }
  })

  socket.value.on('ballPosition', ({ x, y }: { x: number; y: number }) => {
    ball.value?.setX(x)
    ball.value?.setY(y)
    ballCoordinates.value = { x, y }
    // console.log("ball")
  })

  // socket.on("newPowerUp", ({ id, x, y, type }) => {
  socket.value.on('newPowerUp', (data: any) => {
    PowerUps.value?.push(data)
    // console.log("PU spawn remote");
  })

  socket.value.on('powerUpMove', ({ id, y }: { id: number; y: number }) => {
    let powerUp = null
    if (PowerUps.value) {
      powerUp = PowerUps.value?.find((powerup) => powerup.id === id)
      if (powerUp) powerUp.y = y
      // console.log("ID: ", powerUp.id, "Y:", y);
    }
  })

  // socket.value.on("newPaddleHeight", ({ player, hgt }: { player: string; hgt: number }) => {
  // 	// return ;
  // 	if (paddleA.value && player == "left")
  // 		paddleA.value?.setHgt(hgt);
  // 	else if (paddleB.value && player == "right")
  // 		paddleB.value?.setHgt(hgt);
  // });

  socket.value.on('destroyPowerUp', ({ id }: { id: number }) => {
    if (!socket || !socket.value) {
      notificationStore.showNotification(`Error: Connection problems`, true)
      return
    }

    let index = PowerUps.value?.findIndex((powerup) => powerup.id == id)
    if (index != -1) {
      PowerUps.value?.splice(index, 1)
      socket.value.emit('removePowerUp', id)
      console.log('PU removed')
    }
  })

  socket.value.on('gameFinished', (match: MatchI) => {
    //show post game screen
    router.push('/home')
  })

  socket.value.on('opponentDisconnect', (payload: any) => {
    //show post game screen
    router.push('/home')
  })

  socket.value.on('countdown', (payload: number) => {
    countdown.value = payload
  })

  socket.value.on('startGame', () => {
    countdown.value = 0
  })

  socket.value.on('activatePowerUp', ({ player, type }: { player: string; type: string }) => {
    let target
    console.log(player)
    if (player == 'left') target = paddleA.value
    else target = paddleB.value

    if (type == 'increasePaddleHeight') {
      target?.setHgt(400)
      socket.value?.emit('activatePowerUp', { type: type, player: player })
    }

    // console.log(player, type);
  })

  initGameField()
})

const handleFinishedMatch = () => {
  if (!chatSocket || !chatSocket.value) {
    notificationStore.showNotification('Error: Connection problem chat', false)
    return
  }
  chatSocket.value.emit('finishedMatch')
}

onBeforeUnmount(() => {
  handleFinishedMatch()
  window.removeEventListener('keydown', keyHookDown)
  window.removeEventListener('keyup', keyHookUp)
  disconnectGameSocket()
})

// watch(isMovingUp, () => {
// 	if (socket.value) {
// 		socket.value.emit('paddle', 'up');
// 	}
// });

// watch(isMovingDown, () => {
// 	if (socket.value) {
// 		socket.value.emit('paddle', 'down');
// 	}
// });

function update() {
  // console.log("UPDATE");
  if (isPaused.value) {
    requestAnimationFrame(update)
    return
  }
  // console.log(side.value);
  if (side.value && side.value == 'left') {
    // console.log("update");
    if (paddleA.value && isMovingUp.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'up')
      }
    }
    // paddleA.movePaddleDown();
    else if (paddleA.value && isMovingDown.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'down')
      }
    }
    // paddleA.movePaddleDown();
  } else if (side.value && side.value == 'right') {
    if (paddleB.value && isMovingUp.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'up')
      }
    }
    // paddleB.movePaddleDown();
    else if (paddleB.value && isMovingDown.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'down')
      }
    }
  }
  // console.log(isMovingUp.value);
  requestAnimationFrame(update)
}

function spawnPowerUp() {
  const newPowerUp = {
    id: Math.floor(Date.now()),
    x: Math.floor(Math.random() * fieldWidth.value!),
    y: -30,
    index: 0,
    type: Math.floor(Math.random() * 4),
    color: 'white',
    wid: 30,
    hgt: 30
  }
  if (newPowerUp.type == 0) {
    newPowerUp.color = 'red'
    newPowerUp.index = 0
  } else if (newPowerUp.type == 1) {
    newPowerUp.color = 'green'
    newPowerUp.index = 3
  } else if (newPowerUp.type == 2) {
    newPowerUp.color = 'blue'
    newPowerUp.index = 2
  } else if (newPowerUp.type == 3) {
    newPowerUp.color = 'white'
    newPowerUp.index = 1
  }
  socket.value?.emit('spawnPowerUp', newPowerUp)
  console.log('PU spawn local')
}
</script>

<style scoped>
.field {
  width: 800px;
  height: 600px;
  position: relative;
  background-color: transparent;
  border-radius: 0%;
  box-sizing: border-box;
  overflow: hidden;
}

.field::before,
.field::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0.5),
    rgba(255, 255, 255, 1),
    rgba(255, 255, 255, 0.5)
  );
}

.field::before {
  top: 0;
}

.field::after {
  bottom: 0;
}

.left-border,
.right-border {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-image: linear-gradient(rgba(255, 255, 255, 0.5) 33%, rgba(0, 0, 0, 0) 0%);
  background-size: 100% 10px;
}

.left-border {
  left: 0;
}

.right-border {
  right: 0;
}

.waiting {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  text-align: center;
}

.countdown {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 100px;
  text-align: center;
}
</style>
