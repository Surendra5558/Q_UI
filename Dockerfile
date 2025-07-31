# Stage 1: Build
FROM node:18.19.0-alpine AS builder
WORKDIR /app
COPY Dcube.Quoestionnaire.Ui/package*.json ./Dcube.Quoestionnaire.Ui/
RUN cd Dcube.Quoestionnaire.Ui && npm install
COPY Dcube.Quoestionnaire.Ui ./Dcube.Quoestionnaire.Ui
RUN cd Dcube.Quoestionnaire.Ui && npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

ENV PORT=8080

COPY nginx.template.conf /etc/nginx/templates/default.conf.template
COPY --from=builder /app/Dcube.Quoestionnaire.Ui/dist/qst /usr/share/nginx/html

EXPOSE 8080

# Fixed CMD
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"
