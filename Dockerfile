FROM node:9-alpine
MAINTAINER Ryan Birmingham "rbirmin@emory.edu"

WORKDIR /var/www/Datascope

RUN apk add --update \
    python \
    python-dev \
    build-base \
    git \
    bash

RUN npm install -g webpack@3
RUN npm install -g forever

# copy user data, images, and config

RUN mkdir -p /var/www/Datascope
COPY . /var/www/Datascope

ADD ./config /var/www/Datascope
ADD ./data /var/www/Datascope
ADD ./images /var/www/Datascope

RUN npm run-script build

EXPOSE 3001:3001

CMD forever app.js
