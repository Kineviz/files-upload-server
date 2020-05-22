const express = require('express');
const upload = require('./upload');
const list = require('./list');

const router = express.Router();

router.use('/upload', upload);
router.use('/list', list);

module.exports = router;
