const Tour = require('./../models/tourModel');

exports.getTour = (request, response) => {
  response.status(200).render('tour', {
    title: 'The Forest Hiker',
  });
};

exports.getOverview = async (request, response) => {
  try {
    const tours = await Tour.find();
    response.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  } catch (error) {
    next(error);
  }
};
