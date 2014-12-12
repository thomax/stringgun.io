var express = require('express');
var moment = require('moment');
var router = express.Router();
var targets = require('./mock-data/targets.json');


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

router.post('/:target', function (req, res) {
  console.log('post', req.params.target);

});


module.exports = router;
