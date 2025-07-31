FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on
EXPOSE 3000

# Define the command to run your application
CMD ["npm", "start"]

options:
  logging: CLOUD_LOGGING_ONLY# Use a base image (e.g., official Node.js image)
