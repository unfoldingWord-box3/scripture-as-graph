const express = require('express');
const router = express.Router();
const createError = require('http-errors');
require = require('esm')(module /* , options */);
const fse = require('fs-extra');

router.get('/:langId/:transId/:bookId', function(req, res, next) {
  // HUGE INJECTION VULNERABILITY HERE!!!
  const usfmPath = `../../../sag_usfm/${req.params.langId}/${req.params.transId}/${req.params.bookId.toLowerCase()}.usfm`;
  const usfm = fse.readFileSync(usfmPath);
  res.set('Content-Type', 'text/plain');
  res.send(usfm);
});

router.use(function(req, res, next) {
  next(createError(404, "Doc"));
});

module.exports = router;
