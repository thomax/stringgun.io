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

function getToken(targetName, callback) {
  db.get('target.'+targetName+'.token', function (err, token) {
    if (err) {
      return callback(null);
    }
    console.log('Got token! '+targetName, token);
    return callback(token);
  });
}

function targetExists(targetName, callback) {
  getToken(targetName, function(token) {
    if (token) {
      return callback(true);
    } else {
      return callback(false);
    }
  })
}

// known keys
// target.NAME.token
// target.NAME.string.TIMESTAMP

module.exports = {

  createNewTarget: function(callback) {
    var targetName = generateTargetName();
    var token = generateToken();
    var result = targetName+':'+token;
    console.log('createNewTarget', result);
    db.put('target.'+targetName+'.token', token, function (err) {
      if (err) {
        return console.log('Failed to create target'+targetName, err);
      }
      console.log('Created target', result);
      return callback(result);
    });
  },

  // db.createReadStream({
  //   start     : 'somewheretostart'
  //   , end       : 'endkey'
  //   , limit     : 100           // maximum number of entries to read
  //   , reverse   : true          // flip direction
  //   , keys      : true          // see db.createKeyStream()
  //   , values    : true          // see db.createValueStream()
  // })
  getStrings: function(targetName, callback) {
    targetExists(targetName, function(yes) {
      if (yes) {
        var prefix = 'target.'+targetName+'.string.';
        var strings = [];
        db.createReadStream({
          start : prefix,
          end   : prefix + '\xFF' // stop at the last key with the prefix
        })
        .on('data', function (string) {
          strings.push(string);
        })
        .on('error', callback)
        .on('close', function () {
          callback(strings);
        });
      } else {
        callback(false);
      }
    });
  },

  appendString: function(targetName, token, string, callback) {
    getToken(targetName, function (actualToken) {
      if (actualToken == token) {
        var key = 'target.'+targetName+'.string.'+moment().utc().valueOf();
        db.put(key, string, function (err) {
          if (err) {
            console.log('Failed to instert string in DB', string, err);
            return err;
          }
          return callback(key.split('.').pop());
        });
      } else {
        console.log('Fake token, no append today', string, err);
        return callback(false);
      }
    });
  }

};
