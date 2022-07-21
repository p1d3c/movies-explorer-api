const bcrypt = require('bcrypt');
const User = require('../models/user');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const Unauthorized = require('../errors/Unauthorized');
const { getToken } = require('../middlewares/auth');

const SALT_ROUNDS = 10;

module.exports.getMyProfile = async (req, res, next) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    res.status(200).send({ data: user });
  } catch (err) {
    next(err);
  }
};

module.exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true },
    );
    res.status(200).send({ data: updatedUser });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      return;
    }
    if (err.name === 'CastError') {
      next(new BadRequest('Пользователь не найден'));
      return;
    }
    next(err);
  }
};

module.exports.createUser = async (req, res, next) => {
  const {
    email, password, name,
  } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      next(new Conflict('Пользователь уже существует'));
      return;
    }
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    let newUser = await User.create({
      email, password: hash, name,
    });
    newUser = newUser.toObject();
    delete newUser.password;
    res.status(201).send({ data: newUser });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Переданы некоректные данные'));
      return;
    }
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      next(new Unauthorized('Неправильные логин или пароль'));
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      next(new Unauthorized('Неправильные логин или пароль'));
      return;
    }

    const token = await getToken(user._id);

    res.send({ token });
  } catch (err) {
    if (err.name === 'ValidationError') {
      next(new BadRequest('Неправильные логин или пароль'));
      return;
    }
    next(err);
  }
};
