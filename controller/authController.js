const { promisify } = require('util');
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

    const token = signToken(newUser._id); //creating jwt token

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
    const user = await User.findOne({ email }).select('+password'); // password selection is false in model i.e explicitly select the password

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

exports.protect = async (request, response, next) => {
  try {
    // 1) check if the token is present in the header
    let token;
    if (
      request.headers.authorization &&
      request.headers.authorization.startsWith('bearer')
    ) {
      token = request.headers.authorization.split(' ')[1];
    }

    if (!token) {
      next(
        new AppError('you are not logged in. please login to continue', 401)
      );
    }

    // 2) Verify the token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if the user still exist
    const currentUser = await User.findById(decode.id);

    if(!currentUser) 
      next(new AppError("no user belonging to this token", 401));

    // Check if the user changed the password  after the token issued
      if (currentUser.changedPasswordAfter(decode.iat)) {
        return next(
          new AppError('user recently changed password! Please log in again.', 401)
        );
      }
    
      // GRANT ACCESS TO PROTECTED ROUTE
      request.user = currentUser;
    next();
  } catch (error) {
    error.statusCode = 404;
    error.isOperational = true;
    next(error);
  }
};
