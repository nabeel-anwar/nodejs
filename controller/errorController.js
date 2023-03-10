const AppError = require('./../utils/appError');

const sendErrorDev = function (err, res) {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = function (err, res) {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('error 💥', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
};

const handleCastError = function (err) {
  const message = `invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateValue = function (err) {
  const message = `Duplicate value ${err.keyValue.name}: please use another value`;
  return new AppError(message, 400);
};

module.exports = (err, request, response, next) => {
  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, response);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateValue(error);
    if (err.name === 'ValidationError') error = new AppError(err.message, 400);
    if (err.name === 'JsonWebTokenError')
      error = new AppError(err.message, 401);
    if (err.name === 'TokenExpiredError')
      error = new AppError(
        'your session has been expired. please login again',
        401
      );

    sendErrorProd(error, response);
  }
};
