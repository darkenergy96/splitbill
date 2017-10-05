const mongoose = require("mongoose");
// var bcrypt = require("bcrypt");
// var SALT_FACTOR = 10;

const userSchema = mongoose.Schema({
    email : { type: String},
    password : { type: String},
    displayName:{type:String},
    googleID:{type:String},
    facebookId:{type:String},
    createdAt: { type: Date, default: Date.now()},
    groups:[],
    friends:[]
});


const User = mongoose.model("User",userSchema);
module.exports = User;