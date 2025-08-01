# Stage 1: Build Angular App
FROM node:18.19.0-alpine AS builder

WORKDIR /app

# Install deps
COPY Dcube.Quoestionnaire.Ui/package*.json ./Dcube.Quoestionnaire.Ui/
RUN cd Dcube.Quoestionnaire.Ui && npm install

# Copy and build app
COPY Dcube.Quoestionnaire.Ui ./Dcube.Quoestionnaire.Ui
RUN cd Dcube.Quoestionnaire.Ui && npm run build

# Stage 2: Serve using NGINX
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# ⚠️ Copy our custom config that listens on 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Angular dist output
COPY --from=builder /app/Dcube.Quoestionnaire.Ui/dist/qst /usr/share/nginx/html

# Inform Cloud Run this listens on 8080
EXPOSE 8080

# Run NGINX
CMD ["nginx", "-g", "daemon off;"]
