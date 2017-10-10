const mongoose = require("mongoose");
const settlementSchema = require("./settlement.js")
// var bcrypt = require("bcrypt");
// var SALT_FACTOR = 10;
const friendSchema = mongoose.Schema({
    _id:{type:String},
    email:{type:String},
    displayName:{type:String}
})
const userSchema = mongoose.Schema({
    email : { type: String},
    password : { type: String},
    displayName:{type:String},
    googleID:{type:String},
    facebookId:{type:String},
    createdAt: { type: Date, default: Date.now()},
    groups:[],
    friends:[friendSchema],
    settlements:[settlementSchema]
});


const User = mongoose.model("User",userSchema);
module.exports = User;