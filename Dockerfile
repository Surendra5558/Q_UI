# Stage 1: Build Angular App
FROM node:18.19.0-alpine AS builder

WORKDIR /app

# Install dependencies
COPY Dcube.Quoestionnaire.Ui/package*.json ./Dcube.Quoestionnaire.Ui/
RUN cd Dcube.Quoestionnaire.Ui && npm install

# Copy source files and build app
COPY Dcube.Quoestionnaire.Ui ./Dcube.Quoestionnaire.Ui
RUN cd Dcube.Quoestionnaire.Ui && npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default nginx site config
RUN rm /etc/nginx/conf.d/default.conf

# ⚠️ Copy your custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ⚠️ Copy built Angular files from correct path
COPY --from=builder /app/Dcube.Quoestionnaire.Ui/dist/qst /usr/share/nginx/html

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
