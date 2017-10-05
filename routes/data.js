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
        user.settlements.push({
            _id:friendEmail,
            email:friendEmail,
            dues:[],
            totalDues:0
        })
        user.save(err=>{
            if(err) throw err
            User.findOne({email:friendEmail},(err,friend)=>{
                friend.friends.push(email);
                friend.settlements.push({
                    _id:email,
                    email:email,
                    dues:[],
                    totalDues:0
                })
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
            billData.settlements.forEach((settlement)=>{
                User.findOne({email:settlement.receiver},(err,user)=>{
                    if(err) console.log(err)
                    let doc = user.settlements.id(settlement.giver)
                    let due = doc.dues.id("none");
                    if(!due){
                        doc.dues.push({
                            _id:"none",
                            amount:settlement.amount
                        })
                    }
                    else{
                        due.amount += settlement.amount
                    }
                    doc.totalDues += settlement.amount
                    console.log('due',due)
                    // let groupNoneExists = false;
                    // doc.dues.forEach((due)=>{
                    //     if(due.group === 'none'){
                    //         due.amount +=  settlement.amount;
                    //         groupNoneExists = true;
                    //     }
                    // })
                    // if(!groupNoneExists){
                    //     doc.dues.push({
                    //         amount:settlement.amount,
                    //         group:"none"     
                    //     })
                    // }
                    // doc.totalDues += settlement.amount;
                    user.save(err=>{
                        if(err) console.log(err);
                    });
                })

                User.findOne({email:settlement.giver},(err,user)=>{
                    if(err) console.log(err)
                    let doc = user.settlements.id(settlement.receiver)
                    let due = doc.dues.id("none");
                    if(!due){
                        doc.dues.push({
                            _id:"none",
                            amount: -settlement.amount
                        })
                    }
                    else{
                        due.amount -= settlement.amount
                    }
                    doc.totalDues -= settlement.amount
                    console.log('due minus',due)
                    // let groupNoneExists = false;
                    // doc.dues.forEach((due)=>{
                    //     if(due.group === 'none'){
                    //         console.log('done')
                    //         due.amount -= settlement.amount;
                    //         groupNoneExists = true;
                    //     }
                    // })
                    // if(!groupNoneExists){
                    //     doc.dues.push({
                    //         amount: -settlement.amount,
                    //         group:"none"     
                    //     })
                    // }
                    // doc.totalDues -= settlement.amount;
                    user.save(err=>{
                        if(err) console.log(err);
                    });
                })

            })
            res.statusCode = 200;
            res.json(billData);
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

// smart settle
router.get('/smart-settle/:email',(req,res)=>{
    User.findOne({email},(err,user)=>{
        res.json(user.settlements.id(req.params.email));
    })
});
module.exports = router