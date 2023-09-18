<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProfileGeneralInfo from './ProfileGeneralInfo.vue'
import ProfileAchievementItem from './ProfileAchievementItem.vue'
import ProfileMatchHistoryItem from './ProfileMatchHistoryItem.vue'
import ScrollViewer from '../utils/ScrollViewer.vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.params.userId as string
const username = route.params.username as string

// let userId = ref<number>(0)

// const props = defineProps<{
//   username: string;
// }>();

const achievements = ref([
  { type: 1, title: 'First Achievement', description: 'This is the first achievement' },
  { type: 6, title: 'Last Achievement', description: 'This is the last achievement' },
  { type: 2, title: 'Second Achievement', description: 'This is the second achievement' },
  { type: 2, title: 'Second Achievement', description: 'This is the second achievement' },
  { type: 2, title: 'Second Achievement', description: 'This is the second achievement' },
  { type: 2, title: 'Second Achievement', description: 'This is the second achievement' },
]);

// const matchHistory = ref([
//   { score: '5 : 3', victory: true, opponentName: 'Opponent 1', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-2.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   { score: '1 : 5', victory: false, opponentName: 'Opponent 2', dateTime: '2023/07/16 11:11', playerAvatar: '../src/assets/avatar-1.png', opponentAvatar: '../src/assets/avatar-3.png' },
//   // ... (more match history items)
// ]);

interface MatchHistoryItem {
  score: string;
  victory: boolean;
  opponentName: string;
  dateTime: string;
  playerAvatar: string;
  opponentAvatar: string;
  state?: string;
  leftUserId?: number;
  rightUserId?: number;
}

const matchHistory = ref<MatchHistoryItem[]>([]);

// async function getUserId(): Promise<void> {
// 	try {
//     const response = await fetch(`http://localhost:3000/api/users/find-by-username?username=${props.username}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     })

//     if (response.ok) {
//       const matchData = await response.json()
	
// 	  userId.value = matchData[0].id;
// 	//   console.log("matchData:", matchData)
//     }
// 	// console.log("ID Val:", userId.value)
//   }
//   catch (error) {
//     console.error("Failed to fetch match history:", error);
//   }
// }

// function getUserId() {
//   fetch(`http://localhost:3000/api/users/find-by-username?username=${props.username}`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   })
//   .then(response => {
//     if (response.ok) {
//       return response.json();
//     } else {
//       throw new Error('Failed to fetch data');
//     }
//   })
//   .then(matchData => {
//     userId.value = Number(matchData[0].id);
//     // console.log("matchData:", matchData);
//   })
//   .catch(error => {
//     console.error("Failed to fetch match history:", error);
//   });
// }


async function getMatchHistory(): Promise<void> {
  try {
    const response = await fetch(`http://localhost:3000/api/matches/find-matches-by-user?userid=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
	// console.log("RESPONSE:", userId.value)
    if (response.ok) {
		const matchData = await response.json()
		
		matchHistory.value = matchData;
    }
  }
  catch (error) {
    console.error("Failed to fetch match history:", error);
  }
}

onMounted(() => {
  getMatchHistory();
});

</script>

<template>
  <article class="profile">
    <ProfileGeneralInfo :username="username" />
    <section class="detailed-info">
      <div class="achievements">
        <h2 class="profile-title">achievements</h2>
        <ScrollViewer :maxHeight="'50vh'">
			<ProfileAchievementItem
			v-for="achievement in achievements"
			:achievementType="achievement.type"
			:achievementTitle="achievement.title"
			:achievementDescription="achievement.description"
			/>
        </ScrollViewer>
      </div>
      <div class="match-history">
        <h2 class="profile-title">match history</h2>
        <ScrollViewer :maxHeight="'50vh'">
			<ProfileMatchHistoryItem
				v-for="match in matchHistory"
				:key="match.dateTime"
				:score="match.score"
				:victory="match.victory"
				:playerName="username"
				:opponentName="match.opponentName"
				:dateTime="match.dateTime"
				:playerAvatar="match.playerAvatar"
				:opponentAvatar="match.opponentAvatar"
				:myUserId="userId"
			/>
        </ScrollViewer>
      </div>
    </section>
  </article>
</template>




<style>
.profile {
  width: 100%;
  height: calc(100vh - 50.8px);
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.detailed-info {
  flex: 2;
  display: flex;
  flex-direction: row;
}

.detailed-info .achievements {
  flex: 2;
}

.detailed-info .match-history {
  flex: 2;
}

.profile-title {
  text-transform: uppercase;
  font-size: 1rem;
  color: #ea9f42;
  font-family: 'Gill Sans', sans-serif;
  text-align: Center;
  margin: 0 0 1rem 0;
}

.achievements {
  border-right: 0.25px solid darkgray;
}

.achievements-scrollview,
.match-history-scrollview {
  overflow-y: auto;
  max-height: 50vh;
  border-radius: 10px;
  scrollbar-width: thin;
  scrollbar-color: #888 #303030;
}

.achievements-scrollview::-webkit-scrollbar,
.match-history-scrollview::-webkit-scrollbar {
  width: 8px;
}

.achievements-scrollview::-webkit-scrollbar-track,
.match-history-scrollview::-webkit-scrollbar-track {
  background-color: #303030;
  border-radius: 10px;
}

.achievements-scrollview::-webkit-scrollbar-thumb,
.match-history-scrollview::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 10px;
}
.match-history {
  padding-left: 1.5rem;
}
</style>
