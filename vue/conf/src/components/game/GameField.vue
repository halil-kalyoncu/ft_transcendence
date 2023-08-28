<template>
	<div>
		<div class="field" ref="gameField">
			<div class="left-border"></div>
			<div class="right-border"></div>
			<GameBall ref="ball"
			:fieldHeight="fieldHeight"
			:fieldWidth="fieldWidth"
			:socket="socket"
			/>
			<GamePaddle ref="paddleA" 
			:socket="socket"
			/>
			<GamePaddle ref="paddleB" 
			:socket="socket"
			/>
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
		<form @submit.prevent="connectToWS">
			<input type="text" v-model="serverIp" placeholder="Enter Server IP"/>
			<button type="submit">Connect</button>
		</form>
	</div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, onBeforeUnmount } from 'vue';
import type { GamePaddleSetup } from './GamePaddle.vue';
import GamePaddle from './GamePaddle.vue'
import GameBall from './GameBall.vue'
import PowerUp from './PowerUp.vue'
import { Socket, io } from "socket.io-client";

export default defineComponent ({
	name: 'App',
	components: {
		GameBall, 
		GamePaddle,
		PowerUp
	},
	// mounted() {
	// 	this.fieldWidth = this.$refs.gameField.clientWidth;
	// 	this.fieldHeight = this.$refs.gameField.clientHeight;
		
		
	// },
	
	// watch: {
	// 	isMovingUp(newState){
	// 		this.socket.emit('moveUp', newState);
	// 	},
		
	// 	isMovingDown(newState){
	// 		this.socket.emit('moveDown', newState);
	// 	}
		
	// },

	setup() {
		let gameField = ref<HTMLElement	| null>(null);
		let hitCount = ref<number>(0);
		let isMovingUp = ref<boolean>(false);
		let isMovingDown = ref<boolean>(false);
		let isPaused = ref<boolean>(false);
		// let mouseX = ref<number | null>(null);
		// let mouseY = ref<number | null>(null);
		let fieldWidth = ref<number | null>(null);
		let fieldHeight = ref<number | null>(null);
		let socket: Socket | null = null;
		let serverIp = ref<string | null>(null);
		let side = ref<string | null>(null);
		let ballCoordinates = ref<{ x: number; y: number } | null>(null);
		let PowerUps = ref<any[]>([]);
		let paddleA = ref<GamePaddleSetup | null>(null);
		let paddleB = ref<GamePaddleSetup | null>(null);
		let ball = ref<typeof GameBall | null>(null);

		onMounted(() => {
			if (gameField.value) {
				fieldWidth.value = gameField.value.clientWidth || 0;
				fieldHeight.value = gameField.value.clientHeight || 0;
				// console.log(fieldWidth.value);
				setTimeout(() => {update();}, 200);
				
				paddleA.value?.setX(1);
				if (fieldWidth.value && paddleB.value)
					paddleB.value.setX(fieldWidth.value - paddleB.value.getPaddleWidth() - 1);
			}
			
		}); 


		watch(isMovingUp, (newState) => {
			// console.log("newState");
			socket?.emit('moveUp', newState);
		});

		watch(isMovingDown, (newState) => {
			socket?.emit('moveDown', newState);
		});
		
		const keyHookDown = (e: KeyboardEvent) => {
			switch(e.key) {
				case 'p':
					isPaused.value = !isPaused.value;
					break;
				case 'ArrowUp':
					isMovingUp.value = true;
					break;
				case 'ArrowDown':
					isMovingDown.value = true;
					break;
			}
		};
			
		const keyHookUp = (e: KeyboardEvent) => {
			switch(e.key) {
				case 'ArrowUp':
					isMovingUp.value = false;
					break;
				case 'ArrowDown':
					isMovingDown.value = false;
					break;
				case 'n':
					spawnPowerUp();
					socket?.emit('activatePowerUp', { type: "increasePaddle", player: "left" })
					break;
			}
		};
		
		onBeforeUnmount(() => {
			window.removeEventListener('keydown', keyHookDown);
			window.removeEventListener('keyup', keyHookUp);
		});


		function connectToWS() {
			socket?.close();
			socket = io(`localhost:3000/game`, { transports: [ 'websocket' ]});
			
			socket.on("connect", () => {
				console.log("Connected to Server");
				socket?.emit("message", "Hello");
			});
			
			socket?.on("direction", (data: any) => {
				side.value = data;
				console.log("side: ", data);
			});
			
			socket?.on("paddleMove", ({ playerId, newPos }: { playerId: string; newPos: number }) => {
				if (playerId == 'left')
				{
					paddleA.value?.setY(newPos);
					// console.log(playerId, ": ", newPos);
				}
				else
				{	
					paddleB.value?.setY(newPos);
					// console.log(playerId, ": ", newPos);
				}
			});
			
			socket?.on("ballPosition", ({ x, y }: {x: number; y: number}) => {
				ball.value?.setX(x);
				ball.value?.setY(y);
				ballCoordinates.value = ({x, y});
				// console.log("ball")
			});
			
			// socket.on("newPowerUp", ({ id, x, y, type }) => {
			socket?.on("newPowerUp", (data: any) => {
				PowerUps.value?.push(data);
				// console.log("PU spawn remote");
			});
				
			socket?.on("powerUpMove", ({ id, y }: { id: number; y: number }) => {
				let powerUp = null;
				if (PowerUps.value){
					powerUp = PowerUps.value?.find(powerup => powerup.id === id);
					if (powerUp)
						powerUp.y = y;
					// console.log("ID: ", powerUp.id, "Y:", y);
				}
			});
				
			// socket?.on("newPaddleHeight", ({ player, hgt }: { player: string; hgt: number }) => {
			// 	return ;
			// 	if (paddleA.value && player == "left")
			// 		paddleA.value?.setHgt(hgt);
			// 	else if (paddleB.value && player == "right")
			// 		paddleB.value?.setHgt(hgt);	
			// });
			
			socket?.on("destroyPowerUp", ({ id }: { id: number }) => {
				let index = PowerUps.value?.findIndex(powerup => powerup.id == id);
				if (index != -1) {
					PowerUps.value?.splice(index, 1);
					socket?.emit('removePowerUp', id);
					console.log("PU removed");
				}
			});

			};

			function update() {
				// console.log("UPDATE");
				if (isPaused.value)
				{
					requestAnimationFrame(update);
					return ;
				}
				// console.log(side.value);
				if (side.value && side.value == "left")
				{
					// console.log("update");
					if (paddleA.value && isMovingUp.value)
						paddleA.value.movePaddleUp();
					
					else if (paddleA.value && isMovingDown.value)
						paddleA.value.movePaddleDown();
					
				}
				
				else if (side.value && side.value == "right")
				{
					if (paddleB.value && isMovingUp.value)
						paddleB.value.movePaddleUp();
					
					else if (paddleB.value && isMovingDown.value)
						paddleB.value.movePaddleDown();
				}
				
				requestAnimationFrame(update);
			};

			function spawnPowerUp() {
				;
				// const newPowerUp = {
				// 	id: Math.floor(Date.now()),
				// 	x: Math.floor(Math.random() * fieldWidth.value),
				// 	y: -30,
				// 	type: Math.floor(Math.random() * 4),
				// 	color: "white",
				// 	wid: 30,
				// 	hgt: 30
				// };
				// if (newPowerUp.type == 0){
				// 	newPowerUp.color = "red";
				// 	newPowerUp.index = 0;
				// }
				// else if (newPowerUp.type == 1){
				// 	newPowerUp.color = "green";
				// 	newPowerUp.index = 3;
				// }
				// else if (newPowerUp.type == 2){
				// 	newPowerUp.color = "blue";
				// 	newPowerUp.index = 2;
				// }
				// else if (newPowerUp.type == 3){
				// 	newPowerUp.color = "white";
				// 	newPowerUp.index = 1;
				// }
				// socket?.emit('spawnPowerUp', newPowerUp);
				// console.log("PU spawn local");
			}
		
		window.addEventListener('keydown', keyHookDown);
		window.addEventListener('keyup', keyHookUp);

		return {
			gameField,
			hitCount,
			isMovingUp,
			isMovingDown,
			isPaused,
			fieldWidth,
			fieldHeight,
			socket,
			serverIp,
			side,
			ballCoordinates,
			connectToWS,
			ball,
			paddleA,
			paddleB,
			PowerUps
		};
	},	
	
	// methods: {
		// connectToWS() {
		// 	if (this.socket)
		// 	this.socket.close();
		// 	this.socket = io(`localhost:3000/game`, { transports: [ 'websocket' ]});
			
		// 	this.socket.on("connect", () => {
		// 		console.log("Connected to Server");
		// 		this.socket.emit("message", "Hello");
		// 	});
			
		// 	this.socket.on("direction", (data) => {
		// 		side.value = data;
		// 		console.log("side: ", data);
		// 	});
			
		// 	this.socket.on("paddleMove", ({ playerId, newPos }) => {
		// 		if (playerId == 'left')
		// 		{
		// 			paddleA.value.setY(newPos);
		// 			// console.log(playerId, ": ", newPos);
		// 		}
		// 		else
		// 		{	
		// 			paddleB.value.setY(newPos);
		// 			// console.log(playerId, ": ", newPos);
		// 		}
		// 	});
			
		// 	this.socket.on("ballPosition", ({ x, y }) => {
		// 		if (ball.value)
		// 		{
		// 			ball.value.setX(x);
		// 			ball.value.setY(y);
		// 		}
		// 		ballCoordinates.value = ({x, y});
		// 	});
			
		// 	// this.socket.on("newPowerUp", ({ id, x, y, type }) => {
		// 		this.socket.on("newPowerUp", (data) => {
		// 			this.PowerUps.push(data);
		// 			// console.log("PU spawn remote");
		// 		});
				
		// 		this.socket.on("powerUpMove", ({ id, y }) => {
		// 			let powerUp = null;
		// 			if (this.PowerUps){
		// 				powerUp = this.PowerUps.find(powerup => powerup.id === id);
		// 				if (powerUp)
		// 				powerUp.y = y;
		// 				// console.log("ID: ", powerUp.id, "Y:", y);
		// 			}
		// 		});
				
		// 		this.socket.on("newPaddleHeight", ({ player, hgt }) => {
		// 			if (paddleA.value && player == "left")
		// 			paddleA.value.setHgt(hgt);
		// 			else if (paddleB.value && player == "right")
		// 			paddleB.value.setHgt(hgt);	
		// 		});
				
		// 		this.socket.on("destroyPowerUp", ({ id }) => {
		// 			let index = this.PowerUps.findIndex(powerup => powerup.id == id);
		// 			if (index != -1) {
		// 				this.PowerUps.splice(index, 1);
		// 				this.socket.emit('removePowerUp', id);
		// 				// console.log("PU removed");
		// 			}
		// 		});
		// 	},
			
			
			
			
			
		// 	spawnPowerUp() {
		// 		const newPowerUp = {
		// 			id: Math.floor(Date.now()),
		// 			x: Math.floor(Math.random() * this.fieldWidth),
		// 			y: -30,
		// 			type: Math.floor(Math.random() * 4),
		// 			color: "white",
		// 			wid: 30,
		// 			hgt: 30
		// 		};
		// 		if (newPowerUp.type == 0){
		// 			newPowerUp.color = "red";
		// 			newPowerUp.index = 0;
		// 		}
		// 		else if (newPowerUp.type == 1){
		// 			newPowerUp.color = "green";
		// 			newPowerUp.index = 3;
		// 		}
		// 		else if (newPowerUp.type == 2){
		// 			newPowerUp.color = "blue";
		// 			newPowerUp.index = 2;
		// 		}
		// 		else if (newPowerUp.type == 3){
		// 			newPowerUp.color = "white";
		// 			newPowerUp.index = 1;
		// 		}
		// 		this.socket.emit('spawnPowerUp', newPowerUp);
		// 		console.log("PU spawn local");
		// 	}
		// },
		
		// created() {
		// 	window.addEventListener('keydown', this.keyHookDown);
		// 	window.addEventListener('keyup', this.keyHookUp);
		// }
	});
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

.field::before, .field::after {
	content: "";
	position: absolute;
	left: 0;
	right: 0;
	height: 2px;
	background: linear-gradient(to right, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0.5));
}

.field::before {
	top: 0;
}

.field::after {
	bottom: 0;
}

.left-border, .right-border {
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
</style>


