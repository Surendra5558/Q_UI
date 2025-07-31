FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependencies
COPY Dcube.Quoestionnaire.Ui/package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY Dcube.Quoestionnaire.Ui/ ./

# Expose port (Cloud Run expects this)
EXPOSE 80

# Start the app
CMD ["npm", "start"]
