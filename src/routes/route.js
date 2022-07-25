const express = require('express');
const { userLogin,getProfile, register } = require('../controller/userController');

const router = express.Router();

router.post('/register', register);

router.get('/user/:userId/profile', getProfile);

router.post('/login', userLogin);


module.exports = router