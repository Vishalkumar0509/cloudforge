# frontend/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json /app/
RUN npm install

# Copy the rest of the application files
COPY . /app/

# Build the React app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Serve the built files
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
