FROM node:24.19.0-alpine3.24 AS build

COPY package*.json /

RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

FROM node:24.19.0-alpine3.24

RUN apk --no-cache add git

COPY --from=build dist/run.mjs /run.mjs

COPY package*.json /

RUN npm ci --production --ignore-scripts

COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
