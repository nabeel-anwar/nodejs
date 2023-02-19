const Tour = require('./../models/tourModel');

exports.getAllTours = async (request, response) => {
  try {
    const tours = await Tour.find();

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

exports.deleteTour =  async (request, response) => {
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
