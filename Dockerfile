# Build
FROM node:18.20.5 AS build-stage

ARG MODE=dev

# Workdirectory 설정
WORKDIR /app

# package.json, yarn.lock 복사 및 의존성 설치
# 의존성은 yarn.lock을 기준으로 설치(yarn)
COPY package*.json yarn.lock ./

# RUN yarn install
RUN yarn install

# 소스코드 복사 및 빌드
COPY . .

# 빌드
RUN yarn build:${MODE}


# Production(nginx)
# nginx를 통해 빌드된 파일을 제공
FROM nginx:1.21.3 AS production-stage

# yarn build를 통해 빌드된 정적 파일을 nginx의 html 디렉토리로 복사
COPY --from=build-stage /app/dist /usr/share/nginx/html

# nginx 설정 파일을 복사
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

# 80포트 오픈 및 nginx 실행
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
