var express = require('express');
var router = express.Router();

const user = require("../db/userSchema")
const upload = require("../utils/multer").single("profilepic")
const fs = require("fs")
const path = require("path")
const passport = require("passport")
const LocalStrategy = require("passport-local")

passport.use(new LocalStrategy(user.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{user : req.user});
});

router.get('/login', function(req, res, next) {
  res.render("login",{user : req.user});
});

router.post('/login', passport.authenticate("local",{
successRedirect :"/profile",
failureRedirect :"/login",
}), function(req, res, next) {
 
});


router.get("/logout",function(req,res,next){
  req.logout(()=>{
    res.redirect('/login')
  })
})

router.get('/register', function(req, res, next) {
  res.render("resgister",{user : req.user});
});

router.post('/register-user', async function(req, res, next) {
  try{
    // const newuser = new user(req.body)
    // await newuser.save()
        // res.redirect("/login")
        const {name,username ,email,password} = req.body
        await user.register({name,username,email}, password)
        res.redirect("/login")
      }
      catch(error){
        res.send(error.message)
      }
}); 

router.get('/profile', isLoggedIn, function(req, res, next) {
  res.render("profile",{user : req.user});
});

router.get('/update-user/:id', isLoggedIn, function(req, res, next) {
  res.render("update",{user : req.user});
});

router.post('/update-user/:id', isLoggedIn,async function(req, res, next) {
  const _id = req.params.id
   try {
    await user.findByIdAndUpdate({_id},{
     username : req.body.username,
     name : req.body.name,
     email : req.body.email
    })
    res.redirect(`/update-user/${req.params.id}`)
   } catch (error) {
    console.log(error.message)
   }
});


router.get('/reset-password/:id', isLoggedIn, function(req, res, next) {
  res.render("reset-password",{user : req.user});
});
      
router.post("/reset-password/:id", isLoggedIn, async function (req, res, next) {
  try {
    await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword,
    );
    req.user.save();
    res.redirect(`/update-user/${req.user._id}`);
  } catch (error) {
    res.send(error);
  }
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated){
    next()
  }
  else{
    res.redirect("/login")
  }
}

router.get('/forget-email',  function(req, res, next) {
  res.render("forget-email",{user : req.user});
});

router.post('/forget-email', async function(req, res, next){
 try{

  const single = await user.findOne({email : req.body.email})
  if(single){
    res.redirect(`/forget-password/${single._id}`)
  
  }else{
    res.redirect("/forget-email")
  }
 }catch(error){
  res.send(error.message)
 }
});

router.get('/forget-password/:id',  function(req, res, next) {
  res.render("forgetpassword", {user : req.user, id: req.params.id });
});

router.post('/forget-password/:id', async function(req, res, next) {
  try{
    const User = await user.findById(req.params.id);
    await User.setPassword(req.body.password)
    await User.save()
    res.redirect('/login')
  }catch(error){
    console.log(error.message)
  }
});

router.get('/delete-profile/:id', async function(req, res, next) {
try{
const id = req.params.id
const deleteduser = await user.findByIdAndDelete(id)
if(deleteduser.profilepic !== "default.jpeg"){
  fs.unlinkSync(path.join(__dirname,"..","public","images" , deleteduser.profilepic))
  }
  
res.redirect("/login")
}
catch(error){
res.send(error.message)
}

});

router.post('/image/:id', upload, isLoggedIn, async function(req, res, next) {

try {
  if(req.user.profilepic !== "default.jpeg"){
fs.unlinkSync(path.join(__dirname,"..","public","images" , req.user.profilepic))
}

req.user.profilepic = req.file.filename;
await req.user.save();
res.redirect(`/update-user/${req.params.id}`)
} catch (error) {
    res.render(error.message)
}

});

module.exports = router;


