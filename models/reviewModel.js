const mongoose = require('mongoose');
const Tour = require('./tourModel');

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
  // this.populate({
  //   path: 'user',
  //   select: 'name photo',
  // }).populate({
  //   path: 'tour',
  //   select: 'name',
  // });

  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

// statics mathod used with model like Review.calAverageRating();
reviewSchema.statics.calcAverageRating = async function (tourId) {
  // this point to Modal (Review)
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        numRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsAverage: stats[0].avgRating,
      ratingsQuantity: stats[0].numRating,
    });
  }
};

// document middleware
reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.tour);
});

// query middleware
// update rating average after update/delete tour review
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne().clone(); // clone for running query twice and getting review doc before update for tour id used in below post middleware
  console.log('review', this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.tour); // this.r.tour is get in above pre middleware
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
