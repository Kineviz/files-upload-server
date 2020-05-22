FROM node:12-alpine

LABEL maintainer="Sean <sean@kineviz.com>"

#app directory
WORKDIR /data

# Install  files-upload-server
RUN npm install files-upload-server -g

RUN mkdir -p /data
VOLUME /data

EXPOSE 8008

#For Release 
ENV NODE_ENV=production

CMD ["sh","-c","cd /data && files-upload-server -s"]