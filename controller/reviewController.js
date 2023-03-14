const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (request, response, next) => {
  if (!request.body.user) request.body.user = request.user.id;
  if (!request.body.tour) request.body.tour = request.params.tourId;

  next();
};

exports.getAllReview = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.createReview = factory.createOne(Review);

exports.UpdateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
