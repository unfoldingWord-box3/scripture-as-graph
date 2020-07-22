const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const docRouter = require('./routes/doc');

require = require('esm')(module /* , options */);
const config = require('../../client/react_client/src/config').default;

const app = express();

// Maybe use CORS
if (config.useCors) {
  app.use(cors());
}

// Format JSON
app.set('json spaces', 2);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use(/\/doc*/, docRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404, "Root"));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
