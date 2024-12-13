#!/bin/bash
# run this script to start development server

# build and run container
docker build \
      --platform linux/amd64,linux/arm64 \
      --tag marotik/lecture_management_vue_app .

# push to docker hub
docker push marotik/lecture_management_vue_app
