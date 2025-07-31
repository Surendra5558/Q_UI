# Stage 1: Build
FROM node:18.19.0-alpine AS builder
 
WORKDIR /app
COPY Dcube.Quoestionnaire.Ui/package*.json ./Dcube.Quoestionnaire.Ui/
RUN cd Dcube.Quoestionnaire.Ui && npm install
COPY Dcube.Quoestionnaire.Ui ./Dcube.Quoestionnaire.Ui
RUN cd Dcube.Quoestionnaire.Ui && npm run build
 
# Stage 2: Serve with NGINX
FROM nginx:alpine
 
# Copy build output to NGINX HTML folder
COPY --from=builder /app/Dcube.Quoestionnaire.Ui/dist/qst /usr/share/nginx/html
 
# Expose port (optional)
EXPOSE 80
 
# Start nginx (default CMD from base image is fine)
