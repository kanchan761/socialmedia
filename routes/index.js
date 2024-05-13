var express = require('express');
var router = express.Router();

const user = require("../db/userSchema")

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

router.get('/reset-password/:id', isLoggedIn, function(req, res, next) {
  res.render("reset-password",{user : req.user});
});
      
router.post("/reset-password/:id", isLoggedIn, async function (req, res, next) {
  try {
    await req.user.changePassword(
      req.body.oldpassword,
      req.body.newpassword
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



module.exports = router;


