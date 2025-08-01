# Stage 1: Build Angular app
FROM node:18.19.0-alpine AS builder

WORKDIR /app
COPY Dcube.Quoestionnaire.Ui/package*.json ./Dcube.Quoestionnaire.Ui/
RUN cd Dcube.Quoestionnaire.Ui && npm install

COPY Dcube.Quoestionnaire.Ui ./Dcube.Quoestionnaire.Ui
RUN cd Dcube.Quoestionnaire.Ui && npm run build

# Stage 2: Run Express Server
FROM node:18.19.0-alpine

WORKDIR /app

# Install only prod dependencies
COPY Dcube.Quoestionnaire.Ui/package*.json ./
RUN npm install --omit=dev

# Copy Angular build output and server code
COPY --from=builder /app/Dcube.Quoestionnaire.Ui/dist/qst ./dist
COPY Dcube.Quoestionnaire.Ui/server.js ./server.js  # or server.ts if you're compiling it

# Environment variable from Cloud Run
ENV PORT 8080

EXPOSE 8080

CMD ["node", "server.js"]
