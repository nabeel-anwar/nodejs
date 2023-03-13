const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.getAllReview = async (request, response, next) => {
  try {
    const filter = {};
    if (request.params.tourId) filter.tour = request.params.tourId;

    const reviews = await Review.find(filter);

    response.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (error) {
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  }
};

exports.createReview = async (request, response, next) => {
  try {
    if (!request.body.user) request.body.user = request.user.id;
    if (!request.body.tour) request.body.tour = request.params.tourId;
    const newReview = await Review.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (error) {
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  }
};

exports.deleteReview = factory.deleteOne(Review);
