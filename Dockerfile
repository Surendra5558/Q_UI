FROM node:18.19.0-alpine AS builder
WORKDIR /app
COPY Dcube.Quoestionnaire.Ui/package*.json ./
RUN npm install
COPY Dcube.Quoestionnaire.Ui/ ./
RUN nmp run build
FROM nginx:alpine
COPY --from=builder /app/dist/qst /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
