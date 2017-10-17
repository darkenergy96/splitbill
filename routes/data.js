const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const Bill = require('../models/bill.js');
const Group = require('../models/group.js');
const email = "srksumanth@gmail.com"
const mgunKey = "key";
const domain = "mailgun domain
const mailgun = require("mailgun-js")({apiKey:mgunKey,domain});

//add friend new 
router.post('/add-friend',(req,res)=>{
    let {friendEmail} = req.body;
    User.findOne({email:friendEmail},(err,friend)=>{
        if(err) console.log(err);
        if(!friend){

            // res.statusCode = 400; //bad request
            console.log(!friend)
            res.json({
                success:false,
                message:'No user exists with that email'
            })
        }
      else{
        //check if already a friend
        let doc = friend.friends.id(req.user.email)
        if(doc){
            return res.json({
                success:false,
                message:'Already a friend!!'
            })
        } 
        // add a friend 
        friend.friends.push({
            _id:req.user.email,
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
                    _id:friend.email,
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
                        success:true,
                        message:'Friend Added Successfully!'
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
                    if(!doc){ //if not a friend
                        User.findOne({email:settlement.giver},(err,giver)=>{
                            if(err) console.log(err)
                            user.friends.push({
                                _id:giver.email,
                                email:giver.email,
                                displayName:giver.displayName
                            })
                            user.settlements.push({
                                _id:settlement.giver,
                                email:settlement.giver,
                                dues:[{
                                    _id:billData.group,
                                    amount:settlement.amount
                                }],
                                totalDues:settlement.amount
                            })
                            user.save(err=>{
                                if(err) console.log(err);
                            });
                        })
                    }
                    else{
                        let due = doc.dues.id(billData.group);
                        if(!due){
                            doc.dues.push({
                                _id:billData.group,
                                amount:settlement.amount
                            })
                        }
                        else{
                            due.amount += settlement.amount
                        }
                        doc.totalDues += settlement.amount
                        user.save(err=>{
                            if(err) console.log(err);
                        });
                    }
                    // console.log('due',due)
                })

                User.findOne({email:settlement.giver},(err,user)=>{
                    if(err) console.log(err)
                    let doc = user.settlements.id(settlement.receiver)
                    if(!doc){ //if not a friend
                        User.findOne({email:settlement.receiver},(err,giver)=>{
                            if(err) console.log(err)
                            user.friends.push({
                                _id:giver.email,
                                email:giver.email,
                                displayName:giver.displayName
                            })
                            user.settlements.push({
                                _id:settlement.receiver,
                                email:settlement.receiver,
                                dues:[{
                                    _id:billData.group,
                                    amount:-settlement.amount
                                }],
                                totalDues:-settlement.amount
                            })
                            user.save(err=>{
                                if(err) console.log(err);
                            });
                        })
                    }
                    else{
                        let due = doc.dues.id(billData.group);
                        if(!due){
                            doc.dues.push({
                                _id:billData.group,
                                amount:-settlement.amount
                            })
                        }
                        else{
                            due.amount -= settlement.amount
                        }
                        doc.totalDues -= settlement.amount
                        user.save(err=>{
                            if(err) console.log(err);
                        });
                    }
                    // console.log('due',due)
                })
            })
            //new stuff below
            if(billData.group !== "0"){
                Group.findOne({_id:billData.group},(err,group)=>{
                    console.log(group)
                    billData.settlements.forEach((settlement,i)=>{
                        let giverDoc = group.settlements.id(settlement.giver);
                        giverDoc.totalDues += settlement.amount;
                        console.log(giverDoc.totalDues);
                        let giverDues = giverDoc.dues.id(settlement.receiver);
                        if(!giverDues){
                            giverDoc.dues.push({
                                _id:settlement.receiver,
                                email:settlement.receiver,
                                due:settlement.amount
                            })
                        }
                        else
                        giverDues.due += settlement.amount;

                        let receiverDoc = group.settlements.id(settlement.receiver);
                        receiverDoc.totalDues -= settlement.amount;
                        let receiverDues = receiverDoc.dues.id(settlement.giver);
                        if(!receiverDues){
                            receiverDoc.dues.push({
                                _id:settlement.giver,
                                email:settlement.giver,
                                due:-settlement.amount
                            })
                        }
                        else
                        receiverDues.due -= settlement.amount;

                        if(i === billData.settlements.length-1){
                            group.save((err)=>{
                                if(err) console.log(err);
                            })
                        }
                        
                    })
                   
                })
            }
            //new stuff above 
            res.json({
                success:true
            });
            
        }
    })
});
//get group bills
router.get('/groupBills/:groupId',(req,res)=>{
    let {groupId} = req.params;
    Bill.find({group:groupId}).sort('-date').exec((err,bills)=>{
        if(err) console.log(err);
        res.statusCode = 200;
        res.json(bills);
    })
}) 
// get bills with a specific user new
router.get('/bills/:email',(req,res)=>{
    let {email} = req.params;
    Bill.find({people:{$all:[req.user.email,email]}}).sort('-date').exec((err,bills)=>{
        if(err) console.log(err);
        res.statusCode = 200;
        res.json(bills);
    })
})
// smart settle
router.get('/smart-settle/:email',(req,res)=>{
    User.findOne({email:req.user.email},(err,user)=>{
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
    let groupData = req.body;
    let newGroup = new Group(groupData);
    newGroup.save((err,group)=>{
        if(err) console.log(err);
        group.people.forEach((person)=>{
            console.log(person);
            User.findOne({email:person.email},(err,user)=>{
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
// get group settlements
router.get('/group/:id',(req,res)=>{
    Group.findOne({_id:req.params.id},(err,group)=>{
        if(err) console.log(err);
        else{
            res.statusCode = 200;
            res.json(group)
        }
    })
});
//get group members
router.get('/group-people/:id',(req,res)=>{
    Group.findOne({_id:req.params.id}).select({people:1,_id:0}).exec((err,group)=>{
        if(err) console.log(err);
        else{
            res.statusCode = 200;
            res.json(group)
        }
    })
});
//global settle with a user
router.get('/global-settle/:email',(req,res)=>{
    let userEmail = req.user.email;
    let friendEmail = req.params.email;
    let involvedGroups = [];
    User.findOne({email:userEmail},(err,user)=>{
        if(err) console.log(err)
        console.log(user.settlements.id(friendEmail))
        user.settlements.id(friendEmail).dues.forEach(due=>{//get involved groups
            if(due._id !== "0")
            involvedGroups.push({
                _id:due._id,
                amount:due.amount
            })
            
        })
        console.log('involvedgroups',involvedGroups)
        user.settlements.id(friendEmail).totalDues = 0;
        user.settlements.id(friendEmail).dues = [];
        user.save(err=>{
            if(err) console.log(err)
            User.findOne({email:friendEmail},(err,friend)=>{
                if(err) console.log(err)
                friend.settlements.id(userEmail).totalDues = 0;
                friend.settlements.id(userEmail).dues = [];
                friend.save(err=>{
                    if(err) console.log(err);
                    involvedGroups.forEach((involvedGroup)=>{
                        Group.findOne({_id:involvedGroup._id},(err,group)=>{
                            console.log('x\n',group.settlements.id(userEmail).totalDues);
                            group.settlements.id(userEmail).totalDues += involvedGroup.amount;
                            group.settlements.id(userEmail).dues.id(friendEmail).due += involvedGroup.amount;
                
                            group.settlements.id(friendEmail).totalDues -= involvedGroup.amount;
                            group.settlements.id(friendEmail).dues.id(userEmail).due -= involvedGroup.amount;
                            group.save((err,group)=>{
                                if(err)
                                console.log(err);
                                // console.log('group',group);
                                res.json({
                                    success:true
                                })
                            })
                
                        })
                    })
                })
            })
        })
    });
    
}) 
// bills summary
router.get('/summary',(req,res)=>{
    let {email} = req.user;
    User.findOne({email}).select({
        "settlements.totalDues":1,
        _id:0
    }).exec((err,summary)=>{
        if(err) console.log(err);
        res.json(summary);
    })
}) 
// dashboard
router.get('/dashboard',(req,res)=>{
    Bill.find({people:req.user.email}).sort('-date').exec((err,bills)=>{
        if(err) console.log(err);
        res.statusCode = 200;
        res.json(bills);
    })
})
// invite a friend
router.post('/invite',(req,res)=>{
    let email = req.body.inviteEmail;
    User.findOne({email},(err,user)=>{
        if(err) console.log(err);
        if(!user){//send an email
            const data = {
                from: 'splitbill <me@samples.mailgun.org>',
                to: email,
                subject: 'Splitbilll Invite', 
                html: `
                <p>${req.user.email} invited you to join splitbill</p>
                <a href="http://localhost:3000/signup">
                Join splitbill
                </a>
                `
              };
              mailgun.messages().send(data, function (error, body) {
                  if(error) throw error
                  else{
                console.log(body);
                res.json({
                    success:true,
                    message:`A password reset link is sent to ${email}`
                })
                }
              });
            
        }
        else{
            res.json({
                success:false,
                message:'User already exists!!'
            })
        }
    })
})
module.exports = router
