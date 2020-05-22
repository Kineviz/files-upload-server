 
## file-server: a command-line file server  

 refer <https://github.com/nodeapps/file-server>
 
### Installing globally:

Installation via `npm`:

```
npm install files-upload-server -g
```
This will install `file-server` globally so that it may be run from the command line.


### Usage:

```
files-upload-server [path] [options]
```

or 

```
file-server [path] [options]
```

`[path]` defaults to `./upload` if the folder exists, and `./` otherwise.

*Now you can visit http://localhost:8008 to view your server*

 
### Available Options:

`-p` or `--port` Port to use (defaults to 8008)

`-a` Address to use (defaults to 0.0.0.0)

`-s` or `--silent` Suppress log messages from output  

`-S` or `--ssl` Enable https.

`-C` or `--cert` Path to ssl cert file (default: `cert.pem`).

`-K` or `--key` Path to ssl key file (default: `key.pem`).

`-h` or `--help` Print this list and exit.

### Paths
>Access the upload files <http://localhost:8008>  
>upload files (JSON) <http://localhost:8008/api/upload>  
>Upload API (For custom dir) <http://localhost:8008/api/upload?pathName=YourCustomPath>  
>Upload examples <http://localhost:8008/examples>

## Docker 

```
docker pull kineviz/files-upload-server

docker stop fileServer 
docker rm fileServer

docker run -d -it --name fileServer --restart always  \
-v ${HOME}/projects/fileServer:/data:rw \
-p 8008:8008 \
-e VIRTUAL_HOST=fileServer.4api.xyz \
-e VIRTUAL_PORT=8008 \
-e "LETSENCRYPT_HOST=fileServer.4api.xyz" \
-e "LETSENCRYPT_EMAIL=sean@kineviz.com" \
kineviz/files-upload-server
```

## Development
###Install dependencies

```
 yarn 
```

### Run as develop Server

```
yarn dev
```

### Test command

```
yarn command-test
```

### publish to npmjs.org

```
yarn release
```