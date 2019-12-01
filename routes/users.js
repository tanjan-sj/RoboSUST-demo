var express = require('express');
var nodemailer = require("nodemailer"); //mail ver
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy; 
var path = require('path');

//adding crypto
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';

function encrypt(text){
	var cipher = crypto.createCipher(algorithm,password)
	var crypted = cipher.update(text,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
	}

function decrypt(text){
	var decipher = crypto.createDecipher(algorithm,password)
	var dec = decipher.update(text,'hex','utf8')
	dec += decipher.final('utf8');
	return dec;
	}
var adminSecret = null;
var adminDescret = null;
//crypto done

var User = require('../models/user');
var initialID = null;
var userMail = null;
var adminLink = null;
var adminFlag = false;


//Register
router.get('/register', function(req, res){
	res.render('register');
});

router.get('/people', function(req, res){
	res.render('people');
});

router.get('/team', function(req, res){
	res.render('team');
});

router.get('/jannat', function(req, res){
	res.render('jannat');
});

router.get('/sojib', function(req, res){
	res.render('sojib');
});

router.get('/enamul', function(req, res){
	res.render('enamul');
});

router.get('/members', function(req, res){
	res.render('members');
});


//login
router.get('/login', function(req, res){
	res.render('index');
});

//added user
router.get('/personal', ensureAuthenticated, function(req, res){
	res.render('index');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/');
	}
}

router.get('/logout', function (req, res) {
	console.log("i logged out");
	req.logout();
	res.redirect('/');
});

router.get('/projects', function(req, res){
	res.render('projects');
});

router.get('/about', function(req, res){
	res.render('about');
});

//register user
router.post('/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	//validation
	req.checkBody('name', 'name is required').notEmpty();
	req.checkBody('email', 'email is required').notEmpty();
	req.checkBody('email', 'email is not valid').isEmail();
	req.checkBody('username', 'username is required').notEmpty();
	req.checkBody('password', 'pass is required').notEmpty();
	req.checkBody('password2', 'pass do not match').equals(req.body.password);

	var errors = req.validationErrors();
	
	if(errors){
		console.log("error in register");
		res.render('register', {
			errors:errors
		});
	} 
	else{
		var query = {email: email};
		User.findOne(query, function(err, user){
			if(err) throw err;
			if(user){
				req.flash('error_msg','Email already exists!');
				res.render('register', {
					errors:errors,
					error_msg: req.flash('error_msg')
				});
			}
			else{
				
				var newUser = new User({
					adminstatus: false,
					ustatus: false,
					name: name,
					email: email,
					username: username,
					password: password
				});

				User.createUser(newUser, function(err, user){
					if(err) throw err;
					console.log("user profile:: "+ user);

				});
				console.log("i registered but did NOT verify");
				req.flash('success_msg','please check your email!!');
				
				userMail = newUser.email;
				//adding to the mail list
				var maillist = [
  					userMail
				];

				adminFlag = false;
				initialID = newUser.id;
				var link = "http://localhost:5555/users/" + initialID;

				adminSecret = encrypt(initialID);
				adminDescret = decrypt(adminSecret);

				adminLink = "http://localhost:5555/users/admin/" + adminSecret;
				console.log("url: " + link);
				console.log("adminURL: " + adminLink);

				const output = `
					    <p>Verify User!</p>
					    <h3>Contact Details</h3>
					    <ul>  
					      <li>Name: ${req.body.name}</li>
					      <li>Username: ${req.body.username}</li>
					      <li>Email: ${req.body.email}</li>
					    </ul>
					    <h3>Click this link to verify</h3>
					    <p>Please click this link to <a href= `+ link + `> verify </a> user </p>
					  `;

				let transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
					    user: 'demo@demo.com', // user email. replace demo@demo.com, make sure to keep security to minimum e.g. for gmail, allow less secure app access	
					    pass: 'pass'  // password. replace pass. recommended to use an api key instead
					},
				});

				// setup email data with unicode symbols
				let mailOptions = {
				  from: '"RS" <demo@demo.com>', // sender address
				  to: maillist, // list of receivers
				  subject: 'RS Verification', // Subject line
				  text: 'Hello world?', // plain text body
				  html: output//"<p>Please click this link to <a href=" + link + "> verify </a> user </p>" // html body
				};

				transporter.sendMail(mailOptions, (error, info) => {
				  if (error) {
				      return console.log(error);
				  }
				  console.log('Message sent to user: %s', info.messageId);   

				});

				res.redirect('/');

			}
		});
		
	}
	
});

//2-step verification is needed as this is a private organization. not everyone can register freely, hence the interference of an admin is necessary.
//step#1: user registers. a verification email is sent to make sure the email is valid, has an active user. the verification email has a masked URL which when clicked, brings the user to the home page and awaits admin approval
//step#2: admin receives an email, and details(name, email) are sent as to who requested to register for the website. if admin approves, only then the account is created and user can be logged in.
//see the changes in data 
router.get('/:verid', function(req, res){
	console.log("im at :verID right now");

	var verificationID = req.params.verid; //id for user

	if(verificationID == initialID){
		console.log("in routes:");

		
		User.findByIdAndUpdate(initialID, { $set: { ustatus: true }}, {new: true},
							 function (err, result) {
  			if (err) {
  				console.log(err);
  				throw err;
  			}
  			console.log("verified!!! result:: " + result);

	  		req.flash('success_msg','Step 1 done! Please await verification from ADMIN');
				res.render('index', {
					errors:err,
					success_msg: req.flash('success_msg')
				});
		});
			//adding second step auth
		let transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			    user: 'demo@demo.com', // user mail. replace it
			    pass: 'pass'  // password. replace it
			},
		});
		let mailOptionsAdmin = {
		  from: '"RoboSUST" <demo@demo.com>', // sender address
		  to: 'admin@demo.com', // receiver admin for 2nd step verification
		  subject: 'RoboSUST Verification', // subject line
		  text: 'Hello World?', // plain text body
		  html: "<p>Please click this link to <a href= "+ adminLink + "> verify </a> user </p>"//"<p>Please click this link to <a href=" + link + "> verify </a> user </p>" // html body
		};
		transporter.sendMail(mailOptionsAdmin, (error, info) => {
		  if (error) {
		      return console.log(error);
		  }
		  console.log('Message sent to admin: %s', info.messageId);  
;
		});

	}

	else{
		res.render('error');
	}

})

router.get('/admin/:veradmin', function(req, res){
	var verifyAdmin = req.params.veradmin;
	var localID = decrypt(verifyAdmin);

	User.findByIdAndUpdate(localID, { $set: { adminstatus: true }}, {new: true},
								 function (err, result) {
	  			if (err) {
	  				console.log(err);
	  				throw err;
	  			}
	  			console.log("ADMIN verified result:: " + result);
	  			//res.send("done");
		  		req.flash('success_msg','User has been verified');
					res.render('index', {
						errors:err,
						success_msg: req.flash('success_msg')
					});
			});
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    //we are gonna call function in the model
    User.getUserByUsername(username, function(err, user){
    	if(err) throw err;
    	if(!user){
    		return done(null, false, {message: 'Unknown User'});
    	}

    	if(user.ustatus == false && user.adminstatus == false){
    		console.log('im here at login strategy unverified');
    		return done(null, false, {message: 'Unverified User: Please verify your email'});
    		
    	}

    	if(user.ustatus == true && user.adminstatus == false){
    		console.log('im here at login strategy, adminstatus');
    		return done(null, false, {message: 'Your account has not been verified by ADMIN'});
    		
    	}

    	if(user.ustatus == true && user.adminstatus == true){
    		console.log("im here at verified user, but pass didn't match yet");
    	User.comparePassword(password, user.password, function(err, isMatch){
    		if(err) throw err;
    		if(isMatch){
    			console.log("is matched!!");
    			return done(null, user);
    		} else{
    			console.log("pass not valid yo");
    			return done(null, false, {message: 'Invalid Password'})
    		}
    	})
	}
    })
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserbyId(id, function(err, user) { //a function created inside the model
    done(err, user);
  });
});

router.post('/login',
	passport.authenticate('local', { successRedirect: '/users/personal', failureRedirect: '/', failureFlash: true }),
	function (req, res) {
		console.log("here at redirect");
		res.redirect('/');
		//res.send('hello');
		req.flash('success_msg', 'You are logged in');
	});

module.exports = router;

