const { request, response } = require('express');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopCheap = (request, response, next) => {
  request.query.limit = '5';
  request.query.sort = '-ratingsAverage,price';
  request.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (request, response) => {
  try {
    console.log(request.query);
    const features = new APIFeatures(Tour, request.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute Query
    const tours = await features.queryResult;

    // Send Response
    response.status(200).json({
      status: 'success',
      requestedAt: request.requestTime,
      length: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getTour = async (request, response) => {
  try {
    const tour = await Tour.findById(request.params.id);
    //Tour.findOne({key: value})

    response.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.createTour = async (request, response) => {
  // const newTour = new Tour(request.body);
  // newTour.save();

  try {
    const newTour = await Tour.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.updateTour = async (request, response) => {
  try {
    const tour = await Tour.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });

    response.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.deleteTour = async (request, response) => {
  try {
    await Tour.findByIdAndDelete(request.params.id);

    response.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getTourStats = async (request, response) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: {
          avgPrice: 1,
        },
      },
      {
        $match: {
          _id: { $ne: 'easy' },
        },
      },
    ]);

    response.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};

exports.getMonthlyPlan = async (request, response) => {
  try {
    const year = request.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        },
      },
      {
        $group: {
          _id: {$month: "$startDates"},
          numOfTours: {$sum: 1},
          tours: {$push: "$name"}
        }
      },
      {
        $addFields: {
          month: "$_id"
        } 
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numOfTours: -1
        }
      }
    ]);

    response.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (error) {
    response.status(404).json({
      status: 'fail',
      message: error.message,
    });
  }
};
