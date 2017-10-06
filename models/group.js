const mongoose = require("mongoose");

const groupSchema = mongoose.Schema({
    name : { type: String},
    people : [],
    createdOn:{type:Date,default:Date.now},
    settlements:[settlementSchema]
});


const Group = mongoose.model("Group",userSchema);
module.exports = User;