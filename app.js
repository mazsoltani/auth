const express = require('express');
const logger = require('morgan');

const mongoose = require('mongoose');
const config = require('./config/config.json');
mongoose.connect(config.dbURL).catch(err => {
    console.error("Could Not Connect to the Database !!!");
    console.error('App starting error:', err.stack);
    process.exit(1);
});
const adminUser = require('./scripts/adminUser');

const indexRouter = require('./src/routes/index');
const userRouter = require('./src/routes/users');
const validateRouter = require('./src/routes/validate');

const rm = require('./src/static/response_messages.json');
const sn = require('./src/static/names.json');

const LoggedIn = require('./src/models/loggedIn');
const jwt = require('./src/jwt/jwtService');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth/v1/', indexRouter);



tokenResponse = (token, res , next) => {
  LoggedIn.getRecordByToken(token, (err, record) => {
      if (err) {
          return next(err);
      }
      if (!record) {
          return res.status(rm.notLoggedIn.code).json(rm.notLoggedIn.msg);
      }
      if (!validateToken(token)) {
          return res.status(rm.sessionInvalid.code).json(rm.sessionInvalid.msg);
      }
  });
}

const validateToken = (token) => { // checks if the jwt has expired
  const verifyOptions = {
      issuer: jwt.fumServerIssuer
      , audience: jwt.fumClientIssuer
  };

  const legit = jwt.verify(token, verifyOptions);
  currentTime = new Date().getTime() / 1000 | 0;

  if (currentTime > legit.iat && currentTime < legit.exp)
      return true;
  return false;
}



// middleware responsible for checking if token exists (in needed routes)
// routers that do not require token should be declared before this middleware
app.use((req, res, next) => {
  let authRequired = false;

  // check if the request is excluded from checking
  config.AuthenticationList.forEach(({method, url}) => {
    if(method === req.method && url === req.path){
      if(req.headers.authorization){
        const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer
        tokenResponse(token, res, next);
      }
      else{
        authRequired = true;
      }
    }
  });

  if(authRequired){
    return res.status(rm.noCredentials.code).json(rm.noCredentials.msg);
  }
  next();
});

app.use('/auth/v1/validate', validateRouter);
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

// Create admin user if not already created
adminUser.create();

module.exports = app;
