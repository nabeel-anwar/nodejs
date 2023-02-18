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

const tourSchema = new mongoos.Schema({
  name: {
    type: String,
    require: [true, 'tour must have a name'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    require: [true, 'tour must have a price'],
  },
  premium: {
    type: Boolean
  }
});

const Tour = new mongoos.model('Tour', tourSchema);

const tour = new Tour({
  name: 'The Dead Sea',
  price: 700,
  premium: true
});

tour
  .save()
  .then((el) => console.log(el))
  .catch((el) => console.log(el));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log('Server is started and listening on port 3000...');
});
