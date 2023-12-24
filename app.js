const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const userController = require('./controllers/users');
const auth = require('./middlewares/auth');

const { PORT = 3000, DB_URL = 'mongodb://127.0.0.1:27017/mestodb' } = process.env;

mongoose
  .connect('mongodb://localhost:27017/mestodb')
  .then(() => {
    console.log(`App connected ${DB_URL}`);
  })
  .catch((err) => console.log(`App error ${err}`));

const app = express();
app.use(bodyParser.json());
app.use(helmet());
app.use(express.json());

app.post('/signin', userController.login);
app.post('/signup', userController.createUser);

app.use('/users', auth, require('./routes/users'));
app.use('/cards', auth, require('./routes/cards'));

app.use('*', (req, res) => res.status(404).send({ message: 'Ошибка в написании пути' }));

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
