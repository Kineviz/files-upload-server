const fs = require("fs");
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const colors = require('colors/safe');

const router = express.Router();
router.use(
  bodyParser.json(),
  bodyParser.urlencoded({
    extended: true
  }),
  multer().any(),
)
router.use(function (req, res, next) {

  const uploadPath = req.app.get('uploadPath');
  const logger = req.app.get('logger');

  logger.log([
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
      logger.log(resJSON.message);
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
    logger.log(resJSON.message);
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
      logger.log(!err ? colors.green(`Upload to ${fileName} Success`) : colors.red(`Upload to ${fileName} Failed`));
    });
  })
})

module.exports = router;
