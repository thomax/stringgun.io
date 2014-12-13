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
  res.render('index', {
    time: moment().calendar()
  });
});


router.get('/:target', function (req, res) {
  console.log('get', req.params.target);

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


router.post('/new', function (req, res) {
  console.log('AA', req);
  data.createNewTarget(function (result) {
    var getUrl = req.protocol+'://'+req.headers.host+'/'+result.targetName;
    var urls = {
      getUrl: getUrl,
      postUrl: getUrl+':'+result.token
    }
    res.status(201).type('application/json').send(urls);
  });
});


router.post('/:target', function (req, res) {
  console.log('post', req.body);
  var targetName = req.params.target.split(':')[0];
  var token = req.params.target.split(':')[1];

  data.appendString(targetName, token, req.body.string, function(result) {
    if (result === false) {
      res.status(403).send('Token mismatch');
    } else
    if (result.indexOf('Error') > -1) {
      res.status(500).send('Internal error');
    }
    res.status(201).send(result);
  });
});


module.exports = router;
