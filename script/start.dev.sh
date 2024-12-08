#!/bin/bash
# run this script to start development server

# 실행 중인 컨테이너 먼저 확인
if [ -n "$(docker ps -q --filter ancestor=vue-app)" ]; then
    echo "Removing running containers..."
    docker rm -f "$(docker ps -q --filter ancestor=vue-app)"

# 컨테이너가 실행 중이 아니라면
else
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
docker build -t vue-app .

# $1 첫번째 인자로 포트를 받아온다.
PORT="${1:-5173}"

# 개발 서버 실행
docker run -d -p "${PORT}":80 --name vue-app-dev-container vue-app

echo "Development server started at http://localhost:${PORT}"
