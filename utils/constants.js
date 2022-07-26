const allowedCors = [

];

const limiterSettings = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
};

const SALT_ROUNDS = 10;
const MONGO_DUPLICATE_KEY = 11000;

const userErrorMessages = {
  emailConflict: 'Пользователь с такой почтой уже существует',
  userNotFound: 'Пользователь не найден',
  validationError: 'Переданы некоректные данные',
  unauthorized: 'Неправильные логин или пароль',
};

const movieErrorMessages = {
  validationError: 'Переданы некоректные данные',
  movieNotFound: 'Фильм не найден',
  forbiddenDelete: 'Чужие фильмы удалять нельзя',
};

const movieResponseMessages = {
  successDelete: 'Фильм удален',
};

module.exports = {
  allowedCors,
  limiterSettings,
  SALT_ROUNDS,
  MONGO_DUPLICATE_KEY,
  userErrorMessages,
  movieErrorMessages,
  movieResponseMessages,
};
