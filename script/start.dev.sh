#!/bin/bash
# run this script to start development server

# stop and remove all containers with ancestor vue-app
docker rm -f $(docker ps -q --filter ancestor=vue-app)


# build and run container
# $1 첫번째 인자로 포트를 받아온다.
docker build -t vue-app .
docker run -d -p ${1}:80 --name vue-app-dev-container vue-app
