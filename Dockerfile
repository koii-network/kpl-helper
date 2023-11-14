# Use an official node runtime as the parent image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN yarn install

# Copy the local src files to the container
COPY . .

# Command to run the app
CMD [ "node", "index.js" ]
