<template>
  <div class="field">
    <div v-if="matchResult!.state == 'WINNERLEFT' || matchResult!.state == 'DISCONNECTRIGHT'" class="winner">
      <div class="headline">{{ matchResult!.leftUser!.username }} has won!</div>
      <div class="trophys">
        <div class="trophyA" :style="{ backgroundImage: `url(${image[0]})` }"></div>
        <div class="trophyB" :style="{ backgroundImage: `url(${image[1]})` }"></div>
      </div>
    </div>
    <div v-else-if="matchResult!.state == 'WINNERRIGHT' || matchResult!.state == 'DISCONNECTLEFT'" class="winner">
      <div class="headline">{{ matchResult!.rightUser!.username }} has won!</div>
      <div class="trophys">
        <div class="trophyA" :style="{ backgroundImage: `url(${image[1]})` }"></div>
        <div class="trophyB" :style="{ backgroundImage: `url(${image[0]})` }"></div>
      </div>
    </div>
    <div class="players">
      <div class="playerA">{{ matchResult!.leftUser!.username }}</div>
      <div class="playerB">{{ matchResult!.rightUser!.username }}</div>
    </div>
    <div class="score">{{ matchResult!.goalsLeftPlayer + ' : ' + matchResult!.goalsRightPlayer }}</div>
  </div>
</template>

<script setup lang="ts">
import Trophy from '../../assets/trophy.png'
import SadFace from '../../assets/sad_face.png'
import type { MatchI } from '../../model/match/match.interface'

let image = [Trophy, SadFace]

const props = defineProps({
  matchResult: {
    type: Object as () => MatchI | null,
    required: true
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

.playerA,
.playerB {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 50px;
}
.score {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 100px;
}
</style>
