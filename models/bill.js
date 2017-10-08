const mongoose = require("mongoose");
const billSchema = mongoose.Schema({
    by:{type:String},
    description:{type:String},
    people:[],
    bill:{type:Number},
    details:[],
    settlements:[],
    numOfPeoplePaid:{type:Number},
    date:{type:Date},
    splitMethod:{type:Number,enum:[1,2]}
});


const Bill = mongoose.model("Bill",billSchema);
module.exports = Bill;