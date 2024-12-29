#!/bin/bash
# run this script to start development server


# ENV MODE=dev
MODE="${1:-dev}"

# build and run container
docker build \
      --platform linux/arm64 \
      --build-arg MODE=${MODE} \
      --tag marotik/lecture_management_vue_app_${MODE} .

# push to docker hub
docker push marotik/lecture_management_vue_app_${MODE}
