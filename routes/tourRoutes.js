const express = require('express');
const tourController = require('./../controller/tourController');

const router = express.Router();

// router.param('id', tourController.checkId); param middleware

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
  
// .post(tourController.checkBody, tourController.createTour); chaining middleware

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;