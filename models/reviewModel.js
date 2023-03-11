const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    require: [true, 'review can not be empty'],
  },
  rating: {
    type: Number,
    min: [1, 'Rating must above to 1'],
    max: [5, 'Rating must below to 5'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'review must belong to a user'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'review must belong to a tour'],
  },
});

// Query Middleware

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  }).populate({
    path: 'tour',
    select: 'name',
  });

  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
