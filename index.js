require("es6-shim");
var express = require('express');
var app = express();
var path = require('path');
var routes = require('./routes');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', routes);


module.exports = app;
