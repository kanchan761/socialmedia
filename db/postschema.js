const mongoose = require("mongoose")

const postschema = new mongoose.Schema({
    title:{
      type:String,
      trim:true,
      required:[true, "title is required"],
      minilength:[4 ,"Title must be atleast 4 characters long"]
    },
    media:{
        type: String,
        required :[true, "media is require"]
    },

    user : {type : mongoose.Schema.Types.ObjectId, ref:"user"}

},{timestamps:true})

module.exports = mongoose.model("post" , postschema)

