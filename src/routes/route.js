const express = require('express');
const {updatedUser, userLogin,getProfile, register } = require('../controller/userController');
const {authentication,authorization}= require('../middleware/auth')
const {createProduct,updateDetails,newUpdate,getProduct}=require('../controller/productController')
const router = express.Router();

router.post('/register', register);

router.get('/user/:userId/profile', getProfile);

router.post('/login', userLogin);

router.put('/user/:userId/profile',authentication,authorization, updatedUser);

router.post('/products', createProduct);

router.put('/products/:productId', newUpdate);


router.get('/products', getProduct);



module.exports = router