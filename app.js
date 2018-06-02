require('dotenv').config()
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var view = require('./routes/view');
var api = require('./routes/api');

var app = express();

app.use(session({
	secret: process.env.SESSIONSECRET,
	cookieName:'PHPTOKEN',
    resave: false,
    saveUninitialized: true,
 	duration: 30 * 60 * 1000,
 	activeDuration: 50* 60 * 1000
}));

// View Engine Setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public/img', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.raw());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', view);
app.use('/api', api);

// Handle 404
app.use(function(req, res) {
  res.status(400);
  res.render('./partials/404', {title: '404'});
});

// Handle 500
app.use(function(error, req, res, next) {
  res.status(500);
  res.render('./partials/500', {title:'500', error: error});
});

module.exports = app;
