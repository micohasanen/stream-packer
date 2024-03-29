FROM node:19

RUN apt-get update -y
RUN apt-get dist-upgrade -y

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8082
CMD [ "npm", "start" ]