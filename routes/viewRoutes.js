const express = require('express');
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

module.exports = router;
