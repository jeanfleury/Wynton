var express = require('express');
var router = express.Router();

var db = require('../database');


/* GET home page. */

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', auth: req.session.auth });
});

router.get('/images/', function(req, res, next) {
  res.render('error', {message: 'Piece of Wynton #5', error: '3O8w5vPX6mdLFIzButrHMRAKtM/8pCInCM+FDj5TfsKhOUCwxitdi3pGXjv7nffhKdQ=='});
});

router.get('/logs/', function(req, res, next) {
  res.render('error', {message: 'Error', error: '403 Forbidden'});
});

router.get('/archives', function(req, res, next) {
  db.getArchives(function (err, results) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

    res.render('archives', {title: 'Archives', results: results, auth: req.session.auth });
  });
});

router.get('/about', function(req, res) {
  db.getAboutPage(function(err, results) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    if(req.query.render){
      res.render(req.query.render, {results: results, auth: req.session.auth});
    } else {
      res.render('about', { title: 'About', results: results, auth: req.session.auth });
    }
  });
});

router.post('/editabout', function(req, res, next) {
  db.updateAbout(req.body, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.redirect('./about');
  });
});

router.get('/login', function(req, res) {
    res.header('X-Find-Me', 'Robots hold a sacred text with clues');
    res.render('login', { title: 'Login', auth: req.session.auth });
});

router.get('/register', function(req, res) {
    res.render('register', { title: 'Register', auth: req.session.auth });
});

router.get('/forgotpassword', function(req, res) {
    res.render('forgotpassword', { title: 'Forgot Password', auth: req.session.auth });
});

router.post('/forgotpassword', function(req, res) {
  db.getQuestionByUsername(req.body.username, function (err, user) {
    if(err){
      res.render('error', {message: 'SQL Error', error: err}); return;
    } else if(user.length > 0){
      if(user[0].username === 'SirWyntonAdmin'){
        res.render('error', {message: 'Error', error:'Admins must reset password via help desk.'});
      } else {
        req.session.user = user;
        res.render('securityquestion', {question: user[0].question, method: req.body.method});
      }
    } else {
      res.render('forgotpassword', {title: 'Forgot Password', error: 'Username not found!'});
    }
  });
})

router.get('/forgotusername', function(req, res) {
  res.render('forgotusername', {title: 'Forgot Username'});
});

router.post('/forgotusername', function(req, res) {
  db.getQuestionByEmail(req.body.email, function (err, user) {
    if(err){
      res.render('error', {message: 'SQL Error', error: err}); return;
    } else if(user.length > 0){
      req.session.email = req.body.email;
      res.render('securityquestion', {question: user[0].question, email: req.body.email, method: req.body.method});
    } else {
      res.render('forgotusername', {title: 'Forgot Username', error: 'Email not associated with any account.'});
    }
  });
});

router.post('/securityquestion', function(req, res) {
  if(req.query.method === 'email'){
    db.checkAnswerByEmail(req, function (err, result) {
      if(err){
        res.render('error', {message: 'SQL Error', error: err}); return;
      } else if(result.length > 0){
        res.render('resetcomplete', {method: req.query.method, result: result});
      } else {
        res.render('securityquestion', {question: req.body.question, method: req.query.method, error: 'One or more answers were incorrect!'});
      }
    });
  } else {
    db.checkAnswerByUsername(req, function (err, result) {
      if(err){
        res.render('error', {message: 'SQL Error', error: err}); return;
      } else if(result.length > 0){
        req.session.user = result;
        res.render('changepasswordnoconfirm');
      } else {
        res.render('securityquestion', {question: req.body.question, method: req.query.method, error: 'Answer was incorrect!'});
      }
    });
  }
});

router.post('/resetpassword', function(req, res) {
  db.updatePassword(req, function (err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    var user = req.session.user;
    db.unlockUser(user[0].username, function (err) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
      res.redirect('./login');
    });
  });
});

router.get('/search', function(req, res) {
    db.searchTitles(req.query.s, function (err, results) {
        if(err){
          res.render('error', {message: 'SQL Error', error: err}); return;
        } else if(results.length > 0){
          res.render('searchresults', {searchterm: req.query.s, results: results, auth: req.session.auth });
        } else {
          res.render('searchresults', {notfound: true, searchterm: req.query.s, auth: req.session.auth })
        }
    });
});

router.post('/registeruser', function(req, res) {
  db.selectProfile(req.body.username, function (err, user) {
    if(user.length > 0){
      res.render('register', {error: 'Username already in use!'});
    } else {
      db.registerUser(req.body, function (err) {
          if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

          res.render('login', {success: true});
      });
    }
  });
});

router.post('/login', function(req, res) {
  var uname = req.body.username;
  var loweruname = uname.toLowerCase();
  var pwd = req.body.password;
  if(loweruname.indexOf('sirwyntonadmin') > -1){
    db.safeLogin(req.body, function(err, user) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

      if(user.length === 0) {
        if(uname.indexOf('\'') > -1){
          res.render('login', {sqli: true, auth: req.session.auth});
        } else if (pwd.indexOf('\'') > -1){
          res.render('login', {sqli: true, auth: req.session.auth});
        } else {
          res.render('login', {error: 'Invalid username or password', auth: req.session.auth});
        }
      } else {
        if(user[0].locked === 0){
          req.session.user = user;
          req.session.auth = true;
            if(user[0].admin === 1){
              req.session.admin = true;
            } else {
              req.session.admin = false;
            }
            res.redirect('/users/');
        } else {
          res.render('login', {error: 'User account is locked', reason: user[0].lockreason});
        }
      }
    });
  } else {
    db.findUserLogin(req.body, function (err, user) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

      if(user.length === 0) {
        res.render('login', {error: 'Invalid username or password', auth: req.session.auth});
      } else {
        if(user[0].locked === 0){
          req.session.user = user;
          req.session.auth = true;
            if(user[0].admin === 1){
              req.session.admin = true;
            } else {
              req.session.admin = false;
            }
            res.redirect('/users/');
        } else {
          res.render('login', {error: 'User account is locked', reason: user[0].lockreason});
        }
      }
    });
  }
});

function requireLogin(req, res, next) {
  var user = req.session.user

  if(!req.session.auth || user[0].locked === 1) {
    res.redirect('/login');
  } else{
    console.log('AUTH PAGE: '+user[0].username+' -- '+req.path);
    next();
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

router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if(err){ res.render('error', {message: 'Error', error: err}); return; }
  });
  res.redirect('/login');
});

router.get('/helloworld', requireLogin, function(req, res) {
    res.render('helloworld', { title: 'Hello World!' });
});

module.exports = router;
