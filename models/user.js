var mongoose = require("mongoose");
// var bcrypt = require("bcrypt");
// var SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
    email : { type: String},
    password : { type: String},
    googleID:{type:String},
    facebookId:{type:String},
    createdAt: { type: Date, default: Date.now()},
});


var User = mongoose.model("User",userSchema);
module.exports = User;