FROM node:18-bookworm
ARG NODE_VERSION

RUN apt-get update && apt-get install -y xdg-utils wget xz-utils python-is-python3 curl libegl1 libopengl0 libxcb-cursor0 libxkbcommon-x11-0
RUN wget --no-check-certificate -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin

ENV OAUTH_ID=oauth_id
ENV OAUTH_SECRET=oauth_secret
ENV OAUTH_REFRESH_TOKEN=oauth_refresh_token
ENV PORT=3000

RUN mkdir -p /opt/app
WORKDIR /opt/app
# Remove later
RUN mkdir updates

WORKDIR server
COPY server/package.json ./
RUN npm install --omit=dev
WORKDIR ..
COPY server/dist ./server
COPY server/src/config/config.prod.json ./server/config/config.json
COPY client/dist ./client
COPY mock ./mnt
COPY package.json .

CMD [ "npm", "run", "start" ]