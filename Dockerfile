# Stage 1: Build Angular App
FROM node:18.19.0-alpine AS builder

WORKDIR /app

# Install dependencies
COPY Dcube.Quoestionnaire.Ui/package*.json ./Dcube.Quoestionnaire.Ui/
RUN cd Dcube.Quoestionnaire.Ui && npm install

# Build the Angular app
COPY Dcube.Quoestionnaire.Ui ./Dcube.Quoestionnaire.Ui
RUN cd Dcube.Quoestionnaire.Ui && npm run build

# Stage 2: Serve using NGINX
FROM nginx:alpine

# Remove default NGINX config
RUN rm /etc/nginx/conf.d/default.conf

# Add custom NGINX config to use PORT env
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder stage
COPY --from=builder /app/Dcube.Quoestionnaire.Ui/dist/qst /usr/share/nginx/html

# Expose Cloud Run's expected port
EXPOSE 8080

# Use dumb-init to pass environment variables to nginx (optional but safe)
CMD ["nginx", "-g", "daemon off;"]
