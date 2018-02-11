var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/nodeauth');

var db = mongoose.connection;

// User Schema
var UsersSchema = mongoose.Schema({
    username:{
        type:String,
        index:true
    },
    password:{
        type:String,
    },
    email:{
        type:String,
    },
    name:{
        type:String,
    },
    profileimage:{
        type:String,
    }

});

var Users = module.exports = mongoose.model("Users",UsersSchema);


module.exports.getUserById = function(id,callback){
    Users.findById(id,callback);   
}

module.exports.getUserByUsername = function(username,callback){
    var query = {"username":username};
    Users.findOne(query,callback);
}

module.exports.comparePassword = function(password,haspassword,callback){
    bcrypt.compare(password, haspassword, function(err, isMatch) {
        callback(null,isMatch );
    });
}


module.exports.createUser = function(newUser,callback){
    var bcrypt = require('bcryptjs');
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            // Store hash in your password DB.
            newUser.password = hash; 
            newUser.save(callback);
        });
    });
   
}