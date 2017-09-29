const passport = require("passport");
const User = require("../models/user");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const apiKeys = require('../api_keys');

module.exports = function() {
 passport.serializeUser(function(user, done) {
 done(null, user._id);
 });
 passport.deserializeUser(function(id, done) {
 User.findById(id, function(err, user) {
 done(err, user);
 });
 });
};

passport.use("login", new LocalStrategy({
    usernameField:'email',
    passwordField:'password',
    passReqToCallback:true
},
    function(req,email, password, done) {
        console.log(done)
 User.findOne({ email: email }, function(err, user) {
 if (err) { return done(err); }
 if (!user) {
 return done(null, false);
 }
 return done(null, user);
 });
}));

// google oauth
passport.use(new GoogleStrategy({
    clientID:     apiKeys.google.clientID,
    clientSecret: apiKeys.google.clientSecret,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
      //use process.nextTick() to handle asynchronously
    process.nextTick(function(){
        var email = profile.emails[0].value;
        User.findOne({email},function(err,user){
            if(err){
                return done(err);
            }
            if(user){
                return done(null,user);
            }
            else{
                const newuser = new User({
                    email:email,
                    googleID:profile.id,
                    password:""
                });
                newuser.save(function(err,newuser){
                    if(err){
                        throw err;
                    }
                    return done(null,newuser);

                });
            }
        });
    });
  }
));

// facebook oauth
passport.use(new FacebookStrategy({
    clientID:     apiKeys.facebook.clientID,
    clientSecret: apiKeys.facebook.clientSecret,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['email','gender']
  },
  function(accessToken, refreshToken, profile,done) {
    let facebookId = profile.id;
    console.log(profile);
    User.findOne({facebookId},(err,user)=>{
        if(err){
            return done(err);
        }
        if(user){
            return done(null,user);
        }
        else{
            const newuser = new User({
                facebookId
            });
            newuser.save(function(err,newuser){
                if(err){
                    throw err;
                }
                return done(null,newuser);

            });
        }
    })
  }
));