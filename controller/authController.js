const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

exports.signup = async (request, response, next) => {
  try {
    const newUser = await User.create({
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
      passwordConfirm: request.body.passwordConfirm,
    });

    const token = signToken(newUser._id);

    response.status(201).json({
      status: 'success',
      token,
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

exports.login = async (request, response, next) => {
  try {
    const { email, password } = request.body;

    // 1) check if email and password exists
    if (!email || !password)
      return next(new AppError('please provide email and password'), 400);

    // 2) check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password'); // password is false in model i.e explicitly select the password

    // 3) Compare the password "comparePassword is instance method defined in modal"
    if (!user || !(await user.comparePassword(password, user.password)))
      return next(new AppError('Invalid email and password'), 401);

    const token = signToken(user._id);

    response.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  }
};
