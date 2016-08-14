var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user : 'root',
  password : 'root',
  database : 'sys'
});

connection.connect();

module.exports = connection;

module.exports.searchTitles = function(searchTerm, callback) {
  var sql = 'SELECT * FROM articles WHERE draft=0 AND title=?';
  connection.query(sql, searchTerm, function(err, results) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, results);
  });
}

module.exports.registerUser = function(post, callback) {
  var sql = 'INSERT INTO users (email, username, password, fname, lname) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [post.email, post.username, post.password, post.fname, post.lname], function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.findUserLogin = function(post, callback) {
  var sql = 'SELECT * FROM users WHERE username=\''+post.username+'\' AND password=\''+post.password+'\'';
  connection.query(sql, post, function(err, user) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, user);
  });
}

module.exports.safeLogin = function(post, callback) {
  var sql = 'SELECT * FROM users WHERE username=? AND password=?';
  connection.query(sql, [post.username, post.password], function(err, user) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, user);
  });
}

module.exports.selectProfile = function(username, callback) {
  var sql = 'SELECT * FROM users WHERE username=?';
  connection.query(sql, username, function(err, profile) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, profile);
  });
}

module.exports.updateProfile = function(req, callback) {
  var user = req.session.user;
  var sql = 'UPDATE users SET email='+connection.escape(req.body.email)+',fname='+connection.escape(req.body.fname)+',lname='+connection.escape(req.body.lname)+',question='+connection.escape(req.body.question)+',answer='+connection.escape(req.body.answer)+' WHERE username=\''+user[0].username+'\'';
  connection.query(sql, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getQuestionByEmail = function(email, callback) {
  var sql = 'SELECT question FROM users WHERE email=?';
  connection.query(sql, email, function(err, question) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, question);
  });
}

module.exports.getQuestionByUsername = function(username, callback) {
  var sql = 'SELECT username, question FROM users WHERE username=?';
  connection.query(sql, username, function(err, question) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, question);
  });
}

module.exports.checkAnswerByUsername = function(req, callback) {
  user = req.session.user;
  var sql = 'SELECT * FROM users WHERE answer=? AND username=?';
  connection.query(sql, [req.body.answer, user[0].username], function(err, result) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, result);
  });
}

module.exports.checkAnswerByEmail = function(req, callback) {
  var sql = 'SELECT username FROM users WHERE (email=\''+req.body.email+'\' AND fname=\''+req.body.fname+'\' AND lname=\''+req.body.lname+'\' AND email=\''+req.body.email+'\')';
  connection.query(sql, function(err, result) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, result);
  });
}

module.exports.updatePassword = function(req, callback) {
  var user = req.session.user;
  var sql = 'UPDATE users SET password=\''+req.body.password+'\' WHERE username=\''+user[0].username+'\'';
  connection.query(sql, req.body, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getPassword = function(username, password, callback) {
  var sql = 'SELECT * FROM users WHERE username=\''+username+'\' AND password=\''+password+'\'';
  connection.query(sql, function(err, found) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, found);
  });
}

module.exports.selectArticle = function(req, callback) {
  var sql = 'SELECT * FROM articles WHERE id=?';
  connection.query(sql, req.query.id, function(err, article) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, article);
  });
}

module.exports.addView = function(req, callback) {
  var sql = 'UPDATE articles SET views = views + 1 WHERE id=?';
  connection.query(sql, req.query.id, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.insertArticle = function(post, user, callback) {
  var sql = 'INSERT INTO articles (title, author, content, category) VALUES (\''+post.title+'\', \''+user[0].username+'\', \''+post.text+'\', \''+post.category+'\')';
  connection.query(sql, post, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getArticles = function(user, callback) {
  var sql = 'SELECT * FROM articles WHERE author=?';
  connection.query(sql, user[0].username, function(err, results) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, results);
  });
}

module.exports.getArticleByID = function(id, callback) {
  var sql = 'SELECT * FROM articles WHERE id=?';
  connection.query(sql, id, function(err, article) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, article);
  });
}

module.exports.updateArticleByID = function(id, post, callback) {
  var sql = 'UPDATE articles SET title=\''+post.title+'\',category=\''+post.category+'\',content=\''+post.text+'\', draft=0 WHERE id='+id;
  connection.query(sql, id, function(err) {
    if(err) { console.log(err); callback(err); return err; }
    callback(false);
  });
}

module.exports.getUsers = function(callback) {
  var sql = 'SELECT * FROM users';
  connection.query(sql, function(err, users) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, users);
  });
}

module.exports.getArchives = function(callback) {
  var sql = 'SELECT * FROM articles WHERE author IS NOT NULL AND draft=0';
  connection.query(sql, function(err, results) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, results);
  });
}

module.exports.getUser = function(id, callback) {
  var sql = 'SELECT * FROM users WHERE username=?';
  connection.query(sql, id, function(err, user) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, user);
  });
}

module.exports.updateUser = function(id, post, callback) {
  var sql = 'UPDATE users SET username=\''+post.username+'\',email=\''+post.email+'\',password=\''+post.password+'\',admin='+post.admin+',locked='+post.locked+' WHERE username=\''+id+'\'';
  connection.query(sql, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.lockUser = function(id, callback) {
  var sql = 'UPDATE users SET locked=1 WHERE username=?';
  connection.query(sql, id, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.unlockUser = function(id, callback) {
  var sql = 'UPDATE users SET locked=0 WHERE username=?';
  connection.query(sql, id, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getAllArticles = function(callback) {
  var sql = 'SELECT * FROM articles';
  connection.query(sql, function(err, articles) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, articles);
  });
}

module.exports.resetCount = function(id, callback) {
  var sql = 'UPDATE articles SET views=0 WHERE id=?';
  connection.query(sql, id, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.deleteArticle = function(id, callback) {
  var sql = 'DELETE FROM articles WHERE id=?';
  connection.query(sql, id, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.deleteArticleByUser = function(id, author, callback) {
  var sql = 'DELETE FROM articles WHERE id=? AND author=?';
  connection.query(sql, [id, author], function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getArticleByUserAndId = function(id, author, callback) {
  var sql = 'SELECT * FROM articles WHERE id=? AND author=?';
  connection.query(sql, [id, author], function(err, article) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, article);
  });
}

module.exports.saveDraft = function(post, author, callback) {
  var sql = 'INSERT INTO articles (title, author, content, category, draft) VALUES (\''+post.title+'\', \''+author+'\', \''+post.text+'\', \''+post.category+'\', 1)';
  connection.query(sql, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getDrafts = function(author, callback) {
  var sql = 'SELECT * FROM articles WHERE author=\''+author+'\' AND draft=1';
  connection.query(sql, function(err, drafts) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, drafts);
  });
}

module.exports.publishDraft = function(id, callback) {
  var sql = 'UPDATE articles SET draft=0 WHERE id=?';
  connection.query(sql, id, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.deleteDraft = function(id, callback) {
  var sql = 'DELETE FROM articles WHERE id=?';
  connection.query(sql, id, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.lockWithReason = function(username, reason, callback) {
  var sql = 'UPDATE users SET locked=1, lockreason=\''+reason+'\' WHERE username=\''+username+'\'';
  connection.query(sql, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getAboutPage = function(callback) {
  var sql = 'SELECT * FROM about';
  connection.query(sql, function(err, results) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, results);
  });
}

module.exports.updateAbout = function(post, callback) {
  var sql = 'INSERT INTO about (id,title,name,bio,image) VALUES (1,'+connection.escape(post.title1)+','+connection.escape(post.name1)+','+connection.escape(post.bio1)+','+connection.escape(post.image1)+'),(2,'+connection.escape(post.title2)+','+connection.escape(post.name2)+','+connection.escape(post.bio2)+','+connection.escape(post.image2)+'),(3,'+connection.escape(post.title3)+','+connection.escape(post.name3)+','+connection.escape(post.bio3)+','+connection.escape(post.image3)+') ON DUPLICATE KEY UPDATE title=VALUES(title),name=VALUES(name),bio=VALUES(bio),image=VALUES(image)';
  connection.query(sql, function(err) {
    if(err) { console.log(err); callback(err); return; }
    callback(false);
  });
}

module.exports.getLocked = function(username, callback) {
  var sql = 'SELECT locked FROM users WHERE username=?';
  connection.query(sql, username, function(err, locked) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, locked);
  });
}

module.exports.getFirstAndLast = function(username, callback) {
  var sql = 'SELECT fname, lname FROM users WHERE username=?';
  connection.query(sql, username, function(err, result) {
    if(err) { console.log(err); callback(err); return; }
    callback(false, result);
  });
}
