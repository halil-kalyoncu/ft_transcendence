FROM debian:buster AS development

RUN apt update && apt install -y \
	curl \
	&& rm -rf /var/lib/apt/lists/*

RUN	curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
	&& apt-get install -y nodejs

RUN npm install -g npm@9.7.2

WORKDIR /pong_game/frontend/src/app

COPY ./conf/package*.json ./

RUN npm install -y
RUN npm install -g @angular/cli

COPY ./conf .

RUN npm run build

EXPOSE 4200