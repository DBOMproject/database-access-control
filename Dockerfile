FROM node:12-alpine
RUN apk --no-cache add curl
RUN apk add --update docker openrc
RUN rc-update add docker boot

# Create app directory
WORKDIR /app/db-accesscontrol/

# Install app dependencies
COPY package*.json ./

RUN npm ci

# Copy app
COPY . .

EXPOSE 4000
CMD [ "node", "app.js" ]