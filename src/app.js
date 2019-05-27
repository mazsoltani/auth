const express = require('express');
const logger = require('morgan');

const config = require('../config/config');
const errorMessages = require('./static/errorMessages');
const mongoose = require('mongoose');
const tokenResponse = require('./utils/parseToken').tokenResponse;

// check if db has been provided in environment variables
const dbURI = (process.env.DB === undefined)? config.dbURL: process.env.DB;

mongoose.connect(dbURI, {
    useCreateIndex: true,
    useNewUrlParser: true,
}).catch(err => {
    console.error(errorMessages.databaseConnectionError, err.stack);
    process.exit(1);
});

const adminUser = require('../scripts/adminUser');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const validateRouter = require('./routes/validate');

const rm = require('./static/responseMessages');
const sn = require('./static/names');

const LoggedIn = require('./models/loggedIn');
const jwt = require('./jwt/jwtService');

const app = express();

app.use(logger('combined'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use('/auth/v1/', indexRouter);


// middleware responsible for checking if token exists (in needed routes)
// routers that do not require token should be declared before this middleware
app.use(async (req, res, next) => {
    // check if the request is included in checking
    for (let index = 0; index < config.AuthenticationList.length; index++) {
        const {
            method,
            url
        } = config.AuthenticationList[index];

        if (method === req.method && url === req.path) {
            if (!req.headers.authorization) {
                return res.status(rm.noCredentials.code).json(rm.noCredentials.msg);
            } else {
                const token = req.get(sn.authorizationName).split(' ')[1]; // Extract the token from Bearer
                if(!await tokenResponse(token, res, next)) {
                    return;
                }
                else {
                    break;
                }
            }
        }
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
app.use((err, req, res, next) => {
    console.error(err);
    // only providing error if debugging requested in header
    if(req.get(authenticationEnv) === debug) {
        return res.status(err.status || 500).send(err.stack);
    }
    return res.sendStatus(err.status || 500);
});

// Create admin user if not already created
adminUser.create();

module.exports = app;