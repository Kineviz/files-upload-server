'use strict';
const fs = require("fs");
const path = require('path');
const os = require('os');

const cors = require('cors');
const compression = require('compression');
const express = require('express');

const serveIndex = require('serve-index');
const colors = require('colors/safe');

const api = require('./api');

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
        log: console.log,
    }) {
    options = Object.assign({}, defaultOptions, options);

    let uploadPath = path.join(process.cwd(), options.path);
    if (!fs.existsSync(uploadPath)) {
        uploadPath = path.join(process.cwd(), './');
    }
    logger.info(colors.cyan(`Use the path ${uploadPath} as root uplaod dir`))

    let app = express();
    app.disable('x-powered-by');
    app.set('trust proxy', 1) // trust first proxy
    app.set('port', options.port) // trust first proxy

    app.set('uploadPath',uploadPath);
    app.set('logger',logger);

    app.use(compression());
    if (options.cors) {
        app.use(cors());
    }

    app.use(function(req, res, next){
        res.setHeader('Feature-Policy', '*');
        // res.setHeader('Sec-Fetch-Site', 'none');
        next();
    })

    app.use('/favicon.ico', express.static(path.join(__dirname, './../favicon.ico')));

    app.use(function (req, res, next) {
        logger.log(
            '[%s] "%s %s" "%s"',
            new Date(), colors.cyan(req.method), colors.cyan(req.url),
            req.headers['user-agent']
        );
        next();
    })

    app.use('/api',api);

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
        app.set('serverAddress',serverAddress);
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
                        logger.info(colors.green(`\t${protocol}://${details.address}:${options.port}`));
                    }
                });
            });
        }


        logger.info([
            '',
            `\tUpload Files List       : ${colors.green(serverAddress)}`,
            `\tUpload Files List (JSON): ${colors.green(serverAddress + "/api/list")}`,
            `\tUpload API              : ${colors.green(serverAddress + "/api/upload")}`,
            `\tUpload Examples         : ${colors.green(serverAddress + '/examples')}`,
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