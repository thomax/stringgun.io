var express = require('express');
var moment = require('moment');
var router = express.Router();
var targets = require('./data/mock-targets');
var data = require('./data/model');

router.get('/', function(req, res) {
  res.render('index', {
    time: moment().calendar()
  });
});

router.get('/:target', function (req, res) {
  console.log('get', req.params.target);
  var targetObj = targets[req.params.target];
  if (targetObj) {
    res.render('target', {
      strings: targetObj.strings
    });
  } else {
    res.status(404).send('Target not found');
  }
});

router.post('/new', function (req, res) {
  console.log('post new');
  data.createNewTarget(function (result) {
    console.log('post new got', result);
    res.status(201).send(result);
  });
});

router.post('/:target', function (req, res) {
  console.log('post', req.body);
  var targetName = req.params.target.split(':')[0];
  var token = req.params.target.split(':')[1];
  data.appendString(targetName, token, req.body.string, function(result) {
    console.log('APPPENDED YEY', result);
  });
});


module.exports = router;
