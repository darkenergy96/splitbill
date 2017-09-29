const express = require('express');
const path = require('path');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.js');
const router = express.Router();
const jwtSecret = 'teamv8';
const bcrypt = require('bcrypt');
router.get('/',(req,res)=>{
    res.send('server setup for splitbill');
})
module.exports = router;
router.get('/signin',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/signin.html'));
});
router.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/signup.html'));
});
router.post('/signup',(req,res,next)=>{
    console.log('cool')
    let {email,password} = req.body;
    User.findOne({email},(err,user)=>{
        if(err)
        console.log(err);
        debugger
        if(!user){
            // signup the user
            let newUser = new User({
                email,
                password
            });
            newUser.save((err,user)=>{
                if(err) throw err;
                // const jwtData = user.email;
                // const token = jwt.sign(jwtData,jwtSecret);
                // res.status = 200;
                // res.cookie('auth',token);
                // res.json({
				// 	success: true
                // });
                next()
            })
        }
        else{
            return res.json({
                success:false,
                message:'A user with this email already exists'
            });
        }
        
    })
},passport.authenticate('login',{
    successRedirect:'/',
    failureRedirect:'/signup',
    failureFlash:true
}));

router.post('/signin',(req,res)=>{
    let {email,password} = req.body;
    User.findOne({email},(err,user)=>{
        if(err) throw err
        if(!user){
            res.json({
                success:false,
                message:'Incorrect Email'
            })
        }
        if(user.password !== password){
            res.json({
                success:false,
                message:'Incorrect Password'
            })
        }
        const jwtData = user.email;
        const token = jwt.sign(jwtData,jwtSecret);
        res.cookie('auth',token);
        res.status = 200;
        res.json({
            success: true
        });
    })
})

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

router.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/')
})
router.get('/test',(req,res)=>{
    console.log(req.user);
    res.json('ok')
})