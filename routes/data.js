const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const Bill = require('../models/bill.js');
const email = "srksumanth@gmail.com"

// add a friend
router.get('/add-friend/:friendEmail',(req,res)=>{//will change to PUT later
    let {friendEmail} = req.params;
    debugger
    User.findOne({email},(err,user)=>{
        if(err) throw err;
        user.friends.push(friendEmail);
        user.save(err=>{
            if(err) throw err
            User.findOne({email:friendEmail},(err,friend)=>{
                friend.friends.push(email);
                friend.save(err=>{
                    if(err) throw err
                    res.json({
                        success:true
                    })
                })
            })
        })
    })
})
// get user friends
router.get('/friends',(req,res)=>{
    User.findOne({email},(err,user)=>{
        if(err) throw err;
        res.json(user.friends);
    })
})
router.post('/add-bill',(req,res)=>{ //post a bill
    let billData = new Bill(req.body)
    billData.save((err,billData)=>{
        if(err){
            console.log(err);
            res.statusCode = 500;
            res.json({
                success:false
            })
        }
        else{
            res.statusCode = 200;
            res.json(billData)
        }
    })
});
// get bills with a specific user
router.get('/bills/:email',(req,res)=>{
    let {email} = req.params;
    Bill.find({people:{$all:["srksumanth@gmail.com",email]}},(err,bills)=>{
        res.statusCode = 200;
        res.json(bills);
    })
})
module.exports = router