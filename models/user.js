var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
/*
mongoose.connect('mongodb://localhost/loginapp');

var db = mongoose.connection;
*/
//user schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String
	},
	email: {
		type: String
	},
	ustatus: Boolean,
	adminstatus: {
		type: Boolean,
	},
	name: {
		type: String
	}
});

//create a var that can be accessed outside of this file
var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
        newUser.password = hash;
        newUser.save(callback);
    });
});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserbyId = function(id, callback){
	User.findById(id, callback); //mongoose methods
}

module.exports.comparePassword = function(candidatePass, hash, callback) {
	bcrypt.compare(candidatePass, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports.updateUserbyID = function(lid, callback){
	User.update({_id: lid}, {$set: {adminstatus: true}}, callback);
}
/*
module.exports.verifyUser = function(id, verID){
	/*
	User.findById(id, function(err, ){
		if(err) throw err;
		User.update
	}, callback); //mongoose methods
	*/
	/*
	User.findByIdAndUpdate(id, { $set: { ustatus: true }},
							 function (err, tank) {
  			if (err) return handleError(err);
  			res.send(tank);
  			console.log("verified!!!")
	});
}
*/