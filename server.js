'use strict';
const express = require("express");
const helmet = require('helmet');
const path = require("path");
const passport = require('passport');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require('connect-flash')
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const routes = require('./routes/routes.js');
const dataRoutes = require('./routes/data.js');
const setUpPassport = require('./auth/setuppassport.js');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/splitbill",{useMongoClient:true});
const store = new MongoDBStore(
    {
      uri: 'mongodb://localhost:27017/splitbill',
      collection: 'login-sessions'
    });
const app = express();
app.set("views",path.join(__dirname, "views"));
app.set("view engine","ejs");
app.use(helmet());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    secret:"You know what its called Bentuition!",
    resave:true,
    saveUninitialized:true,
    store
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
setUpPassport();
app.use(express.static(path.join(__dirname,'public')));
app.use(routes);
app.use(dataRoutes);
//mongoose events
mongoose.connection.on('connected', function () {
 console.log('Mongoose connected');
});
mongoose.connection.on('error',function (err) {
 console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function () {
 console.log('Mongoose disconnected\n');
 process.exit(0);
});
process.on('SIGINT', function() {
 mongoose.connection.close(function () {
 console.log('Mongoose disconnected through app termination\n');
 process.exit(0);
 });
});
app.set("port",3000);
app.listen(app.get('port'),function(){
    console.log(`server running on port ${app.get('port')}`);
});









