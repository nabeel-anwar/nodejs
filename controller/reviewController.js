const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');

exports.getAllReview = async (request, response, next) => {
  try {
    const reviews = await Review.find();

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
