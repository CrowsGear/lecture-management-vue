#!/bin/bash
# run this script to start development server

# 실행 중인 컨테이너 먼저 확인
if [ -n "$(docker ps -q --filter ancestor=vue-app)" ]; then
    # 실행 중인 컨테이너가 있는 경우
    echo "Removing running containers..."
    docker rm -f "$(docker ps -q --filter ancestor=vue-app)"
else
    # 실행 중인 컨테이너가 없는 경우
    echo "No running containers found. Checking stopped containers..."
    stopped_containers=$(docker ps -a -q --filter "status=exited" --filter ancestor=vue-app)
    if [ -n "$stopped_containers" ]; then
        echo "Removing stopped containers..."
        docker rm "${stopped_containers}"
    else
        echo "No containers with image 'vue-app' found."
    fi
fi


# build and run container
# $1 첫번째 인자로 포트를 받아온다.
docker build -t vue-app .
docker run -d -p ${1}:80 --name vue-app-dev-container vue-app
