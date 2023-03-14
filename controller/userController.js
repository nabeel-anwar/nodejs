const User = require('./../models/userModel');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = async (request, response, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (request.body.password || request.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = filterObj(request.body, 'name', 'email');

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
      request.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    response.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  }
};

exports.deleteMe = async (request, response, next) => {
  try {
    await User.findByIdAndUpdate(request.user.id, { active: false });

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

exports.createUser = (request, response) => {
  response.status(500).json({
    status: 'error',
    message: 'this route is not defined, please use /signup.',
  });
};
exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
