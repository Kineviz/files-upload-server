#!/bin/bash

docker image prune -a --force --filter "until=240h" 
docker system prune --volumes --force
PROJECTNAME='fileServer'
IMAGENAME="files-upload-server"
CURRENTPATH=$(dirname "$0")
PROJECTPATH=$(cd "$CURRENTPATH"; cd ./.. ; pwd)
#DOCKERHOST="registry.us-west-1.aliyuncs.com/code4demo"
DOCKERHOST="registry.cn-hangzhou.aliyuncs.com/code4demo"
if [ -z "$1" ]; then
    echo "Default docker registry host : $DOCKERHOST \n\n"
else
DOCKERHOST=$1
    echo "Read the docker registry host : $DOCKERHOST \n\n"
fi

docker pull ${DOCKERHOST}/${IMAGENAME}

docker stop ${PROJECTNAME} 
docker rm ${PROJECTNAME} 

docker run -d -it --name ${PROJECTNAME}  --restart always  \
-v ${HOME}/projects/fileServer:/data:rw \
-p 8008:8008 \
-e VIRTUAL_HOST=${PROJECTNAME}.4api.xyz \
-e VIRTUAL_PORT=8008 \
-e "LETSENCRYPT_HOST=${PROJECTNAME}.4api.xyz" \
-e "LETSENCRYPT_EMAIL=sean@kineviz.com" \
${DOCKERHOST}/${IMAGENAME}

echo "Please access ${PROJECTNAME}.4api.xyz"