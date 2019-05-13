FROM node:10.15.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install

COPY index.js /usr/src/app
COPY email.ejs /usr/src/app
COPY config.json /usr/src/app

CMD [ "node", "index.js" ]