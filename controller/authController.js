const crypto = require('crypto');
const { promisify } = require('util');

const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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
      photo: request.body.photo,
      password: request.body.password,
      passwordConfirm: request.body.passwordConfirm,
      role: request.body.role,
      active: request.body.active,
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

    if (!currentUser)
      next(new AppError('no user belonging to this token', 401));

    // Check if the user changed the password  after the token issued
    if (currentUser.changedPasswordAfter(decode.iat)) {
      return next(
        new AppError(
          'user recently changed password! Please log in again.',
          401
        )
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

exports.restrictTo = function (...roles) {
  return (request, response, next) => {
    //
    if (!roles.includes(request.user.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = async (request, response, next) => {
  // 1) Get user based on posted email
  const user = await User.findOne({ email: request.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${request.protocol}://${request.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    response.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
};

exports.resetPassword = async (request, response, next) => {
  try {
    // 1) Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(request.params.token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
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

exports.updatePassword = async (request, response, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(request.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (
      !(await user.comparePassword(request.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = request.body.password;
    user.passwordConfirm = request.body.passwordConfirm;
    await user.save();
    // User.findByIdAndUpdate will NOT work as intended!

    // 4) Log user in, send JWT
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
