const mongoos = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoos
  .connect(process.env.DATABASE_LOCAL)
  .then(() => console.log('Connection Successfull'))
  .catch(() => {
    console.log('Connection Error!');
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server is started and listening on port 3000...');
});
