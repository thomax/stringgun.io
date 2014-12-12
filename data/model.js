var leveldb = require('level');
var moment = require('moment');
var db = leveldb('./data/stringgun.db');

var randomSource = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
var randomness = 30;

function random() {
  var result = [];
  var max = randomSource.length;
  for (var i = 0; i < randomness; i++) {
    result.push(randomSource.charAt(Math.floor(Math.random() * max)));
  }
  return result.join('');
}

// 3 fixed + 30 random characters
function generateTargetName() {
  return 'tar'+random();
}
function generateToken() {
  return 'tok'+random();
}

function getToken(targetName, cb) {
  db.get('target.'+targetName+'.token', function (err, token) {
    if (err) {
      return console.log('Failed to get target token'+targetName, err);
    }
    console.log('Got token!'+targetName, err);
    return cb(token);
  });
}

// known keys
// target.NAME.token
// target.NAME.string.TIMESTAMP

module.exports = {

  createNewTarget: function(cb) {
    var targetName = generateTargetName();
    var token = generateToken();
    var result = targetName+':'+token;
    console.log('createNewTarget', result);
    db.put('target.'+targetName+'.token', token, function (err) {
      if (err) {
        return console.log('Failed to create target'+targetName, err);
      }
      console.log('Created target', result);
      return cb(result);
    });
  },

  getStrings: function(targetName) {
    return getToken(targetName).then(function (token) {
      return db.get('target.'+targetName+'.strings', function (err, value) {
        if (err) {
          return console.log('Couldnt get strings for '+targetName, err);
        }
        console.log('name=' + value);
        return value || 'NONE';
      });
    });
  },

  appendString: function(targetName, token, string, cb) {
    getToken(targetName, function (actualToken) {
      console.log('appendString', targetName, string, token);
      if (actualToken == token) {
        var key = 'target.'+targetName+'.string.'+moment().utc().valueOf();
        console.log('appendString key', key);
        db.put(key, string, function (err) {
          if (err) {
            console.log('Failed append string', string, err);
            return null;
          }
          console.log('appended string to', key);
          return cb(key);
        });
      } else {
        console.log('Fake token, no append today', string, err);
        return null;
      }
    });
  }

};
