"use strict";

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');

var app = express();

// New call to compress content
app.use(compression());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());

var oneDay = 86400000;

app.use(express.static(path.join(__dirname, 'public'), { maxAge: oneDay }));
app.use(express.static(path.join(__dirname, 'bower_components'), { maxAge: oneDay }));

// Database setup
//var databaseUrl = 'portfolioSiteDB';
// default to a 'localhost' configuration:
var connection_string = '127.0.0.1:27017/portfolioSiteDB';
// if OPENSHIFT env variables are present, use the available connection info:
if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +
        process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +
        process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
        process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +
        process.env.OPENSHIFT_APP_NAME;
}
var collections = ['projects', 'projectInfo'];
var db = require("mongojs").connect(connection_string, collections);
console.log("Got the DB connection");

// Mailer setup
var nodemailer = require('nodemailer');
// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'conorsloansite@gmail.com',
        pass: 'passwd01'
    }
});


// JSON API
var JSONStream = require('JSONStream');
var jsonStreamResponse = require('./routes/jsonStreamResponse')(JSONStream);
var api = require('./routes/api')(jsonStreamResponse, db, transporter);

// Projects
app.get('/api/projectinfo', api.projectInfo);
app.get('/api/projects', api.projects);
app.get('/api/project/:projectName', api.project);

// Mailer
app.all('/api/contact/sendMessage', api.sendMessage);

// Site Content
app.get('/api/about', api.aboutMe);

// CV
app.get('/api/cv/jobs', api.employmentHistory);
app.get('/api/cv/tech', api.techExperience);
app.get('/api/cv/atAGlanceContent', api.atAGlanceContent);

/// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
