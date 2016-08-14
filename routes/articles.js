var express = require('express');
var router = express.Router();

var db = require('../database');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function (req, file, cb) {
    cb(null, unescape(file.originalname));
  }
});

var upload = multer({storage: storage});

router.get('/', function(req, res, next) {
  res.send('403 - Forbidden');
});

router.get('/readarticle', function(req, res, next) {
  db.addView(req, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
  });
  db.selectArticle(req, function (err, article) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
      if(article.length > 0){
        res.render('readarticle', {title: article[0].title, article: article, auth: req.session.auth });
      } else {
        res.render('error', {message: 'Error', error: 'Article does not exist!'});
      }
    });
});

router.get('/writearticle', requireLogin, function(req, res, next) {
  res.render('writearticle', {title: 'Write Article', user: req.session.user})
});

router.post('/writearticle', requireLogin, function(req, res, next) {
  db.insertArticle(req.body, req.session.user, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

    res.render('writearticle', {title: 'Write Article', user: req.session.user, success: true});
  });
});

router.get('/editarticle', requireLogin, function(req, res, next) {
  if(req.query.id){
    db.getArticleByID(req.query.id, function(err, article) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
      if(article.length > 0){
        res.render('editarticle', {article: article});
      } else {
        res.render('error', {message: 'Error', error: 'Article does not exist!'});
      }
    });
  } else{
    db.getArticles(req.session.user, function(err, results) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

      res.render('editarticlelist', {title: 'Edit Article', user: req.session.user, results: results});
    });
  }
});

router.post('/editarticle', requireLogin, function(req, res, next) {
  db.updateArticleByID(req.query.id, req.body, function(err, stack) {
    if(err){
      res.render('error', {message: 'SQL Error', error: err}); return;
    } else {
      db.getArticleByID(req.query.id, function(err, article) {
        if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
        if(article.length > 0){
          res.render('editarticle', {article: article});
        } else {
          res.render('error', {message: 'Error', error: 'Article does not exist!'});
        }
      });
    }
  });
});

router.get('/deletearticle', requireLogin, function(req, res, next) {
  var user = req.session.user;
  db.getArticleByUserAndId(req.query.id, user[0].username, function(err, article) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }

    if(article.length > 0){
      db.deleteArticleByUser(req.query.id, user[0].username, function(err) {
        if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
        res.redirect('../articles/editarticle');
      });
    } else {
      res.render('error', {message: 'Error', error: 'Cannot delete article'});
    }
  });
});

router.post('/savedraft', requireLogin, function(req, res, next) {
  var user = req.session.user;
  db.saveDraft(req.body, user[0].username, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.render('writearticle', {savedraft: true});
  });
});

router.get('/drafts', requireLogin, function(req, res, next) {
  var user = req.session.user;
  db.getDrafts(user[0].username, function(err, drafts) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    res.render('drafts', {drafts: drafts});
  });
});

router.get('/publishdraft', requireLogin, function(req, res, next) {
  db.publishDraft(req.query.id, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    var user = req.session.user;
    db.getDrafts(user[0].username, function(err, drafts) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
      res.render('drafts', {drafts: drafts, message: 'Draft successfully published!'});
    });
  });
});

router.get('/deletedraft', requireLogin, function(req, res, next) {
  db.deleteDraft(req.query.id, function(err) {
    if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
    var user = req.session.user;
    db.getDrafts(user[0].username, function(err, drafts) {
      if(err){ res.render('error', {message: 'SQL Error', error: err}); return; }
      res.render('drafts', {drafts: drafts, message: 'Draft successfully deleted!'});
    });
  });
});

router.get('/upload', requireLogin, function(req, res, next) {
  res.render('upload');
});

router.post('/upload', upload.single('article'), requireLogin, function(req, res, next) {
  console.log(req.file);
  console.log(req.body.folder);
  res.render('upload', {success: true});
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
