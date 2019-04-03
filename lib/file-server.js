'use strict';
const fs = require("fs");
const path = require('path');
const os = require('os');

const cors = require('cors');
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const serveIndex = require('serve-index');
const colors = require('colors/safe');

const ifaces = os.networkInterfaces();

const defaultOptions = {
    port: 8008,
    hostname: '0.0.0.0',
    autoIndex: true,
    path: '/upload',
    https: {
        ca: null,
        cert: null,
        key: null,
    },
    cors: true,
}

module.exports.createServer = function (
    options = Object.assign({}, defaultOptions),
    logger = {
        info: console.log,
        request: (req, res, next) => next()
    }) {
    options = Object.assign({}, defaultOptions, options);

    let uploadPath = path.join(process.cwd(), options.path);
    if (!fs.existsSync(uploadPath)) {
        uploadPath = path.join(process.cwd(), './');
    }
    logger.info(colors.cyan(`Use the path ${uploadPath} as root uplaod dir`))

    let app = express();
    app.use(compression());
    if (options.cors) {
        app.use(cors());
    }

    app.use('/favicon.ico', express.static(path.join(__dirname, './../favicon.ico')));

    app.use(function (req, res, next) {
        logger.info(
            '[%s] "%s %s" "%s"',
            new Date(), colors.cyan(req.method), colors.cyan(req.url),
            req.headers['user-agent']
        );
        next();
    })

    app.use('/api/upload',
        bodyParser.json(),
        bodyParser.urlencoded({
            extended: true
        }),
        multer().any(),
        function (req, res) {

            logger.info([
                    `\tquery.pathName : ${req.query.pathName}`,
                    `\tbody.pathName  : ${req.body.pathName}`,
                    `\tparams.pathName: ${req.params.pathName}`
                ].join('\n')
            );

            let pathName = req.query.pathName || req.body.pathName || req.params.pathName || '.';
            let currentUploadPath = path.join(uploadPath, pathName);
            if (!fs.existsSync(currentUploadPath)) {
                try {
                    fs.mkdirSync(currentUploadPath);
                } catch (error) {
                    let resJSON = {
                        status: "failed",
                        message: `Can't create the path : ${pathName}`,
                    };
                    logger.info(resJSON.message);
                    return res.send(resJSON)
                }
            }


            let files = [];

            if (req.file) {
                files.push(req.file);
            } else if (req.files && req.files.length > 0) {
                files = req.files;
            } else {
                let resJSON = {
                    status: "failed",
                    message: "Can't got the file's buffer, please sure the formData key is file or files",
                }
                logger.info(resJSON.message);
                return res.send(resJSON)
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
                    let isSuccess = resList.filter(item => !item.err).length == resList.length;
                    return res.send({
                        status: isSuccess ? 'success' : 'fail',
                        message: isSuccess ? "Upload Success" : "Uplaod failed",
                        content: resList
                    })
                }
            }

            files.forEach(file => {
                let fileName = path.join(pathName, file.originalname);
                fs.writeFile(path.join(uploadPath, fileName), file.buffer, 'binary', (err) => {
                    handlerUpload(err, fileName);
                    logger.info(!err ? colors.green(`Upload to ${fileName} Success`) : colors.red(`Upload to ${fileName} Failed`));
                });
            })

        });

    let examplePath = path.join(__dirname, './../examples');
    app.use('/examples', express.static(examplePath));
    app.use('/examples', serveIndex(examplePath));

    app.use('/', express.static(uploadPath, { index: false }));
    app.use('/', serveIndex(uploadPath));

    app.use(function (req, res, next) {
        let err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handler
    app.use(function (err, req, res, next) {
        if (err) {
            logger.info(
                '[%s] "%s %s" Error (%s): "%s"',
                new Date(), colors.red(req.method), colors.red(req.url),
                colors.red(err.status.toString()), colors.red(err.message)
            );
        }
    });

    // start server
    let webServer = null;
    let isHttps = false;
    if (options.https &&
        options.https.cert && options.https.key) {
        let https = require('https');
        let httpsOptions = {
            key: fs.readFileSync(options.https.key),
            cert: fs.readFileSync(options.https.cert)
        };
        if (options.https.ca) {
            httpsOptions.ca = fs.readFileSync(options.https.ca);
        }

        webServer = https.createServer(httpsOptions, app);
        isHttps = true;

    } else {
        let http = require('http');
        webServer = http.createServer(app);
    }

    webServer.listen(options.port, options.hostname);

    webServer.on('listening', function () {

        let protocol = isHttps ? 'https' : 'http';
        let serverAddress = `${protocol}://${options.hostname !== '0.0.0.0' ? options.hostname : 'localhost'}:${options.port}`;

        logger.info([colors.yellow('Starting up http-server, serving '),
        colors.cyan(options.path),
        isHttps ? (colors.yellow(' through') + colors.cyan(' https')) : '',
        colors.yellow('\nAvailable on:')
        ].join(''));

        if (options.hostname !== '0.0.0.0') {
            logger.info(colors.green(serverAddress));
        } else {
            Object.keys(ifaces).forEach(function (dev) {
                ifaces[dev].forEach(function (details) {
                    if (details.family === 'IPv4') {
                        logger.info(colors.green(`\t\t${protocol}://${details.address}:${options.port}`));
                    }
                });
            });
        }


        logger.info([
            '',
            `\t\tUpload Files List : ${colors.green(serverAddress)}`,
            `\t\tUpload API        : ${colors.green(serverAddress + "/api/upload")}`,
            `\t\tUpload Examples   : ${colors.green(serverAddress + '/examples')}`,
            '',
        ].join('\n')
        )

        logger.info('Hit CTRL-C to stop the server \n');

    });

    webServer.on('error', function (err) {
        logger.info(colors.red(err));
        process.exit(1);
    })

    return webServer;

}