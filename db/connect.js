const mongoose = require("mongoose")
 
mongoose.connect("mongodb://0.0.0.0/socialmedia").then(()=>console.log("db connceted")).catch((error)=>(error))