var express = require('express');
var router = express.Router();

const user = require("../db/userSchema")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render("login");
});

router.get('/register', function(req, res, next) {
  res.render("resgister");
});


router.post('/register-user', async function(req, res, next) {
      try{
        const newuser = new user(req.body)
        await newuser.save()
        res.redirect("/login")
      }
      catch(error){
          res.send(error)
      }
});

router.get('/profile', function(req, res, next) {
  res.render("profile");
});

module.exports = router;
