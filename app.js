const fs = require('fs');
const express = require('express');
const { response } = require('express');

const app = express();
app.use(express.json());

app.use((request, response, next) => {
  console.log("Hello from the middleware");
  next();
});

app.use((request, response, next) => {
  request.requestTime = new Date().toISOString();
  next();
});

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (request, response) => {
  response.status(200).json({
    status: 'success',
    result: tours.length,
    requestedAt: request.requestTime,
    data: tours,
  });
};

const getTour = (request, response) => {
  const id = +request.params.id;
  const tour = tours.find((element) => element.id === id);

  if (!tour) {
    return response.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  response.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

const createTour = (request, response) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, request.body);
  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      response.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (request, response) => {
  if (+request.params.id > tours.length) {
    return response.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  response.status(200).json({
    status: 'success',
    data: {
      tour: 'Tours is updated',
    },
  });
};


const deleteTour = (request, response) => {
  if (+request.params.id > tours.length) {
    return response.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }

  response.status(204).json({
    status: 'success',
    data: null,
  });
};

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

app
.route('/api/v1/tours')
.get(getAllTours)
.post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const port = 3000;
app.listen(port, () => {
  console.log('Server is started and listening on port 3000...');
});
