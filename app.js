const express = require('express');
const mongoose = require('mongoose');

mongoose
  .connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log('App connected');
  })
  .catch((err) => console.log(`App error ${err}`));

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '65748ef86891db80d24e606a',
  };
  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res) => res.status(404).send({ message: 'Ошибка в написании пути' }));

app.listen(3000, () => {
  console.log('App listening on port 3000');
});
