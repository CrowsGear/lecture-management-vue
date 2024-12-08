# Build
FROM node:18.20.5 as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install --global yarn@1.22.22
RUN yarn install
COPY . .
RUN yarn build

# Production
FROM nginx:1.21.3 as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
