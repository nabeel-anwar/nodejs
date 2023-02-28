const User = require('./../models/userModel');

exports.signup = async (request, response, next) => {
  try {
    const newUser = await User.create(request.body);

    response.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  }
};
