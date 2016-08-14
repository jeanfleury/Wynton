var express = require('express');
var router = express.Router();

var db = require('../database');

var fs = require('fs');

router.get('/', function(req, res, next) {
  res.send('403 - Forbidden');
});

router.get('/login', function(req, res, next) {
  res.render('adminlogin');
});

router.get('/lockbyusername', requireLogin, requireAdmin, function(req, res, next) {
  res.render('lockbyusername');
});

router.post('/lockbyusername', requireLogin, requireAdmin, function(req, res, next) {
  db.selectProfile(req.body.username, function(err, user) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    if(user.length > 0){
      db.lockWithReason(req.body.username, req.body.reason, function(err) {
        if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
        res.render('lockbyusername', {message: 'User locked successfully'});
      });
    } else {
      res.render('lockbyusername', {message: 'Username not found!'});
    }
  });
});

router.get('/listusers', requireLogin, function(req, res, next) {
  console.log(req.query);
  if(req.session.admin){
    db.getUsers(function(err, users) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

      res.render('listusers', {users: users});
    });
  } else {
    if(req.query.access === '1'){
      db.getUsers(function(err, users) {
        if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

        res.render('listusers', {users: users});
      });
    } else {
      res.render('error', {message: 'Access Control Error', error: 'Missing or incorrect "access" parameter'});
    }
  }
});

router.get('/edituser', requireLogin, requireAdmin, function(req, res, next) {
  db.getUser(req.query.id, function(err, user) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

    res.render('edituser', {user: user});
  });
});

router.post('/edituser', requireLogin, requireAdmin, function(req, res, next) {
  db.updateUser(req.query.id, req.body, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
  });
  db.getUser(req.query.id, function(err, user) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

    res.render('edituser', {user: user, success: true});
  });
});

router.get('/unlockuser', requireLogin, requireAdmin, function(req, res, next) {
  db.unlockUser(req.query.id, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
  });
    res.redirect('listusers');
});

router.get('/lockuser', requireLogin, requireAdmin, function(req, res, next) {
  console.log('LOCK USER GET');
  db.lockUser(req.query.id, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
  });
    res.redirect('listusers');
});

router.post('/lockuser', requireLogin, function(req, res, next) {
  console.log('LOCK USER POST');
  db.lockUser(req.body.id, function(err) {
    if(err){
      res.render('error', {message: 'SQL Error', error: err}); return;
    } else {
      if(req.body.id === 'SirWyntonAdmin'){
        var user = req.session.user;
        console.log('ADMIN USER HAS BEEN LOCKED -- '+user[0].username);
        res.render('error', {message: 'Admin Successfully Locked!', error: 'Congratulations! You\'ve successfully locked out the admin and ended the game!'});
      } else {
        db.getUsers(function(err, users) {
          if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

          res.redirect('listusers');
        });
      }
    }
  });
});

router.get('/articlestats', requireLogin, function(req, res, next) {
  db.getAllArticles(function(err, articles) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.render('articlestats', {articles: articles});
  });
});

router.get('/resetcount', requireLogin, function(req, res, next) {
  db.resetCount(req.query.id, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
  });
  db.getAllArticles(function(err, articles) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.redirect('../admin/articlestats');
  });
});

router.get('/deletearticle', requireLogin, requireAdmin, function(req, res, next) {
  db.deleteArticle(req.query.id, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
  });
  db.getAllArticles(function(err, articles) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.redirect('../admin/articlestats');
  });
});

router.get('/logs', requireLogin, requireAdmin, function(req, res, next) {
  fs.readFile('public/logs/logs.txt', function(err, data) {
    if(err){
      res.render('error', {message: 'Error', error: err});
    } else{
      res.render('logs', {data: data});
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

function requireAdmin(req, res, next) {
  var user = req.session.user;
  if(!req.session.admin) {
    res.redirect('/logout');
  } else {
    console.log('ADMIN PAGE: '+user[0].username+' -- '+req.path);
    next();
  }
};

module.exports = router;
