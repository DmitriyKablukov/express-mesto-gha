const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const { errors, celebrate, Joi } = require('celebrate');
const userController = require('./controllers/users');
const auth = require('./middlewares/auth');
const { isLink } = require('./utils/isLink');
const NotFoundError = require('./errors/not-found');
const { DEFAULT_ERROR_CODE } = require('./utils/constants');

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});
app.use(limiter);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  userController.login,
);

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
      avatar: Joi.string().pattern(isLink),
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  userController.createUser,
);

app.use(auth);
app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.use('*', (req, res, next) => {
  next(new NotFoundError('Ошибка в написании пути'));
});

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = DEFAULT_ERROR_CODE, message } = err;
  res.status(statusCode).send({
    message: statusCode === DEFAULT_ERROR_CODE
      ? 'На сервере произошла ошибка'
      : message,
  });
  next(err);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
