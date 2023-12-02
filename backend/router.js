var express = require('express');
var router = express.Router();
var controller = require('./controller')

router.post('/analyze', controller);

module.exports = router;
