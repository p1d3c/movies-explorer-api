const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const routes = require('./routes/routes');
const { allowedCors, limiterSettings } = require('./utils/constants');

const { NODE_ENV, MONGODB_URL, PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

app.use(express.json());

app.use(
  cors({
    origin: allowedCors,
  }),
);

app.use(rateLimit(limiterSettings));

app.use(routes);

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

async function handleDbConnect() {
  await mongoose.connect(NODE_ENV === 'production' ? MONGODB_URL : 'mongodb://localhost:27017/moviesdb', {
    useNewUrlParser: true,
    useUnifiedTopology: false,
  });
  console.log('Соединение с БД установлено');
  app.listen(PORT, () => {
    console.log(`Слушаю ${PORT} порт`);
  });
}

handleDbConnect();
