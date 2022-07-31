const express = require('express');
const {updatedUser, userLogin,getProfile, register } = require('../controller/userController');
const {authentication,authorization}= require('../middleware/auth')
const {createProduct,newUpdate,getProduct, getProductById,deleteProduct}=require('../controller/productController')
const router = express.Router();

router.post('/register', register);

router.get('/user/:userId/profile',authentication,authorization, getProfile);

router.post('/login', userLogin);

router.put('/user/:userId/profile',authentication,authorization, updatedUser);

router.post('/products', createProduct);

router.get('/products',getProduct)

router.get('/products/:productId',getProductById);

router.put('/products/:productId', newUpdate);

router.delete('/products/:productId',deleteProduct);









module.exports = router