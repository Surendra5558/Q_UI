EXPOSE 8080# Stage 1: Build Angular app
FROM node:18.19.0-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY Dcube.Quoestionnaire.Ui/package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Copy compiled Angular app to NGINX web root
COPY --from=builder /app/dist/qst /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.con

EXPOSE 8080
# At runtime, replace $PORT with actual value using envsubst
CMD ["nginx", "-g", "daemon off;"]
