const mongoose  = require('mongoose');
const duesSchema = mongoose.Schema({
    _id:{type:String,required:true},
    amount:{type:Number}
})

const settlementSchema = mongoose.Schema({
    _id:{type:String,required:true},
    email:{type:String},
    dues:[duesSchema],
    totalDues:{type:Number}
})
module.exports = settlementSchema;