const express = require('express');
const { shortUrl, urlCode, register } = require('../controller/userController');

const router = express.Router();

router.post('/register', register);

router.get('/user/:userId/profile', getProfile);


module.exports = router