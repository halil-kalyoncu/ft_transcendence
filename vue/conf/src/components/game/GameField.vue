<template>
  <div v-if="!authorized">You are not authorized to enter this match</div>
  <div v-else-if="!matchResult">
    <PlayerView
      ref="playerview"
      :playerA="playerAName"
      :playerB="playerBName"
      :playerAScore="playerAScore"
      :playerBScore="playerBScore"
      :goalsToBeat="goalsToBeat"
    />
    <div class="field" ref="gameField">
      <div class="left-border"></div>
      <div class="right-border"></div>
      <div v-if="countdown === -1" class="waiting">
        <p>Waiting for opponent... {{ formattedTimer }}</p>
      </div>
      <div v-else-if="countdown > 0" class="countdown" ref="cancelTimer">
        <p>{{ countdown }}</p>
      </div>
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
  </div>
  <div v-else>
    <PostGame :matchResult="matchResult" />
  </div>
  <div class="leave-game">
    <button @click="goHome" class="leave-game-button">Leave Game</button>
  </div>
  <div class="controls-legend">
    <span class="control-item">
      Move Up&nbsp;<font-awesome-icon class="spacebar-icon" :icon="['fas', 'fa-arrow-up']" />&nbsp;
    </span>
    <span class="control-item">
      Move Down&nbsp;<font-awesome-icon class="spacebar-icon" :icon="['fas', 'fa-arrow-down']" />
    </span>
    <span class="control-item">
      Release Magnet&nbsp;
      <div class="spacebar-icon">SPACE</div>
    </span>
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
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowUp, faArrowDown, faMagnet } from '@fortawesome/free-solid-svg-icons'
import { useNotificationStore } from '../../stores/notification'
import type { MatchI } from '../../model/match/match.interface'

library.add(faArrowUp, faArrowDown, faMagnet)
const accessToken = localStorage.getItem('ponggame') ?? ''
const notificationStore = useNotificationStore()
const route = useRoute()
const matchId = route.params.matchId as string
const router = useRouter()

const gameField = ref<HTMLElement | null>(null)
let isMovingUp = ref<boolean>(false)
let isMovingDown = ref<boolean>(false)
const isPaused = ref<boolean>(false)

const fieldWidth = ref<number | null>(null)
const fieldHeight = ref<number | null>(null)
const socket = ref<Socket | null>(null)
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
let goalsToBeat = ref<number>(0)

const chatSocket = ref<Socket | null>(null)

const countdown = ref<number>(-1)

let timerId: number = 0
const waitingTime = ref<number>(0)
const maxWaitingTime = 1 * 60

const matchResult = ref<MatchI | null>(null)
const authorized = ref<boolean>(true)

const getUserFromAccessToken = () => {
  const decodedToken: Record<string, unknown> = jwtDecode(accessToken)
  return decodedToken.user as UserI
}

const keyHookDown = (e: KeyboardEvent) => {
  switch (e.code) {
    case 'p':
      isPaused.value = !isPaused.value
      break
    case 'KeyW':
    case 'ArrowUp':
      isMovingUp.value = true
      break
    case 'KeyS':
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
    case 'KeyW':
    case 'ArrowUp':
      isMovingUp.value = false
      break
    case 'KeyS':
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
  socket.value = connectGameSocket({
    accessToken: localStorage.getItem('ponggame') ?? '',
    matchId: matchId
  })
}

const initChatSocket = () => {
  chatSocket.value = connectChatSocket(accessToken)
}

const initGameField = async () => {
  if (!gameField.value) {
    return
  }

  fieldWidth.value = gameField.value?.clientWidth || 0
  fieldHeight.value = gameField.value?.clientHeight || 0

  await getMatchData()
  if (!authorized.value || matchResult.value) {
    return
  }

  if (
    !playerAName ||
    playerAName.value === '' ||
    !playerBName ||
    playerBName.value === '' ||
    !goalsToBeat ||
    goalsToBeat.value === 0
  ) {
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
  }, 1000) as unknown as number
}

const cancelTimer = () => {
  if (timerId) {
    clearInterval(timerId)
    timerId = 0
  }
}

const setEventListeners = () => {
  if (!socket || !socket.value) {
    notificationStore.showNotification(`Error: Connection problems`, false)
    return
  }

  socket.value.on('paddleMove', ({ playerId, newPos }: { playerId: string; newPos: number }) => {
    if (playerId === 'left') {
      paddleA.value?.setY(newPos)
    } else {
      paddleB.value?.setY(newPos)
    }
  })

  socket.value.on('ballPosition', ({ x, y }: { x: number; y: number }) => {
    ball.value?.setX(x)
    ball.value?.setY(y)
    ballCoordinates.value = { x, y }
  })

  socket.value.on('newPowerUp', (PowerUp: { powerUp: string; x: number; y: number }) => {
    const newPowerUp = {
      id: Math.floor(Date.now()),
      x: PowerUp.x,
      y: PowerUp.y,
      type: 'null',
      index: 0,
      color: 'white',
      wid: 70,
      hgt: 70
    }
    if (PowerUp.powerUp == 'increasePaddleHeight') {
      newPowerUp.color = 'white'
      newPowerUp.index = 0
      newPowerUp.type = PowerUp.powerUp
    } else if (PowerUp.powerUp == 'decreasePaddleHeight') {
      newPowerUp.color = 'red'
      newPowerUp.index = 1
      newPowerUp.type = PowerUp.powerUp
    } else if (PowerUp.powerUp == 'magnet') {
      newPowerUp.color = 'green'
      newPowerUp.index = 2
      newPowerUp.type = PowerUp.powerUp
    } else if (PowerUp.powerUp == 'slowBall') {
      newPowerUp.color = 'blue'
      newPowerUp.index = 3
      newPowerUp.type = PowerUp.powerUp
    } else if (PowerUp.powerUp == 'fastBall') {
      newPowerUp.color = 'yellow'
      newPowerUp.index = 4
      newPowerUp.type = PowerUp.powerUp
    }

    socket.value?.emit('spawnPowerUp', newPowerUp)
    PowerUps.value?.push(newPowerUp)
  })

  socket.value.on('powerUpMove', ({ id, y }: { id: number; y: number }) => {
    let powerUp = null
    if (PowerUps.value) {
      powerUp = PowerUps.value?.find((powerup) => powerup.id === id)
      if (powerUp) powerUp.y = y
    }
  })

  socket.value.on('destroyPowerUp', ({ id }: { id: number }) => {
    if (!socket || !socket.value) {
      notificationStore.showNotification(`Error: Connection problems`, true)
      return
    }

    let index = PowerUps.value?.findIndex((powerup) => powerup.id == id)
    if (index != -1) {
      PowerUps.value?.splice(index, 1)
      //   socket.value.emit('removePowerUp', id)
    }
  })

  socket.value.on('gameFinished', (match: MatchI) => {
    cancelTimer()
    matchResult.value = match
  })

  socket.value.on('countdown', (payload: number) => {
    countdown.value = payload
    cancelTimer()
  })

  socket.value.on('startGame', () => {
    countdown.value = 0
  })

  socket.value.on('activatePowerUp', ({ player, type }: { player: string; type: string }) => {
    let target
    if (player == 'left') target = paddleA.value
    else target = paddleB.value

    if (type == 'increasePaddleHeight') {
      target?.increaseHgt()
    }
    if (type == 'decreasePaddleHeight') {
      target?.decreaseHgt()
    }
    if (type == 'slowBall') {
      if (ball.value!.speed < 3) {
        ball.value!.speed = 1
      }
      ball.value!.speed -= 2
    }
    if (type == 'fastBall') {
      ball.value!.speed += 2
    }

    if (side.value! == 'left') {
      socket.value?.emit('executePowerUp', { type: type, player: player })
    }
  })

  socket.value.on('scoreGoal', (payload: string) => {
    if (payload == 'playerA') playerAScore.value++
    else playerBScore.value++
  })

  socket.value.on('resetPaddle', () => {
    paddleA.value?.resetHgt()
    paddleB.value?.resetHgt()
  })
}

onMounted(async () => {
  await initGameField()

  if (!authorized.value || matchResult.value) {
    return
  }
  initGameSocket()
  initChatSocket()
  startTimer()
  setEventListeners()
})

const handleFinishedMatch = () => {
  if (!chatSocket || !chatSocket.value) {
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

function update() {
  if (isPaused.value) {
    requestAnimationFrame(update)
    return
  }
  if (side.value && side.value == 'left') {
    if (paddleA.value && isMovingUp.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'up')
      }
    } else if (paddleA.value && isMovingDown.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'down')
      }
    }
  } else if (side.value && side.value == 'right') {
    if (paddleB.value && isMovingUp.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'up')
      }
    } else if (paddleB.value && isMovingDown.value) {
      if (socket.value) {
        socket.value.emit('paddle', 'down')
      }
    }
  }
  requestAnimationFrame(update)
}

async function getMatchData(): Promise<void> {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/matches/find-by-id?id=${matchId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    if (response.ok) {
      const responseText = await response.text()
      const matchData: MatchI | null = responseText ? JSON.parse(responseText) : null
      const loggedUser: UserI = getUserFromAccessToken()

      if (!matchData) {
        authorized.value = false
        return
      }
      if (loggedUser.id !== matchData.leftUserId && loggedUser.id !== matchData.rightUserId) {
        authorized.value = false
        return
      }

      if (
        matchData.state === 'CREATED' ||
        matchData.state === 'INVITED' ||
        matchData.state === 'ACCEPTED'
      ) {
        authorized.value = false
        return
      } else if (matchData.state !== 'STARTED') {
        matchResult.value = matchData
        return
      }

      playerAName.value = matchData.leftUser?.username as string
      playerBName.value = matchData.rightUser?.username as string
      goalsToBeat.value = matchData.goalsToWin as number
    } else {
      const responseData = await response.json()
      notificationStore.showNotification(
        'Error while fetching the match data' + responseData.message,
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
.leave-game-button {
  /* width: 800px; */
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
}

.leave-game-button:hover {
  background-color: #0056b3;
}

.controls-legend {
  display: flex;
  width: fit-content;
  justify-content: space-between;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1); /* Slightly transparent background */
  padding: 10px;
  border-radius: 8px;
  margin: 1rem auto 0;
  align-items: center;
}

.control-item {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.5); /* Semi-transparent white text */
  margin: 0 10px;
}

.control-item .legend-icon {
  margin-right: 5px;
}

.spacebar-icon {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.5);
  margin-right: 5px;
}
</style>
