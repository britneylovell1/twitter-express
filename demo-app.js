/*****
* A server listens on a port
* A server won't handle any requests unless you tell it to
*****/
// hyper-minimal
require('express')().listen(1234);
// better
var express = require('express');
var app = express();
var port = 1234;
var server = app.listen(port, function () {
	console.log('Awaiting orders on port', port);
});

/*****
* Express exposes the request and response objects through a callback
* If you don't send a response, the client hangs
*****/
var express = require('express');
var app = express();
app.get('/example', function (request, response) {
	console.log('Request keys:', Object.keys(request));
	console.log('Response keys:', Object.keys(response));
});

/*****
* The client decides what to do with the response
*****/
// in each case try `curl localhost:1234/example -i` versus localhost:1234/example in url bar of browser
// string -> html
app.get('/example', function (request, response) {
	response.send('Something of great importance, clearly');
});
// string (really, this time)
app.get('/example', function (request, response) {
  response.set('Content-Type', 'text/plain');
  response.send('Something of great importance, clearly');
});
// html
app.get('/example', function (request, response) {
	response.send('<div style="background:blue;">Something of great importance, clearly</div>');
});
// json
app.get('/example', function (request, response) {
	response.json({i: {am: 'json'}});
});

/*****
* Request handlers are specific to a verb and a route
* You can match all verbs with `app.all`
*****/
// try `curl localhost:1234/example -X GET` vs. `curl localhost:1234/example -X POST`
app.get('/example', function (request, response) {
	response.send('im a get request response');
});
app.post('/example', function (request, response) {
	response.send('im a post request response');
});
app.all('/', function (request, response) {
	response.send('im an anything request response');
});

/*****
* Routes are not filepaths
*****/
// a simple CR app
var dumbledores = [],
	id = 0;
app.get('/data', function (request, response) {
	response.json(dumbledores);
});
app.post('/data', function (request, response) {
	dumbledores.push({
		name: 'Dumbledore',
		id: id++
	});
	response.json(dumbledores[dumbledores.length - 1]);
});

/*****
* You can chain handlers with `next()`
* Every handler should always either `next()` or send a response
*****/
app.get('/athing', function (request, response, next) {
	console.log('firstly!');
	next(); // you need this! if you don't it hangs indefinitely
});
app.get('/athing', function (request, response) {
	response.send('finally!');
});
// independent
app.get('/anotherthing', function (request, response) {
	response.send('look ma no hands!');
});

/*****
* Order matters: handlers fire in the order in which they are registered
*****/
app.get('/something', function (request, response) {
	response.send('finally!');
});
app.get('/something', function (request, response, next) {
	console.log('firstly!');
	next();
});

/*****
* You can snowball data by attaching it to `request` or `response`
*****/
app.get('/santaclaus', function (request, response, next) {
	request.someProperty = 'magic';
	next();
});
app.get('/santaclaus', function (request, response) {
	response.send('how is this possible? ' + request.someProperty);
});

/*****
* Request data can be in the route and is accessible via `request.params`
* Request data can be in the query string and is accessible via `request.query`
* Request data can be in the payload and is accessible via `request.body`
*****/
// route fragment of request, `request.params`
app.get('/times2/:number', function (request, response) {
	var result = request.params.number * 2;
	response.json(result);
});
// query string of request, `request.query`
app.get('/times2', function (request, response) {
	var result = request.query.num * 2;
	response.json(result);
});
// you won't have `request.body` unless you use `bodyParser`
var bodyParser = require('body-parser');
app.use(bodyParser.json());
// payload of request, `request.body`
app.post('/times2', function (request, response) {
	var result = request.body.n * 2;
	response.json(result);
});

/*****
* `app.use` matches the route up to the next '/'
* `app.all` matches the the whole route exactly
* `app.use` will assume '/' as its first argument, if not given
*****/
app.use('/stuff', function (request, response) {
	response.send('hit the USE handler');
});
app.all('/stuff', function (request, response) {
	response.send('hit the ALL handler');
});
app.use(function (request, response, next) {
	console.log('I ran');
	next();
});

/*****
* `app.use` is useful for handler chaining
*****/
app.get('/sup', function (request, response) {
	response.send('nm, my hair is ' + request.myhair); // undefined
});
// remember: order matters
app.use(function (request, response, next) {
	request.myhair = 'fantastic';
	next();
});
app.get('/howisyourhair', function (request, response) {
	response.send(request.myhair);
});
app.get('/howisntyourhair', function (request, response) {
	response.send('it isnt not' + request.myhair);
});

/*****
* You can make your own middleware
*****/
function jsonBodyParser (request, response, next) {
	var allData;
	request.on('data', function (x) {
		allData = JSON.parse(x.toString());
	});
	request.on('end', function () {
		request.anything = allData;
		next();
	});
};
app.use(jsonBodyParser);
app.use(function (request, response, next) {
	console.log(request.anything);
	next();
});

/*****
* Routes are not filepaths
*****/
app.use(function (request, response) {
	var routeString = request.path;
	response.json(routeString.length);
});

/*****
* You can map routes to filepaths
*****/
app.use(function (request, response, next) {
	fs.readFile('.' + request.path, function (err, data) {
		if (err) next();
		else response.send(data);
	});
});
app.use(function (request, response, next) {
	response.send('some default thing');
});

/*****
* You can pass errors to `next`
* Error handlers are parallel to normal handlers
*****/
app.get('/roullette', function (request, response, next) {
	var n = Math.random();
	if (n > 0.5) response.send('phew!');
	else {
		var error = new Error();
		next(error);
	}
});
app.use(function (request, response, next) {
	console.log('normally, i would match');
	next();
});
// this is error handling middleware simply because it declares four arguments!
app.use(function (error, request, response, next) {
	console.log('sh*t happens');
	response.send(error);
});

/*****
* Routers modularize your request handling
* You must incorporate routers into your app with `app.use`
*****/
var birdRouter = express.Router();
app.use('/birds', birdRouter);
birdRouter.get('/hens', function (request, response, next) {
	response.send('cluck');
});
birdRouter.get('/crows', function (request, response, next) {
	response.send('caw');
});
// different example
var router = new express.Router();
router.get('/abc', function (request, response, next) {
	response.send('you hit the abc router');
});
app.use('/interesting', router);
