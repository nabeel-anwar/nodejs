const mongoos = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// uncaught exception for synchronous code
process.on('uncaughtException', error => {
  console.log(error.name, error.message);
  console.log("UNCAUGHT REJECTION APP SHUTTING DOWN");

    process.exit(1);
})

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoos
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log('DB Connection Successful'))
  .catch(() => {
    console.log('Connection Error!');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log('Server is started and listening on port 3000...');
});


// unhandled exception for asynchronous code
process.on('unhandledRejection', error => {
  console.log(error.name, error.message);
  console.log("UNHANDLED REJECTION APP SHUTTING DOWN");

  server.close(() => {
    process.exit(1);
  })
})
