var express = require('express');
var router = express.Router();

const user = require("../db/userSchema")

const passport = require("passport")
const LocalStrategy = require("passport-local")

passport.use(new LocalStrategy(user.authenticate()))

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render("login");
});

router.post('/login', passport.authenticate("local",{
successRedirect :"/profile",
failureRedirect :"/login",
}), function(req, res, next) {
 
});

function isloggedIn(req,res,next){
  if(req.isAuthenticated){
    next()
  }
  else{
    res.redirect("/login")
  }
}

router.get("/logout",function(req,res,next){
  req.logout(()=>{
    res.redirect('/login')
  })
})

router.get('/register', function(req, res, next) {
  res.render("resgister");
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

router.get('/profile', function(req, res, next) {
  res.render("profile");
});

module.exports = router;
