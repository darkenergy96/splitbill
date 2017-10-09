const mongoose = require("mongoose");
const dueSchema = mongoose.Schema({
    _id:{type:String},
    email:{type:String},
    due:{type:Number}
})
const settlementSchema = mongoose.Schema({
    _id:{type:String},
    email:{type:String},
    dues:[dueSchema],
    totalDues:{type:Number}
})
const groupSchema = mongoose.Schema({
    name : { type: String},
    people :[],
    createdOn:{type:Date,default:Date.now},
    createdBy:{type:String},
    settlements:[settlementSchema]
});
const Group = mongoose.model("Group",groupSchema);
module.exports = Group;