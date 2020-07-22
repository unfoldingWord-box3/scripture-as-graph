const express = require('express');
const router = express.Router();
const createError = require('http-errors');
require = require('esm')(module /* , options */);
const fse = require('fs-extra');
const config = require("../../../client/react_client/src/config").default;

router.get('/:langId/:transId/:bookId', function(req, res, next) {
  const safeLangId = req.params.langId.replace(/[^A-Za-z0-9]/, "");
  const safeTransId = req.params.transId.replace(/[^A-Za-z0-9]/, "");
  const safeBookId = req.params.bookId.replace(/[^A-Za-z0-9]/, "");
  const usfmPath = `${config.usfmRoot}/${safeLangId}/${safeTransId}/${safeBookId.toLowerCase()}.usfm`;
  const usfm = fse.readFileSync(usfmPath);
  res.set('Content-Type', 'text/plain');
  res.send(usfm);
});

router.use(function(req, res, next) {
  next(createError(404, "Doc"));
});

module.exports = router;
