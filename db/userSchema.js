const mongoose = require("mongoose")
const plm = require("passport-local-mongoose")
const userSchema = new mongoose.Schema({
    profilepic:{
        type:String,
        default:"default.jpeg"
    },
    
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
        minlength: [4, "username must be alteast 4 character long"]
    },

    username: {
        type: String,
        trim: true,
        unique: true,
        required: [true, "username is required"],

    },

    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: [true, "Email is required"],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address',],
    },

    password: String,
    resetPasswordToken: {
        type: Number,
        default: 0,
    },
    
}, { timestamps: true })


userSchema.plugin(plm)

module.exports = mongoose.model("user", userSchema)

