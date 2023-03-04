FROM node:16.14.0

# Create app directory
# WORKDIR /usr/src/app

# Bundle app source
COPY . .

RUN npm install 
# If you are building your code for production
# RUN npm install --only=production

EXPOSE 3066

CMD [ "npm","start" ]