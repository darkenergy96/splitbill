const mongoose = require("mongoose");
const groupSchema = mongoose.Schema({
    name : { type: String},
    people :[],
    createdOn:{type:Date,default:Date.now},
    createdBy:{type:String},
});
const Group = mongoose.model("Group",groupSchema);
module.exports = Group;