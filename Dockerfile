FROM node:9-alpine
MAINTAINER Ryan Birmingham "rbirmin@emory.edu"

RUN mkdir -p /var/www/Datascope
COPY . /var/www/Datascope

WORKDIR /var/www/Datascope

RUN apk add --update \
    python \
    python-dev \
    build-base \
    git \
    bash

RUN npm install -g webpack
RUN npm install -g forever
RUN npm install -g nodemon

# copy user data and config

ADD ./config /var/www/Datascope
ADD ./data /var/www/Datascope

RUN npm run-script build

EXPOSE 3001:3001

CMD nodemon app.js -w config -w data
