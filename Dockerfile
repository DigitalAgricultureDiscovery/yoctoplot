# base image
FROM node:10.15.3-alpine

# set working directory
WORKDIR /app/

# working directory
COPY package*.json ./
COPY yarn*.lock ./
RUN yarn install
COPY . ./

CMD [ "yarn", "start" ]
