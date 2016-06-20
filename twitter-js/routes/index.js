'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  function respondWithAllTweets (req, res, next){
    var joinedTweets = 'SELECT Users.name, Tweets.content, Tweets.id FROM Users INNER JOIN Tweets ON Users.id = Tweets.userid';

    client.query(joinedTweets, function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', 
        tweets: tweets, 
        showForm: true 
      });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    var queryRequest = 'SELECT content FROM Tweets INNER JOIN Users ON Users.id = Tweets.userid WHERE name=$1';

    client.query(queryRequest, [req.params.username], function(err, result){
      if (err) return next(err); // pass errors to Express
      var tweetsForName = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsForName,
        showForm: true,
        username: req.params.username
      });
    }); 
  });

  // // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    var queryRequest = 'SELECT content FROM Tweets WHERE userid=$1';

    client.query(queryRequest, [req.params.id], function(err, result){
      if (err) return next(err); // pass errors to Express
      var tweetsWithThatId = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsWithThatId // an array of only one element ;-)
      });
    });
  });

  // // create a new tweet with existing name
  router.post('/tweets', function(req, res, next){
    var nameQuery = 'SELECT users.id FROM Users WHERE users.name=$1';
    var queryRequest1 = 'INSERT INTO Tweets (id, userId, content) VALUES ((LEN(id)+1), userId=$1, content=$2)';
    var returnedUserId;

    client.query(nameQuery, [req.params.name], function(err, result){
      var returnedUserId = result.rows;
    });

    client.query(queryRequest1, [returnedUserId[0], req.body.text], function(err, result){
      var newTweet = req.body.name
      io.sockets.emit('new_tweet', newTweet);
      res.redirect('/');
    });
  });

  // router.post('/tweets', function(req, res, next){
  //   var newTweet = tweetBank.add(req.body.name, req.body.text);
  //   io.sockets.emit('new_tweet', newTweet);
  //   res.redirect('/');
  // });

    // // create a new tweet with new name
  router.post('/tweets', function(req, res, next){
    var queryRequest1 = 'INSERT INTO Tweets (id, userId, content) VALUES (some_id, some_user_id, content=$1)'
    var queryRequest2 = 'INSERT INTO Users (id, name, pictureUrl) VALUES (some_id, name=$2, some_picture)'

    client.query(queryRequest1, [req.body.text, req.body.name], function(err, result){
      var newTweet = req.body.name
      io.sockets.emit('new_tweet', newTweet);
      res.redirect('/');
    });
  });

  return router;
}
