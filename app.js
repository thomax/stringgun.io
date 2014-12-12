require("es6-shim");
var express = require('express');
var app = express();
var routes = require('./routes/index');
var path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use('/', routes);


module.exports = app;
