<template>
  <div v-if="!matchResult" class="field" ref="gameField">
    <div class="left-border"></div>
    <div class="right-border"></div>
	<div v-if="countdown === -1" class="waiting">
	  <p>Waiting for opponent... {{ formattedTimer }}</p>
	</div>
	<div v-else-if="countdown > 0" class="countdown" ref="cancelTimer">
	  <p>{{ countdown }}</p>
	</div>
    <PlayerView
      ref="playerview"
      :playerA="playerAName"
      :playerB="playerBName"
      :playerAScore="playerAScore"
      :playerBScore="playerBScore"
    />
    <GameBall ref="ball" />
    <GamePaddle ref="paddleA" />
    <GamePaddle ref="paddleB" />
    <PowerUp
      v-for="powerup in PowerUps"
      :id="powerup.id"
      :x="powerup.x"
      :y="powerup.y"
      :color="powerup.color"
      :index="powerup.index"
	  :type="powerup.type"
    />
  </div>
  <div v-else>
	<PostGame
		:playerA="playerAName"
		:playerB="playerBName"
		:playerAScore="matchResult.goalsLeftPlayer!"
		:playerBScore="matchResult.goalsRightPlayer!" />
  </div>
  <div class="leave-game"> 
  	<button @click="goHome" class="leave-game-button">Leave Game</button>
  </div>
  <!-- <form @submit.prevent="connectToWS">
			<input type="text" v-model="serverIp" placeholder="Enter Server IP"/>
			<button type="submit">Connect</button>
		</form> -->
</template>

<script setup lang="ts">
import { defineComponent, ref, onMounted, watch, onBeforeUnmount, computed } from 'vue'
import type { GamePaddleSetup } from './GamePaddle.vue'
import PlayerView from './PlayerView.vue'
import PostGame from './PostGame.vue'
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
let playerAName = ref<string>('')
let playerBName = ref<string>('')
let playerAScore = ref<number>(0)
let playerBScore = ref<number>(0)

let keyState: { [key: string]: boolean } = { ArrowUp: false, ArrowDown: false }

const chatSocket = ref<Socket | null>(null)

const countdown = ref<number>(-1)

let timerId: NodeJS.Timer | null = null
const waitingTime = ref<number>(0)
const maxWaitingTime = 1 * 60

const matchResult = ref<MatchI | null>(null)

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

const initGameField = async () => {
  if (!gameField.value) {
    //error handling
    console.log('gameField value is not set')
    return
  }

  fieldWidth.value = gameField.value?.clientWidth || 0
  fieldHeight.value = gameField.value?.clientHeight || 0
  // console.log(fieldWidth.value);
  await getUserNames()
  if (!playerAName || playerAName.value === '' || !playerBName || playerBName.value === '') {
    //TODO what to do if the usernames are not set
    console.log('something went wrong fetching the usernames')
    return
  }
  setTimeout(() => {
    update()
  }, 200)

  paddleA.value?.setX(1)
  if (fieldWidth.value && paddleB.value) {
    paddleB.value.setX(fieldWidth.value - paddleB.value.getPaddleWidth() - 1)
  }

  const loggedUser: UserI = getUserFromAccessToken()
  if (playerAName.value == loggedUser.username) {
    side.value = 'left'
  } else {
    side.value = 'right'
  }
}

const formattedTimer = computed(() => {
  const minutes = Math.floor(waitingTime.value / 60)
  const seconds = waitingTime.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const startTimer = () => {
  timerId = setInterval(() => {
    waitingTime.value++
    if (waitingTime.value >= maxWaitingTime) {
      socket.value?.emit('maxWaitingTimeReached')
      notificationStore.showNotification(
        "Opponent couldn't connect to match, match is concluded and you are the winner",
        false
      )
      cancelTimer()
    }
  }, 1000)
}

const cancelTimer = () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = null
  }
}

onMounted(() => {
  initGameSocket()
  initChatSocket()
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  startTimer()

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
  socket.value.on('newPowerUp', (PowerUp: { powerUp: string, x: number, y: number}) => {
	const newPowerUp = {
    id: Math.floor(Date.now()),
    x: PowerUp.x,
    y: PowerUp.y, //Math.floor(Math.random() * ((fieldHeight.value! - 70) - 70 + 1)) + 70,
	type: 'null',
    index: 0,
    color: 'white',
    wid: 70,
    hgt: 70
  }
  console.log("power name")
  console.log(PowerUp.powerUp)
  if (PowerUp.powerUp == 'slowBall') {
    newPowerUp.color = 'red'
    newPowerUp.index = 0
	newPowerUp.type = PowerUp.powerUp
  } else if (PowerUp.powerUp == 'fastBall') {
	console.log("WORKED")
    newPowerUp.color = 'green'
    newPowerUp.index = 3
	newPowerUp.type = PowerUp.powerUp
  } else if (PowerUp.powerUp == 'decreasePaddleHeight') {
    newPowerUp.color = 'blue'
    newPowerUp.index = 2
	newPowerUp.type = PowerUp.powerUp
  } else if (PowerUp.powerUp == 'increasePaddleHeight') {
    newPowerUp.color = 'white'
    newPowerUp.index = 1
	newPowerUp.type = PowerUp.powerUp
  } else if (PowerUp.powerUp == 'magnet') {
	newPowerUp.color = 'yellow'
	newPowerUp.index = 4
	newPowerUp.type = PowerUp.powerUp
  }
  
  socket.value?.emit('spawnPowerUp', newPowerUp)
  console.log('PU spawn local')
    PowerUps.value?.push(newPowerUp)
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
    matchResult.value = match
  })

  socket.value.on('countdown', (payload: number) => {
    countdown.value = payload
    if (timerId) {
      cancelTimer()
    }
  })

  socket.value.on('startGame', () => {
    countdown.value = 0
  })

  socket.value.on('activatePowerUp', ({ player, type }: { player: string; type: string }) => {
    let target
    // console.log(player)
	console.log("ACTIVATE POWER BEFORE")
	console.log(ball.value.speed)
	console.log(type)
    if (player == 'left') target = paddleA.value
    else target = paddleB.value

    if (type == 'increasePaddleHeight') {
      target?.setHgt(400)
    }
	if (type == 'decreasePaddleHeight'){
		target?.setHgt(80)
	}
	if (type == 'slowBall') {
		ball.value.speed = 2
	}
	if (type == 'fastBall') {
		ball.value.speed = 9
	}
	console.log("ACTIVATE POWER AFTER")
	console.log(ball.value.speed)
	socket.value?.emit('executePowerUp', { type: type, player: player })

    // console.log(player, type);
  })

  socket.value.on('scoreGoal', (payload: string) => {
    if (payload == 'playerA') playerAScore.value++
    else playerBScore.value++
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

// function spawnPowerUp() {
//   const newPowerUp = {
//     id: Math.floor(Date.now()),
//     x: Math.floor(Math.random() * fieldWidth.value!),
//     y: -30,
//     index: 0,
//     type: Math.floor(Math.random() * 4),
//     color: 'white',
//     wid: 30,
//     hgt: 30
//   }
//   if (newPowerUp.type == 0) {
//     newPowerUp.color = 'red'
//     newPowerUp.index = 0
//   } else if (newPowerUp.type == 1) {
//     newPowerUp.color = 'green'
//     newPowerUp.index = 3
//   } else if (newPowerUp.type == 2) {
//     newPowerUp.color = 'blue'
//     newPowerUp.index = 2
//   } else if (newPowerUp.type == 3) {
//     newPowerUp.color = 'white'
//     newPowerUp.index = 1
//   }
//   socket.value?.emit('spawnPowerUp', newPowerUp)
//   console.log('PU spawn local')
// }

async function getUserNames(): Promise<void> {
  try {
    const response = await fetch(`http://localhost:3000/api/matches/find-by-id?id=${matchId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const matchData = await response.json()
      playerAName = matchData.leftUser.username
      playerBName = matchData.rightUser.username
    } else {
      notificationStore.showNotification(
        'Something went wrong while fetching the match data',
        false
      )
      router.push('/home')
    }
  } catch (error) {
    notificationStore.showNotification('Something went wrong while fetching the match data', false)
    router.push('/home')
  }
}

const goHome = () => {
  router.push('/home')
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

.leave-game {
	width: 800px;
	display: flex;
	justify-content: center;
}
.leave-game-button{
  /* width: 800px; */
  background-color: #007BFF;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
}

.leave-game-button:hover{
	background-color: #0056b3;
}

</style>
