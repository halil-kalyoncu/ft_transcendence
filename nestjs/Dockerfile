FROM debian:buster AS development

RUN apt update && apt install -y \
	curl \
	procps \
	&& rm -rf /var/lib/apt/lists/*

RUN	curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
	&& apt-get install -y nodejs

RUN npm install -g npm@9.7.2

WORKDIR /pong_game/src/app

COPY ./conf/package*.json ./

RUN npm install -y

COPY ./conf .

EXPOSE 3000

################
## PRODUCTION ##
################
# Build another image named production
FROM debian:buster AS production

RUN apt update && apt install -y \
	curl \
	procps \
	&& rm -rf /var/lib/apt/lists/*

RUN	curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - \
	&& apt-get install -y nodejs

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN npm install -g npm@9.7.2

WORKDIR /pong_game/src/app

COPY --from=development /pong_game/src/app/ .

EXPOSE 3000

CMD [ "node", "dist/main"]