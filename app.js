const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const AppError = require('./utils/appError');
const errorHandler = require('./controller/errorController');

const app = express();

app.set('view engine', 'pug');
// app.set('views', './views');

// 1) Setting security headers
app.use(helmet());

// 2) Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP, please try again in a hour',
});

// Applying limit to same IP
app.use('/api', limiter);

app.use(express.json());

// Data Sanitize against NoSql query injection
app.use(mongoSanitize());

// Data Sanitize against XSS
app.use(xss());

//  prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

// Testing Middleware
app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

// Serving static files
app.use(express.static(`${__dirname}/public`));

// 3) Routes

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (request, response, next) => {
  // const err = new Error(`can't find ${request.originalUrl} on this server`);
  // err.status = "fail";
  // err.statusCode = 404;

  next(new AppError(`can't find ${request.originalUrl} on this server`, 404)); // calling next() with param jumps to error middleware
});

app.use(errorHandler); // Error handling middleware

module.exports = app;
