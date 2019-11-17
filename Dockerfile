FROM node:12-alpine

WORKDIR /app
COPY package.json .

RUN apk --no-cache --update add tzdata \
  && npm install 

COPY . .

EXPOSE 3000