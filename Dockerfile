FROM node:18.19.0-alpine AS builder
WORKDIR /app
COPY Dcube.Quoestionnaire.Ui/package*.json ./
RUN npm install
COPY Dcube.Quoestionnaire.Ui/ ./
RUN nmp run build
FROM FROM nginx:alpine
COPY --from=builder /app/dist/qst /usr/share/nginx/html
EXPOSE 8080
