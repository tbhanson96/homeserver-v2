FROM bitnami/minideb:latest
ARG NODE_VERSION

RUN apt-get update && apt-get install -y xdg-utils wget xz-utils python-is-python3 curl libegl1 libopengl0 libxcb-cursor0 
RUN wget --no-check-certificate -nv -O- https://download.calibre-ebook.com/linux-installer.sh | sh /dev/stdin

RUN set -uex; \
    apt-get update; \
    apt-get install -y ca-certificates curl gnupg; \
    mkdir -p /etc/apt/keyrings; \
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
     | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg; \
    NODE_MAJOR=${NODE_VERSION}; \
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" \
     > /etc/apt/sources.list.d/nodesource.list; \
    apt-get -qy update; \
    apt-get -qy install nodejs;

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
RUN npm install --production
WORKDIR ..
COPY server/dist ./server
COPY server/src/config/config.prod.json ./server/config/config.default.json
COPY client/dist ./client
COPY mock ./mnt
COPY package.json .

CMD [ "npm", "run", "start" ]