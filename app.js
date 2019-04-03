const fs = require("fs");
const http = require("http");
const path = require('path');
const cors = require('cors');
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const serveIndex = require('serve-index');

let app = express();
let Port = parseInt(process.env.PORT) || 8008
app.set('port', Port);

//config compression and corss domain
app.use(compression());
app.use(cors());

app.use('/api/upload',
    // bodyParser.json({ limit: "10mb" }),
    // bodyParser.urlencoded({ extended: false, limit: "10mb" }),
    multer().any(),
    function (req, res) {

        let files = [];

        if (req.file) {
            files.push(req.file);
        } else if (req.files && req.files.length > 0) {
            files = req.files;
        } else {
            return res.send({
                status: 1,
                message: "Can't got the file's buffer",
            })
        }

        let leaveFilesCount = files.length;
        let resList = [];
        let handlerUpload = function (err, name) {
            leaveFilesCount--;
            resList.push({
                name: name,
                err: err ? err.message : null
            });
            if (leaveFilesCount == 0) {
                let isSuccess = resList.filter(item => item.err);
                return res.send({
                    status: isSuccess ? 0 : 1,
                    message: isSuccess ? "Upload Success" : "Uplaod failed",
                    content: resList
                })
            }

        }

        files.forEach(file => {
            fs.writeFile(path.join(__dirname, './upload', file.originalname), file.buffer, 'binary', (err) => {
                handlerUpload(err,file.originalname);
            });
        })

    });


app.use('/', express.static(path.join(__dirname, './upload')))
app.use('/', serveIndex(path.join(__dirname, './upload')))

app.use(function (req, res, next) {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {

    if (req._parsedUrl && (/\.map$/ig).test(req._parsedUrl.pathname)) {
        console.error(err.message)
    } else {
        console.error(err);
    }

});

let server = http.createServer(app).listen(Port);
server.on('listening', function () {
    console.log(`
            The Server run on http://localhost:${Port}
            Upload API http://localhost:${Port}/api/upload
            Jquery Ajax Upload Example http://localhost:8008/example.jquery.html
            `)
});

server.on('error', function (err) {
    console.error(err);
    process.exit(1);
})