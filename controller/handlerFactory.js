const AppError = require('./../utils/appError');

exports.deleteOne = (Model) => {
  return async (request, response, next) => {
    try {
      const doc = await Model.findByIdAndDelete(request.params.id);

      if (!doc) next(new AppError('no document found with this id', 404));

      response.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (error) {
      error.statusCode = 404;
      error.isOperational = true;
      next(error);
    }
  };
};
