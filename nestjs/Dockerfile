#################
## DEVELOPMENT ##
#################
FROM node:lts-buster AS development

WORKDIR /pong_game/src/app

COPY ./conf/package*.json ./

RUN npm install -y
RUN npm rebuild bcryptjs
COPY ./conf .

EXPOSE 3000

################
## PRODUCTION ##
################
FROM node:lts-buster AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /pong_game/src/app

COPY --from=development /pong_game/src/app/ .

EXPOSE 3000

CMD [ "node", "dist/main"]