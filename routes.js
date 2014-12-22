var express = require('express');
var moment = require('moment');
var router = express.Router();

var data = require('./data/model');


function requestAccepts(req) {
  var param = req.query.type;
  if (param) return param;
  if (req.accepts('application/json')) return 'json';
  if (req.accepts('text/html')) return 'html';
  return 'plaintext';
}


router.get('/', function(req, res) {
  var serviceUrl = req.protocol+'://'+req.headers.host;
  res.render('index', {
    serviceUrl: serviceUrl
  });
});


router.post('/new', function (req, res) {
  data.createNewTarget(function (result) {
    var getUrl = req.protocol+'://'+req.headers.host+'/'+result.targetName;
    var urls = {
      getUrl: getUrl,
      postUrl: getUrl+':'+result.token
    }
    res.status(201).type('application/json').send(urls);
  });
});


router.get('/:target', function (req, res) {
  data.getStrings(req.params.target, function(result) {
    if (result === false) {
      return res.status(404).send('Target not found');
    }

    var responseType = requestAccepts(req);

    res.status(200);
    if (responseType == 'json') {
      return res.type('application/json').send(result);
    }

    if (responseType == 'html') {
      result = result.map(function (item) {
        return item.string;
      });
      return res.type('text/html').render('target', {strings: result});
    }

    var plainText = '';
    result.map(function (item) {
      plainText = plainText + item.string+'\n';
    });
    return res.type('text/plain').status(200).send(plainText);
  });
});


router.post('/:target', function (req, res) {
  var targetName = req.params.target.split(':')[0];
  var token = req.params.target.split(':')[1];
  var string = req.body.string;
  if (string.length > 512) {
    return res.status(400).send('String cannot exceed 512 characters');
  }
  data.appendString(targetName, token, string, function(result) {
    if (result === false) {
      return res.status(403).send('Token mismatch');
    }
    res.type('application/json').status(201).send(result);
  });
});


module.exports = router;
