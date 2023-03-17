const Tour = require('./../models/tourModel');

exports.getTour = async (request, response) => {
  try {
    // 1) get the data for requested tour with guides and review
    const tour = Tour.findOne({ slug: request.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });

    response.status(200).render('tour', {
      tour,
    });
  } catch (error) {}
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
