'use strict';

const express = require("express");
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const errorHandler = require('errorhandler');
const session = require('express-session');
const passport = require('passport');
const ejs = require("ejs");

const app = express();

// view setting
app.engine('ejs', ejs.__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// cookie parser
app.use(cookieParser());

// body parser
app.use(bodyParser.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(errorHandler());
app.use(session({
    secret: 'smartfarm api',
    resave: false, 
    aaveUninitialized: false,
    cookie: {
        maxAge: 2*60*60*1000
    }
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// passport - configuration
require('./auth');


// router
const routes = require('./routes');

app.use('/auth', routes.authorize); // Authorization Router
app.use('/user', routes.user); // User account management Router
app.use('/admin', routes.admin); // Admin account management Router
app.use('/product', routes.product); // Product management Router
app.use('/payment', routes.payment); // Payment management Router
app.use('/test', routes.test);
app.use('/', routes.site);


const port = process.env.PORT || 80;
const ip = process.env.IP || "127.0.0.1";

// server listen
app.listen(port, ip, function() {
    console.log(`

        -----| SmartFarm API |-----
        ip: ` + ip + `
        port: ` + port + `
        -----| SmartFarm API |-----
    
    `)
});
