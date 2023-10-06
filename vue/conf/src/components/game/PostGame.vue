<template>
  <div class="field">
    <div
	v-if="matchResult!.state == 'WINNERLEFT' || matchResult!.state == 'DISCONNECTRIGHT'" class="winner" >
	<div v-if="matchResult!.state == 'DISCONNECTRIGHT'">
		<div class="headline">{{ matchResult!.leftUser!.username }} has won by disconnect!</div>
	</div>
	<div v-else class="headline">{{ matchResult!.leftUser!.username }} has won!</div>
      <div class="trophys">
        <div class="trophyA" :style="{ backgroundImage: `url(${image[0]})` }"></div>
        <div class="trophyB" :style="{ backgroundImage: `url(${image[1]})` }"></div>
      </div>
    </div>
    <div
    v-else-if="matchResult!.state == 'WINNERRIGHT' || matchResult!.state == 'DISCONNECTLEFT'" class="winner" >
	  <div v-if="matchResult!.state == 'DISCONNECTLEFT'">
		<div class="headline">{{ matchResult!.leftUser!.username }} has won by disconnect!</div>
	  </div>
      <div v-else class="headline">{{ matchResult!.rightUser!.username }} has won!</div>
      <div class="trophys">
        <div class="trophyA" :style="{ backgroundImage: `url(${image[1]})` }"></div>
        <div class="trophyB" :style="{ backgroundImage: `url(${image[0]})` }"></div>
      </div>
    </div>
    <div class="players">
      <div class="player">
        <span>{{ matchResult!.leftUser!.username }}</span>
        <span v-if="matchResult?.type === 'LADDER'" class="ladderLevel">
          {{ leftPlayerLadder }}
          <span v-if="leftPlayerDelta > 0" class="greenFont">(+{{ leftPlayerDelta }})</span>
          <span v-else class="redFont">({{ leftPlayerDelta }})</span>
        </span>
      </div>
      <div class="player">
        <span>{{ matchResult!.rightUser!.username }}</span>
        <span v-if="matchResult?.type === 'LADDER'" class="ladderLevel">
          {{ rightPlayerLadder }}
          <span v-if="rightPlayerDelta > 0" class="greenFont">(+{{ rightPlayerDelta }})</span>
          <span v-else class="redFont">({{ rightPlayerDelta }})</span>
        </span>
      </div>
    </div>
    <div class="score">
      {{ matchResult!.goalsLeftPlayer + ' : ' + matchResult!.goalsRightPlayer }}
    </div>
  </div>
</template>

<script setup lang="ts">
import Trophy from '../../assets/trophy.png'
import SadFace from '../../assets/sad_face.png'
import type { MatchI } from '../../model/match/match.interface'
import { onMounted, ref } from 'vue'

let image = [Trophy, SadFace]

const ladderGame = ref<boolean>(false)
const leftPlayerLadder = ref<number>(0)
const leftPlayerDelta = ref<number>(0)
const rightPlayerLadder = ref<number>(0)
const rightPlayerDelta = ref<number>(0)

const props = defineProps({
  matchResult: {
    type: Object as () => MatchI | null,
    required: true
  }
})

const setLadderLevel = async (playerId: number) => {
  try {
    const response = await fetch(
      `http://${import.meta.env.VITE_IPADDRESS}:${
        import.meta.env.VITE_BACKENDPORT
      }/api/users/find-by-id?id=${playerId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ponggame') ?? ''}`
        }
      }
    )

    const responseData = await response.json()
    console.log('setLadderLevel')
    console.log(props.matchResult!)
    if (response.ok) {
      if (playerId === props.matchResult?.leftUserId) {
        leftPlayerLadder.value = responseData.ladderLevel
        leftPlayerDelta.value = leftPlayerLadder.value - props.matchResult?.leftUser?.ladderLevel!
      } else {
        rightPlayerLadder.value = responseData.ladderLevel
        rightPlayerDelta.value =
          rightPlayerLadder.value - props.matchResult?.rightUser?.ladderLevel!
      }
    }
  } catch (error) {
    return
  }
}

onMounted(() => {
  if (props.matchResult?.type === 'LADDER') {
    ladderGame.value = true
    setLadderLevel(props.matchResult?.leftUserId!)
    setLadderLevel(props.matchResult?.rightUserId!)
  }
})
</script>

<style scoped>
.field {
  width: 800px;
  height: 600px;
}
.winner {
  width: 100%;
  height: 50%;
}
.headline {
  width: 100%;
  height: 100px;
  display: flex;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  font-size: 50px;
}
.trophys {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 70%;
}

.trophyA,
.trophyB {
  width: 20%;
  height: 70%;
  background-position: center;
  background-size: cover;
  margin: 0 15%;
}

.players {
  display: flex;
  width: 100%;
}
.player {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 50px;
}
.ladderLevel {
  font-size: 25px;
}
.score {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
}
.greenFont {
  color: green;
}

.redFont {
  color: red;
}
</style>
