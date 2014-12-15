require("es6-shim");
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser')

var routes = require('./routes');

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set("view options", { layout: false });
app.set('view engine', 'jade');

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/', routes);

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});

module.exports = app;
