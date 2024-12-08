#!/bin/bash
# run this script to start development server

# stop and remove all containers with ancestor vue-app
docker rm -f $(docker ps -q --filter ancestor=vue-app)


# build and run container
docker build -t vue-app .
docker run -d -p 5173:80 --name vue-app-dev-container vue-app
