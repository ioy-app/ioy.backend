FROM node:latest
RUN apt-get update && apt-get install -y postgresql-client zip tzdata
ENV TZ=Europe/Moscow
RUN ln -sf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && rm -rf /var/cache/apl/*
WORKDIR /app

COPY package.json .
RUN npm i
COPY . .
CMD npm run dev