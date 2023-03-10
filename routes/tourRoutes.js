const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkId); param middleware

router.use('/:tourId/reviews', reviewRouter);
// router.route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopCheap, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

// .post(tourController.checkBody, tourController.createTour); chaining middleware

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
