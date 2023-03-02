const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');

const router = express.Router();

// router.param('id', tourController.checkId); param middleware

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopCheap, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

// .post(tourController.checkBody, tourController.createTour); chaining middleware

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;