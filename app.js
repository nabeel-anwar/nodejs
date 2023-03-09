const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const AppError = require('./utils/appError');
const errorHandler = require('./controller/errorController');

const app = express();

// 2) Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in a hour',
});

app.use('/api', limiter);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

// 3) Routes

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (request, response, next) => {
  // const err = new Error(`can't find ${request.originalUrl} on this server`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`can't find ${request.originalUrl} on this server`, 404)); // calling next() with param jumps to error middleware
});

app.use(errorHandler); // Error handling middleware

module.exports = app;
