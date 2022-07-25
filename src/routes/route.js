const express = require('express');
const { shortUrl, urlCode, register } = require('../controller/userController');

const router = express.Router();

router.post('/register', register);


module.exports = router;