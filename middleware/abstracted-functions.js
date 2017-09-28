const bcrypt = require('bcrypt');
const validation = require('./validation')

function makeRandomString() {
  var string = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_+-=`,.<>/?;:'{}[]|";
  for (var i = 0; i <= 40; i++) {
    string += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  var string = bcrypt.hashSync(string, 10);
  return string;
}

function unhashPass(res, next, input, compare) {
    if (bcrypt.compareSync(input, compare)) {
      next();
    } else {
      res.render(thisPage, {dbError:'Password is incorrect.'})
    }
}

function doesRowExist() {
  return function(req, res, next){
    if (res.locals === 'does not exist') {
      res.render(thisPage, {dbError:'Email not found.'} )
    } else {
      next();
    }
  }
}


function dbError() {
  return function(req, res, next) {
    if (res.locals.err !== undefined) {
      err = res.locals.err;
      var error = validation.errTranslator(err.constraint);
      res.render(thisPage, {dbError: error})
    } else {
      next();
    }
  }
}


function endSession() {
  return function(req, res, next) {
    req.session.destroy(function(err) {
      if (err) {
        res.locals.err = err;
        console.log(err)
        next();
      } else {
        req.session = null;
        next();
      }
    })
  }
}

function isSessionTokenValid() {
  return function (req, res, next) {
    var nonce = res.locals.row.nonce
    var oldDate = new Date(res.locals.row.thetime);
    var oldTime = oldDate.getTime();
    var currentDate = new Date();
    var currentTime = currentDate.getTime();
    console.log(req.session.token, nonce, oldTime, currentTime)

    if (req.session.token === nonce && currentTime < oldTime + 120000) {
      res.locals.valid = true;
      console.log(res.locals.valid)
      next();
    } else {
      res.locals.valid = false;
      console.log(res.locals.valid)
      next();
    }
  }
}

// make the names consistent
