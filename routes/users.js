var express = require('express');
var router = express.Router();

var db = require('../database');

/* GET users listing. */
router.get('/', requireLogin, function(req, res, next) {
  var user = req.session.user;
  db.getFirstAndLast(user[0].username, function(err, result) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.render('userhome', { title: 'User Home', auth: req.session.auth, result: result, admin: req.session.admin });
  });
});

router.get('/help', requireLogin, function(req, res, next) {
  if(req.query.type === 'admin'){
    res.render('help', {type: 'admin'});
  } else{
    res.render('help', {type: 'user'});
  }
});

router.get('/editprofile', requireLogin, function(req, res, next) {
  var user = req.session.user;
  db.selectProfile(user[0].username, function (err, profile) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    if(req.query.success){
      res.render('editprofile', {title: 'Edit Profile', username: profile, success: true});
    } else{
      res.render('editprofile', {title: 'Edit Profile', username: profile});
    }
  });
});

router.get('/changepassword', requireLogin, function(req, res, next) {
  res.header('Piece-of-Wynton-2', 'BJHww+foft4pCHZ78rIdELp+mLV2NioMx2Nnppq7vhg');
  res.render('changepassword', {title: 'Change Password', username: req.session.user});
});

router.post('/editprofile', requireLogin, function(req, res, next) {
  db.updateProfile(req, function (err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.redirect('editprofile?success=true');
  });
});


router.post('/changepassword', requireLogin, function(req, res, next) {
  var user = req.session.user;
  db.getPassword(user[0].username, req.body.oldpassword, function(err, found){
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    if(found.length > 0){
      db.updatePassword(req, function (err) {
          if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
      res.render('changepassword', {title: 'Change Password', success: true});
      });
    } else {
      res.render('changepassword', {title: 'Change Password', error: 'Current password does not match'});
    }
  });
});

function requireLogin(req, res, next) {
  var user = req.session.user;
  if(!req.session.auth) {
    res.redirect('../login');
  } else {
    db.getLocked(user[0].username, function(err, locked) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
      if(locked[0].locked === 1) {
        res.redirect('../logout');
      } else{
        console.log('AUTH PAGE: '+user[0].username+' -- '+req.path);
        next();
      }
    });
  }
};

module.exports = router;
