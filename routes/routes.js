const express = require('express');
const path = require('path');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const Bill = require('../models/bill.js');
const router = express.Router();
const jwtSecret = 'teamv8';
const bcrypt = require('bcrypt');
const flash  = require("connect-flash");
router.get('/',(req,res)=>{
    if(req.isAuthenticated()){
        res.send(`Hello ${req.user.email} <a href="/logout">click me</a> to logout `)
    }
    else
    res.send(`<a href="/auth/google">click me</a> and login with google for now`);
})
module.exports = router;
router.get('/signin',(req,res)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }
    res.locals.errors = req.flash('error');
    res.render('signin')
});
router.get('/signup',(req,res)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }
    res.locals.errors = req.flash('error');
    res.render('signup')
});
router.post('/signup',(req,res,next)=>{
    if(req.isAuthenticated()){
        res.redirect('/');
    }
    let {email,password,displayName} = req.body;
    User.findOne({email},(err,user)=>{
        if(err)
        console.log(err);
        if(!user){
            // signup the user
            let newUser = new User({
                email,
                password,
                displayName
            });
            newUser.save((err,user)=>{
                if(err) throw err;
                next()
            })
        }
        else{
            req.flash('error','A user with this email already exists')
            res.redirect('/signup');
        }
        
    })
},passport.authenticate('login',{
    successRedirect:'/',
    failureRedirect:'/signup',
    failureFlash:true
}));

router.post('/signin',passport.authenticate('login',{
    successRedirect:'/',
    failureRedirect:'/signin',
    failureFlash:true
    })
)

// google oauth
router.get('/auth/google',
passport.authenticate('google', { scope: 
    ['https://www.googleapis.com/auth/plus.profile.emails.read' ] }
));

router.get( '/auth/google/callback', 
  passport.authenticate( 'google', { 
      successRedirect: '/',
      failureRedirect: '/signup'
}));

// facebook oauth
router.get('/auth/facebook',
passport.authenticate('facebook',{authType:'rerequest'}));

router.get('/auth/facebook/callback',
passport.authenticate('facebook', { failureRedirect: '/signup' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/');
});
// logout
router.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/')
})
router.get('/test',(req,res)=>{
    console.log(req.user);
    res.json('ok')
})
