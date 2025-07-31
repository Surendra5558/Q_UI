FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose the port your application listens on
EXPOSE 8080

# Define the command to run your application
CMD ["npm", "start"]
