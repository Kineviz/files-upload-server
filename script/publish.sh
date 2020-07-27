#!/bin/bash

export PATH=$PATH:/usr/local/bin

USAGE="Usage: $0 {release} \n
e.g. \n
release: build docker release image >>> push docker to pravite server \n 
"

CURRENTPATH=$(dirname "$0")
PROJECTPATH=$(cd "$CURRENTPATH"; cd ./.. ; pwd)
SHELLNAME=$(echo "$0" | awk -F "/" '{print $NF}' | awk -F "." '{print $1}')

#support in -s 
if [ -L "$0" ] ; then 
SHELLPATH=$(echo $(ls -l "$CURRENTPATH"  | grep "$SHELLNAME") | awk  -F "->" '{print $NF}') 
#SHELLNAME=$(echo $SHELLPATH | awk -F "/" '{print $NF}')
PROJECTPATH=$(cd "$(echo ${SHELLPATH%/*})/"; cd ./.. ; pwd)
fi
 
PORJECTNAME="files-upload-server" #default use files-upload-server
DOCKERHOST="registry.cn-hangzhou.aliyuncs.com/code4demo"

if [ -z "$2" ]; then
    echo "Default docker registry host : $DOCKERHOST "
else
DOCKERHOST=$2
    echo "Read the docker registry host : $DOCKERHOST "
fi

docker_build(){
    version="$1"
    cd "${PROJECTPATH}"
    if [ ! -f "${PROJECTPATH}/Dockerfile" ]; then 
    echo "Can't found Dockerfile file"
    exit 1
    else 
        docker build -f ./Dockerfile  -t "${PORJECTNAME}:${version}" ./ 
    fi
}

docker_push(){
    version="$1"
    echo "will push docker image ${PORJECTNAME}:${version} to ${DOCKERHOST}"
    docker tag  "${PORJECTNAME}:${version}" "${DOCKERHOST}/${PORJECTNAME}:${version}"
    docker push "${DOCKERHOST}/${PORJECTNAME}:${version}"
}

 

run() {

  case "$1" in
     release)
     docker_build latest
     docker_push latest
        ;;
    *)
        echo "$USAGE"
     ;;
esac

exit 0;

}

if [ -z "$1" ]; then
    echo "$USAGE"
    exit 0
fi

run "$1"