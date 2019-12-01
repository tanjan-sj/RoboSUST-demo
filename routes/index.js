var express = require('express');
var router = express.Router();
var path = require('path');


//
router.get('/personal', ensureAuthenticated, function(req, res){
	//res.render('index'); //this is where we load the index file
	//res.sendFile('mit_edited.html', { root: path.join(__dirname, '../') });
});

router.get('/', function(req, res){
	//res.render('index'); //this is where we load the index file
	//res.sendFile('mit.html', { root: path.join(__dirname, '../') });
	res.render('index');
});


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg', 'you are not logged in');
		res.redirect('/');
	}
}
module.exports = router;
