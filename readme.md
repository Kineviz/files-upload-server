 
## file-server: a command-line file server  

 refer <https://github.com/nodeapps/file-server>
 
### Installing globally:

Installation via `npm`:

     npm install file-server -g

This will install `file-server` globally so that it may be run from the command line.


### Usage:

     file-server [path] [options]

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
>Upload API <http://localhost:8008/api/upload>  
>Upload API (For custom dir) <http://localhost:8008/api/upload?pathName=YourCustomPath>  
>Upload examples <http://localhost:8008/examples>


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
