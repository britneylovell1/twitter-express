'use strict';
var express = require('express');
var router = express.Router();
var client = require('../db/index');

module.exports = function makeRouterWithSockets (io) {

  function respondWithAllTweets (req, res, next){
    var joinedTweets = 'SELECT Users.name, Tweets.content FROM Users INNER JOIN Tweets ON Users.id = Tweets.userid';

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
    console.log(req.params.id);
    console.log(queryRequest);

    client.query(queryRequest, [Number(req.params.id)], function(err, result){
      if (err) return next(err); // pass errors to Express
      var tweetsWithThatId = result.rows;
      res.render('index', {
        title: 'Twitter.js',
        tweets: tweetsWithThatId // an array of only one element ;-)
      });
    });
  });

  // router.get('/tweets/:id', function(req, res, next){
  //   var tweetsWithThatId = tweetBank.find({ id: Number(req.params.id) });
  //   res.render('index', {
  //     title: 'Twitter.js',
  //     tweets: tweetsWithThatId // an array of only one element ;-)
  //   });
  // });

  // // create a new tweet
  // router.post('/tweets', function(req, res, next){
  //   var newTweet = tweetBank.add(req.body.name, req.body.text);
  //   io.sockets.emit('new_tweet', newTweet);
  //   res.redirect('/');
  // });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
