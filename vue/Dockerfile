FROM node:18-alpine AS development

WORKDIR /pong_game/frontend/src/app

COPY ./conf/package*.json ./

RUN npm install -y
RUN npm install -g create-vite

COPY ./conf .

RUN npm run build

EXPOSE 4200