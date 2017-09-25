const express = require('express');
const router = express.Router();

// delete account
router.post('/delete', function (req, res, next) {
  var text = "DELETE FROM users WHERE email = $1"
  var values = [req.user.email];

  req.conn.query( text, values, function (err, result) {
    if (err) {
      console.log(err);
      res.render('account-info', {dbError: "Could not delete, try again." })
    } else {
      res.render('index', {title:"A pleasent form app", subtitle:"Welcome back!" });
    }
  })
})

module.exports = router;
