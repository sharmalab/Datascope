FROM node:9-alpine
MAINTAINER Ryan Birmingham "rbirmin@emory.edu"

RUN mkdir -p /var/www/Datascope
COPY . /var/www/Datascope
WORKDIR /var/www/Datascope

#odbc@1.4.1 requires node-gyp requires python
RUN apk add --update \
    python \
    python-dev \
    build-base \
    git \
    bash

RUN npm install -g webpack
RUN npm install -g forever

# TODO copy user specified instead

RUN cp -r examples/TitanicSurvivors/* .

RUN npm run-script build

EXPOSE 3001:3001

CMD node app.js
