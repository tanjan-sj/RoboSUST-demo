var express = require('express');
var nodemailer = require("nodemailer"); //mail module
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//adding crypto
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

//added html view engine
var cons = require('consolidate');

//var LocalStrategy = require('Strategy');
var mongo = require('mongodb');
var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost//loginapp');
mongoose.connect('mongodb://localhost:27017/loginapp');
var db = mongoose.connection;﻿

//include the routes
var routes = require('./routes/index'); //create a folder called routes with index and users
var users = require('./routes/users'); //

//init app
var app = express();

//view engine
app.set('views', path.join(__dirname, 'views')); //we are telling the system that we want a folder called vews to handle our views
app.engine('handlebars', exphbs({defaultLayout:'layout'})); //we are going to set handlebars as the app.engine and also the default layout file we want to be called layout.handlebars
app.set('view engine', 'handlebars');//app.set the view engine to handlebars

// BodyParser Middleware//kinda like setup code, configurations. don't need to worry about it too much. certain modules have certain middlware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder//public folder. stylesheet, images, jquery stuff like that. stuffs that are publicly available to the browser
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/mit'))); //added this line here

//middleware for Express Session
app.use(session({
    secret: 'secret', //secret can be whatever we like
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

//Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


// Connect Flash middleware
app.use(flash());

app.all('/express-flash', function( req, res ) {
    req.flash('success', 'This is a flash message using the express-flash module.');
    res.redirect(301, '/');
});

// Global Vars //for flash messages
//req is an object containing information about the HTTP request that raised the event
//
app.use(function (req, res, next) {//if you want to create a global var or global func you wanna use res.locals
  res.locals.success_msg = req.flash('success_msg'); 
  res.locals.error_msg = req.flash('error_msg');
  //res.locals.error = req.flash('error');
  res.locals.user = req.user || null; //creating a var called the user, and if the user is there then we're gonna be able to access the user from anywhere, and if not then it's just gonna be null
  res.locals.errors = null;
  next();
});

//middlware for route files
//app.use('/', routes); //slash is gonna be mapped to routes which will go to index file
app.get('/', routes);
app.use('/users', users);


// Set Port and start the server

app.set('port', (process.env.PORT || 5555));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});
