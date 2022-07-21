const router = require('express').Router();
const { errors } = require('celebrate');
const userRouter = require('./users');
const movieRouter = require('./movies');
const { isAuthorized } = require('../middlewares/auth');
const NotFound = require('../errors/NotFound');
const { createUser, login } = require('../controllers/users');
const { requestLogger, errorLogger } = require('../middlewares/logger');
const { validateRegistration, validateAuthorization } = require('../utils/validations');

router.use(requestLogger);

router.post('/signup', validateRegistration, createUser);
router.post('/signin', validateAuthorization, login);
router.use(isAuthorized);
router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use('*', (req, res, next) => {
  next(new NotFound('Путь не найден'));
});

router.use(errorLogger);

router.use(errors());

module.exports = router;
