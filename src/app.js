const express = require('express');
const morgan = require('morgan');

const app = express();
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:8081',
};

app.use(cors(corsOptions));
const router = require('./routes');

app.use(morgan('dev'));

const PORT = process.env.PORT || 5001;

app.use('/api/v1', router);

app.get('*', (req, res) => {
  res.status(404).json({ message: 'no route found' });
});

app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);
});

module.exports = app;
