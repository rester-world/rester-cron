FROM node:latest
MAINTAINER Woong-Gi Jeon<jeon.wbbi@gmail.com>

RUN mkdir -p /var/rester-cron/src
RUN mkdir -p /var/rester-cron/cfg

ADD ./src/ /var/rester-cron/src/
WORKDIR /var/rester-cron/src

RUN npm install request node-cron node-watch ini
RUN npm install forever -g
VOLUME ["/var/rester-cron/cfg"]

CMD forever /var/rester-cron/src/cron.js