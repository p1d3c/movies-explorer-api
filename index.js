const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes/routes');

const { NODE_ENV, MONGODB_URL } = process.env;

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

const allowedCors = [

];

app.use(express.json());

app.use(
  cors({
    origin: allowedCors,
  }),
);

app.use(routes);

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'На сервере произошла ошибка' : message });
  next();
});

async function handleDbConnect() {
  if (NODE_ENV === 'production') {
    await mongoose.connect(`${MONGODB_URL}`, {
      useNewUrlParser: true,
      useUnifiedTopology: false,
    });
    console.log('Соединение с БД установлено');
    app.listen(PORT, () => {
      console.log(`Слушаю ${PORT} порт`);
    });
  } else {
    await mongoose.connect('mongodb://localhost:27017/mestodb', {
      useNewUrlParser: true,
      useUnifiedTopology: false,
    });
    console.log('Соединение с БД установлено');
    app.listen(PORT, () => {
      console.log(`Слушаю ${PORT} порт`);
    });
  }
}

handleDbConnect();
