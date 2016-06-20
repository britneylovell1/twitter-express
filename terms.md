### client
- something that makes (HTTP) requests

### server
- something that responds to (HTTP) requests

### request
- a formatted message sent over the network

#### HTTP verb
- an action

#### route
- NOT filepaths
- locator
- noun

### response
- a server's reply to a request (formatted message)
- headers, body, status

### request-response cycle
- always starts with client request
- always ends with one server response

### express middleware
- a function that handles responding to requests somehow
- of the form `function (req, res, next) {}`

### router
- used for deciding which handlers to use
- object that contains multiple middlewares
- a middleware module/layer

### request query string
- a way to pass data from client to server
- /example?x=123&this=that req.query = {x: 123, this: 'that'}

### request body
- it's the body of the HTTP request
- in express, accessible via request.body if you use body parsing middleware

### request params
- variable within the url
- app.get('/:prefix/:name:lastName'); /thing/foo req.params = {name: 'foo', prefix: 'thing'}