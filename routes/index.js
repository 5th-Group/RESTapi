var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const title = 'Cum zone'
  res.render('index', {title})
});


// Getting all
router.get('/')

module.exports = router;
