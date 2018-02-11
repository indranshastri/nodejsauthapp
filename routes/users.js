var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var Users = require('../models/Users');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* GET users register. */
router.get('/register', function(req, res, next) {
  res.render('register',{ title: 'Register' });
});
/* set new users post. */
router.post('/register', upload.single('profileimage'),function(req, res, next) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if(req.file){
    var profileimage = req.file.filename;
  }else{
    var profileimage = 'no-image';
  }

  // //form validator 
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Password do not match').equals(req.body.password);

  // // Check Errors
  var errors = req.validationErrors();

  if(errors){
    res.render('register',{ title: 'Register',errors:errors });
  }else{
    var newUser = new Users({
      name:name,
      email:email,
      username:username,
      password:password,
      profileimage:profileimage,
    }); 

    Users.createUser(newUser,function(error,users){
      if(error) throw error;
      console.log(users);
    });

    req.flash('success','You are now registered and can login');
    
    res.location("/");
    res.redirect('/');
  }

});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  Users.getUserById(id, function(err, user) {
    console.log(user);
    done(err, user);
  });
});

passport.use(new LocalStrategy(function(username,password,done){
    Users.getUserByUsername(username,function(error,user){
        if(error) throw error;
        if(!user){
          return done(null,false,{'message':'Unknown user'});
        }
        Users.comparePassword(password,user.password,function(error,isMatch){
          if(error) return done(error);
          if(isMatch){
            return done(null,user);
          }else{
            return done(null,false,{"message":"Invalid username and password"});
          }

        });
    })
}));

/* GET users login. */
router.get('/login', function(req, res, next) {
  res.render('login',{ title: 'Log in' });
});

router.post('/login',
  passport.authenticate('local',{'failureRedirect':'/users/login','failureFlash':'Invalid username or password'}),
  function(req, res) {
    req.flash('success','You are now registered and can login');
    
    res.location("/");
    res.redirect('/');
  });

router.get('/logout',ensureAuthenticated, function(req, res, next) {
    req.logout();
    req.flash('success','You are now logged out');
    res.redirect('/users/login');

});

/* GET users login. */
router.get('/profile',ensureAuthenticated, function(req, res, next) {
  mainuser = req.user;
  res.render('profile',{ title: 'profile',user:mainuser });
});


function ensureAuthenticated(req, res, next){
  if (req.isAuthenticated()) {
      return next();
  }
  res.redirect('/users/login');
}

module.exports = router;
