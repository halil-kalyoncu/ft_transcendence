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
			:fieldHeight="fieldHeight"
			:socket="socket"
			/>
			<GamePaddle ref="paddleB" 
			:fieldHeight="fieldHeight"
			:socket="socket"
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

<script>
import GamePaddle from './GamePaddle.vue'
import GameBall from './GameBall.vue'
import { io } from "socket.io-client";

export default {
	name: 'App',
	components: {
		GameBall, 
		GamePaddle
	},
	mounted() {
		this.fieldWidth = this.$refs.gameField.clientWidth;
		this.fieldHeight = this.$refs.gameField.clientHeight;
		
		setTimeout(() => {this.update();}, 200);
		this.$refs.paddleA.setX(1);
		this.$refs.paddleB.setX(this.fieldWidth - this.$refs.paddleB.getPaddleWidth() - 1);
	},
	
	watch: {
		isMovingUp(newState){
			this.socket.emit('moveUp', newState);
		},
		
		isMovingDown(newState){
			this.socket.emit('moveDown', newState);
		}
		
	},
	
	data() {
		return {
			hitCount: 0,
			
			isMovingUp: false,
			isMovingDown: false,
			isPaused: false,
			
			mouseX: null,
			mouseY: null,
			fieldWidth: null,
			fieldHeight: null,
			
			socket: null,
			serverIp: null,
			
			side: null,
			
			ballCoordinates: null
		}
	},
	
	methods: {
		connectToWS() {
			if (this.socket)
				this.socket.close();
			this.socket = io(`localhost:3000`, { transports: [ 'websocket' ]});
			
			this.socket.on("connect", () => {
				console.log("Connected to Server");
				this.socket.emit("message", "Hello");
			});
			
			this.socket.on("direction", (data) => {
				this.side = data;
				console.log("side: ", data);
			});
			
			this.socket.on("paddleMove", ({ playerId, newPos }) => {
				if (playerId == 'left')
				{
					this.$refs.paddleA.setY(newPos);
					console.log(playerId, ": ", newPos);
				}
				else
				{	
					this.$refs.paddleB.setY(newPos);
					console.log(playerId, ": ", newPos);
				}
			});
			
			this.socket.on("ballPosition", ({ x, y }) => {
				this.$refs.ball.setX(x);
				this.$refs.ball.setY(y);
				this.ballCoordinates = ({x, y});
			});
		},
		
		update() {
			if (this.isPaused)
			{
				requestAnimationFrame(this.update);
				return ;
			}
			
			if (this.side && this.side == "left")
			{
				if (this.$refs.paddleA && this.isMovingUp)
				this.$refs.paddleA.movePaddleUp();
				
				else if (this.$refs.paddleA && this.isMovingDown)
				this.$refs.paddleA.movePaddleDown();
				
			}
			
			else if (this.side && this.side == "right")
			{
				if (this.$refs.paddleB && this.isMovingUp)
				this.$refs.paddleB.movePaddleUp();
				
				else if (this.$refs.paddleB && this.isMovingDown)
				this.$refs.paddleB.movePaddleDown();
			}
			
			requestAnimationFrame(this.update);
		},
		
		keyHookDown(e) {
			switch(e.key) {
				case 'p':
				this.isPaused = !this.isPaused;
				break;
				case 'ArrowUp':
				this.isMovingUp = true;
				break;
				case 'ArrowDown':
				this.isMovingDown = true;
				break;
			}
		},
		
		keyHookUp(e) {
			switch(e.key) {
				case 'ArrowUp':
				this.isMovingUp = false;
				break;
				case 'ArrowDown':
				this.isMovingDown = false;
				break;
			}
		}
	},
	
	created() {
		window.addEventListener('keydown', this.keyHookDown);
		window.addEventListener('keyup', this.keyHookUp);
	}
}
</script>

<style scoped>
.field {
	width: 100%;
	height: 92vh;
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


