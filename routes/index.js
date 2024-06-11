var express = require('express');
var router = express.Router();

const user = require("../db/userSchema")
const post = require("../db/postschema")

// const upload = require("../utils/multer").single("profilepic")
const upload = require("../utils/multer")
const fs = require("fs")
const path = require("path")
const passport = require("passport")
const LocalStrategy = require("passport-local")

const sendmail = require("../utils/mail") 
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

router.get('/profile', isLoggedIn,async function(req, res, next) {
  try {
    const posts = await post.find().populate("user")
    console.log(req.user);
    console.log(posts);
    res.render("profile",{user : req.user, posts});
  } catch (error) {
    console.log(error)
    res.send(error)
  }
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
    // res.redirect(`/forget-password/${single._id}`)
if(single){
  // sendmail(res, req.body.email, single)
  const url = `${req.protocol}://${req.get("host")}/forget-password/${single._id}`
    sendmail(res,user,url)
    
}else{  
  res.redirect("/forget-email")
}

}catch(error){
  console.log(error)
  res.send(error.message)
}
});

router.get('/forget-password/:id',  function(req, res, next) {
  res.render("forgetpassword", {user : req.user, id: req.params.id });
});

router.post('/forget-password/:id', async function(req, res, next) {
  try{
    const User = await user.findById(req.params.id);
    if(User.resetPasswordToken === 1){
    await User.setPassword(req.body.password)
  User.resetPasswordToken = 0;
    await User.save()
    res.redirect('/login')

  }else{
    res.send("link Experied try Again")
  }
    // res.redirect('/login')
  }
  catch(error){
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

router.post('/image/:id', upload.single("profilepic"), isLoggedIn, async function(req, res, next) {

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


router.get('/post-create/', function(req, res, next) {
  res.render("postcreate", {user: req.user})
});


router.post('/post-create/',isLoggedIn,upload.single("media"), async function(req, res, next) {
  try {
  const newpost = new post({
    title : req.body.title,
    media : req.file.filename,
    user : req.user._id
})
    req.user.posts.push(newpost._id)
    await newpost.save()
    await req.user.save()

    res.redirect(`/profile`)
  } catch (error) {
      res.render(error.message)
  }
  
});

router.get('/like/:postid', isLoggedIn,async function(req, res, next) {
  try {
    const Post =await post.findById(req.params.postid)
    if(Post.likes.includes(req.user._id)){
      Post.likes = Post.likes.filter((uid) => uid != req.user.id);
    }else{
      Post.likes.push(req.user._id)
    }
    await Post.save()
    res.redirect('/profile')
  } catch (error) {
    console.log(error)
  }
});


router.get('/timeline', isLoggedIn,async function(req, res, next) {
  try {
   res.render("timeline",{user : await req.user.populate("posts")});
  } catch (error) {
    // console.log(error)  
    res.send(error)
  }
});

router.get("/delete-post/:id", isLoggedIn, async function (req, res, next) {
  try {
      const deletepost = await post.findByIdAndDelete(req.params.id);

      fs.unlinkSync(
          path.join(__dirname, "..", "public", "images", deletepost.media)
      );
      res.redirect("/timeline");
  } catch (error) {
      res.send(error);
  }
});


module.exports = router;


