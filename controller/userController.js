const User = require('./../models/userModel');

exports.getAllUsers = async (request, response, next) => {
  try {
    const users = await User.find();

    // Send Response
    response.status(200).json({
      status: 'success',
      requestedAt: request.requestTime,
      length: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  }
};

exports.getUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'this route is yet defined',
  });
};

exports.createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'this route is yet defined',
  });
};

exports.updateUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'this route is yet defined',
  });
};

exports.deleteUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'this route is yet defined',
  });
};
