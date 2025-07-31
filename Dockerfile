# Stage 1: Build the app using Node
FROM node:18.19.0-alpine AS builder

WORKDIR /app
COPY Dcube.Quoestionnaire.Ui/package*.json ./Dcube.Quoestionnaire.Ui/
RUN cd Dcube.Quoestionnaire.Ui && npm install
COPY Dcube.Quoestionnaire.Ui ./Dcube.Quoestionnaire.Ui
RUN cd Dcube.Quoestionnaire.Ui && npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Set default port (Cloud Run will override this if needed)
ENV PORT=8080

# Copy custom NGINX config template
COPY nginx.template.conf /etc/nginx/templates/default.conf.template

# Copy build output to NGINX's public HTML directory
COPY --from=builder /app/Dcube.Quoestionnaire.Ui/dist/qst /usr/share/nginx/html

# Command: Replace $PORT in config and start NGINX
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]

# Expose the port that Cloud Run will send traffic to
EXPOSE 8080
