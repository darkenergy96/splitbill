const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const Bill = require('../models/bill.js');
const Group = require('../models/group.js');
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
//add friend new 
router.post('/add-friend',(req,res)=>{
    let {friendEmail} = req.body;
    User.findOne({email:friendEmail},(err,friend)=>{
        if(err) console.log(err);
        if(!friend){
            res.json({
                success:false,
                message:'No user exists with that email'
            })
        }
      else{
        friend.friends.push({
            email:req.user.email,
            displayName:req.user.displayName
        });
        friend.settlements.push({
            _id:req.user.email,
            email:req.user.email,
            displayName:req.user.displayName,
            dues:[],
            totalDues:0
        })
        friend.save((err,friend)=>{
            User.findOne({email:req.user.email},(err,user)=>{
                if(err) console.log(err);
                user.friends.push({
                    email:friend.email,
                    displayName:friend.displayName
                });
                user.settlements.push({
                    _id:friend.email,
                    email:friend.email,
                    displayName:friend.displayName,
                    dues:[],
                    totalDues:0
                })
                user.save(err=>{
                    if(err) console.log(err)
                    res.json({
                        success:true
                    })
                })
            })
        })
      }
    })
})
// get user friends
router.get('/friends',(req,res)=>{
    let {email} = req.user;
    User.findOne({email},(err,user)=>{
        if(err) throw err;
        res.json(user.friends);
    })
})
// get user info
router.get('/user',(req,res)=>{
    User.findOne({email:req.user.email}).select({email:1,displayName:1,_id:0}).
    exec((err,user)=>{
        if(err) console.log(err);
        res.json(user)
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

// get bills with a specific user new
router.get('/bills/:email',(req,res)=>{
    let {email} = req.params;
    Bill.find({people:{$all:[req.user.email,email]}},(err,bills)=>{
        if(err) console.log(err);
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

//groups
// get groups of a user
router.get('/groups',(req,res)=>{
    User.findOne({email:req.user.email},(err,user)=>{
        if(err) console.log(err)
        res.json(user.groups)
    })
})

// creatae a group 
router.post('/create-group',(req,res)=>{
    let {groupData} = req.body;
    let newGroup = new Group(groupData);
    newGroup.save((err,group)=>{
        if(err) console.log(err);
        group.people.forEach((person)=>{
            User.findOne({email:person},(err,user)=>{
                user.groups.push({
                    _id:group._id,
                    name:group.name
                })
                user.save(err=>{
                    if(err) console.log(err);
                })
            })
        })
        res.json({
            success:true
        })
    })

}) 
module.exports = router