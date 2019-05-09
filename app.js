const express = require('express');
const logger = require('morgan');

const mongoose = require('mongoose');
const config = require('./config/config.json');
mongoose.connect(config.dbURL);
const adminUser = require('./scripts/adminUser');

const indexRouter = require('./src/routes/index');
const userRouter = require('./src/routes/users');

const rm = require('./src/static/response_messages.json');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth/v1/', indexRouter);

// middleware responsible for checking if token exists (in needed routes)
// routers that do not require token should be declared before this middleware
app.use(function(req, res, next){
  let authRequired = false;

  // check if the request is excluded from checking
  config.AuthenticationList.forEach(({method, url}) => {
    if(method === req.method && url === req.path && !req.headers.authorization){
      authRequired = true;
    }
  });

  if (authRequired){
    return res.status(rm.noCredentials.code).json(rm.noCredentials.msg);
  }
  next();
});

app.use('/auth/v1/user', userRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.sendStatus(404);
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.sendStatus(err.status || 500);
});

// Create admin user if not already created!
adminUser.create();

module.exports = app;
